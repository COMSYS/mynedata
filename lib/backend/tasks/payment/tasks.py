""" This module wraps all user management functionalities from
    storage.user.py in celery tasks.

    All functionality is encapsulated in the corresponding backend
    module. """

import copy
import logging
from decimal import Decimal

import celery

from lib.backend.tasks.query.tasks import retrieve_query, process_queries, process_query
from lib.backend import database as db
from lib.config import Configuration
from lib.data_structures.base_object import SqlAlchemyException
from lib.data_structures import QueryState
from lib.data_structures import enums
from lib.data_structures import PaymentMethod
from lib.data_structures import Query_Db
from lib.data_structures import QueryUser
from lib.data_structures import QueryUserMapping
from lib.data_structures import Txid
from lib.data_structures import User
from lib.backend.payments import BitcoinConnector
from lib.backend.payments.authproxy import JSONRPCException


if not Configuration.initialized:
    Configuration.initialize()


def add_data_to_database(data):
    """ This function enables to commit data to the database
        without repeating the following three lines in every
        set-function."""

    session = db.get_db_session()
    session.add(data)
    session.commit()
    session.close()


""" Query
    query related tasks:
    - register_query: register query in for processing, create query reply
    - process_query: parse query, select and inform users
    - get_queries: return queries concerning a specific user
    - set_consent: set consent for user """


@celery.shared_task
def get_payment_info(proc_id, query_id):
    """ Retrieves the necessary information for the processor to be
        able to pay the query """
    result = {}
    result['success'] = False
    session = db.get_db_session()
    # check if query is ready to be paid
    try:
        query = session.query(Query_Db).filter_by(processor_id=proc_id, query_id=query_id).one_or_none()
    except SqlAlchemyException.MultipleResultsFound:
        if Configuration.test_mode:
            logging.exception("Ambiguous query found!")
        query = None
    if query is None:
        session.rollback()
        session.close()
        error = {}
        error['code'] = enums.Error.QUERY_NOT_IN_DB
        error['message'] = 'query not in DB'
        result['error'] = error
        return result
    if query.state is QueryState.PAID:
        session.close()
        error = {}
        error['code'] = enums.Error.QUERY_ALREADY_PAID
        error['message'] = 'query already paid'
        result['error'] = error
        return result
    if query.state is not QueryState.COMPLETED:
        session.close()
        error = {}
        error['code'] = enums.Error.QUERY_NOT_READY
        error['message'] = 'query not ready yet'
        result['error'] = error
        return result
    else:
        # depending on chosen payment mode
        if Configuration.payment_mode is PaymentMethod.NONE:
            session.close()
            result['success'] = True
            resp = dict()
            resp['note'] = 'Query did not require payment.'
            result['response'] = resp
            return result
        elif Configuration.payment_mode is PaymentMethod.BITCOIN_DIRECT:
            # retrieve users btc addresses
            try:
                users = session.query(QueryUser).filter_by(proc_id=proc_id, query_id=query_id, consent=QueryState.ACCEPTED).all()
            except Exception as message:
                if Configuration.test_mode:
                    logging.exception("An error occured: %s" % message)
                session.rollback()
                session.close()
                error = {}
                error['code'] = enums.Error.QUERY_NOT_IN_DB
                error['message'] = 'query_not in DB'
                result['error'] = error
                return result
            btc_addresses = list()
            for u in users:
                try:
                    btc_addresses.append(session.query(User).filter_by(user_id=u.user_id).one().btc_address)
                except Exception as message:
                    if Configuration.test_mode:
                        logging.exception("An error occured: %s" % message)
                    session.close()
                    error = {}
                    error['code'] = enums.Error.USER_NOT_IN_DB
                    error['message'] = 'user not in db'
                    result['error'] = error
                    return result
            session.close()
            result['success'] = True
            resp = {}
            resp['addr'] = btc_addresses
            resp['price'] = query.price
            result['response'] = resp
            return result
        # multiple addresses
        elif Configuration.payment_mode is PaymentMethod.BITCOIN_QUERY_BASED:
            session.close()
            result['success'] = True
            resp = {}
            resp['price'] = query.price
            resp['addr'] = query.address
            result['response'] = resp
            return result
        else:
            result['error'] = 'NOT IMPLEMENTED'
            return result


@celery.shared_task
def set_payment_state(proc_id, query_id):
    """ Update state of a query's payment. """
    session = db.get_db_session()
    result = {}
    result['success'] = False

    try:
        query = session.query(Query_Db).filter_by(processor_id=proc_id, query_id=query_id).one_or_none()
    except SqlAlchemyException.MultipleResultsFound:
        if Configuration.test_mode:
            logging.exception("Ambiguous query found!")
        query = None
    if query is None:
        session.rollback()
        session.close()
        error = {}
        error['code'] = enums.Error.QUERY_NOT_IN_DB
        error['message'] = 'query not in DB'
        result['error'] = error
        return result
    if query.state in [QueryState.PAID, QueryState.ACCEPTED, QueryState.PENDING, QueryState.ABORTED, QueryState.PROCESSING]:
        session.close()
        return retrieve_query(proc_id, query_id, True)
    if query.state is QueryState.COMPLETED:
        query.state = QueryState.PAID
        session.commit()
        session.close()
        return retrieve_query(proc_id, query_id, True)
    error = {}
    error['code'] = enums.Error.UNDEFINED
    error['message'] = 'internal server error'
    result['error'] = error
    return result


@celery.shared_task
def check_payment(proc_id, query_id, transaction_id, recalc):
    """ Check status of a query's payment. """
    session = db.get_db_session()
    result = {}
    result['success'] = False
    try:
        query = session.query(Query_Db).filter_by(processor_id=proc_id, query_id=query_id).one_or_none()
    except SqlAlchemyException.MultipleResultsFound:
        if Configuration.test_mode:
            logging.exception("Ambiguous query found!")
        query = None
    if query is None:
        session.rollback()
        session.close()
        error = {}
        error['code'] = enums.Error.QUERY_NOT_IN_DB
        error['message'] = 'query not in DB'
        result['error'] = error
        return result
    if query.state in [QueryState.PAID, QueryState.ACCEPTED, QueryState.PENDING, QueryState.PROCESSING, QueryState.ABORTED]:
        if recalc and (query.state != QueryState.PROCESSING) and (query.state != QueryState.ABORTED):
            process_query(query.as_dict())
            query.state = QueryState.PAID
            session.commit()
        session.close()
        return retrieve_query(proc_id, query_id, True)
    if query.state is QueryState.COMPLETED:
        # check if payment has been done

        if Configuration.payment_mode is PaymentMethod.NONE:
            query.state = QueryState.PAID
            session.commit()
            session.close()
            return retrieve_query(proc_id, query_id, True)
        elif Configuration.payment_mode is PaymentMethod.BITCOIN_DIRECT:
            # perform transaction check
            if transaction_id is not None:
                if check_direct_pay(proc_id, query_id, transaction_id):
                    query.state = QueryState.PAID
                session.commit()
                session.close()
                return retrieve_query(proc_id, query_id, True)

            else:
                session.close()
                return retrieve_query(proc_id, query_id, True)
        elif Configuration.payment_mode is PaymentMethod.BITCOIN_QUERY_BASED:
            btc_addr = query.address
            amount = 100000000 * BitcoinConnector.auth_proxy.getreceivedbyaddress(btc_addr, 1)
            if amount >= query.price:
                query.state = QueryState.PAID
                session.commit()
                session.close()
                create_mapping(proc_id, query_id)
                update_balance(query_id, proc_id)
                add_txids()
                return retrieve_query(proc_id, query_id, True)
            else:
                session.close()

                return retrieve_query(proc_id, query_id, True)
        else:
            session.close()
            error = "NOT IMPLEMENTED"
            result['error'] = error
            return result
    else:
        error = {}
        error['message'] = query.state
        error['code'] = enums.Error.QUERY_NOT_RETRIEVABLE
        result['error'] = error
        session.close()
        return result


def add_txids():
    """ Add txids to QueryDB. Creating a Mapping between Querys and TXIDS """
    # add every transaction which is confirmed by at least 1 block to the db
    session = db.get_db_session()
    transactions = BitcoinConnector.auth_proxy.listreceivedbyaddress(1)
    querys = session.query(Query_Db).all()
    bitcoin_addresses = []
    # creates a triple (btcAddress, queryID, processorID)
    for i in querys:
        triple = i.address, i.query_id, i.processor_id
        bitcoin_addresses.append(triple)
    transaction_list = []
    # extend the triple to a quadruple with (btcAddress, queryID, processorID, txID)
    for i in transactions:
        for j in bitcoin_addresses:
            if i['address'] in j[0]:
                quadruple = j[0], j[1], j[2], i['txids'].pop()
                transaction_list.append(quadruple)
    # checks if mapping already exists. otherwise create new mapping
    for j in transaction_list:
        existing = False
        mapping = session.query(Txid).all()
        if not len(mapping) == 0:
            for x in mapping:
                if x.query_id == j[1] and x.tx_id == j[3]:
                    existing = True

            if not existing and len(transaction_list) != 0:
                txid = Txid(tx_id=j[3], query_id=j[1], proc_id=j[2])
                session.add(txid)
                session.commit()
                session.close()
        else:
            txid = Txid(tx_id=j[3], query_id=j[1], proc_id=j[2])
            session.add(txid)
            session.commit()
            session.close()
    session.close()


def check_direct_pay(proc_id, query_id, transaction_id):
    """ Achims Code. Check if all users of the query have been included as outputs in the given transaction and received the corred amount """
    session = db.get_db_session()
    query = session.query(Query_Db).filter_by(processor_id=proc_id, query_id=query_id).one()
    # retrieve users btc addresses
    try:
        users = session.query(QueryUser).filter_by(proc_id=proc_id, query_id=query_id, consent=QueryState.ACCEPTED).all()
    except Exception as message:
        if Configuration.test_mode:
            logging.exception("An error occured: %s" % message)
        session.rollback()
        session.close()
        return False
    btc_addresses = list()
    for u in users:
        try:
            btc_addresses.append(session.query(User).filter_by(user_id=u.user_id).one().btc_address)
        except Exception as message:
            if Configuration.test_mode:
                logging.exception("An error occured: %s" % message)
            session.close()
            return False
    details = []
    try:
        transaction = BitcoinConnector.auth_proxy.gettransaction(transaction_id)
    except JSONRPCException as message:
        if Configuration.test_mode:
            logging.exception("An error occured: %s" % message)
        return False
    for j in transaction['details']:
        details.append(j)
    # amount evers user receives
    per_user = (Decimal(0.00000001) * Decimal((query.price / len(btc_addresses)))).quantize(Decimal("0.0000001"))
    # check if per_user was paid to each user
    details.sort(key=lambda tup: tup['address'])
    btc_addresses.sort()
    index = 0
    counter = 0
    for i in details:
        while btc_addresses[index] < i['address'] and index < len(btc_addresses) - 1:
            index += 1
        if i['address'] == btc_addresses[index]:
            if i['amount'] >= per_user:
                counter += 1
    return counter >= len(btc_addresses)


def update_balance(query_id, proc_id):
    """ Update funds received to pay off a query. """
    session = db.get_db_session()
    try:
        query_users = session.query(QueryUser).filter_by(proc_id=proc_id, query_id=query_id, consent=QueryState.ACCEPTED).all()
        users = list()
        for u in query_users:
            users.append(session.query(User).filter_by(user_id=u.user_id).one())
    except Exception as message:
        if Configuration.test_mode:
            logging.exception("An error occured: %s" % message)
        session.rollback()
        session.close()
        raise
    try:
        query = session.query(Query_Db).filter_by(processor_id=proc_id, query_id=query_id).one()
    except Exception as message:
        if Configuration.test_mode:
            logging.exception("An error occured: %s" % message)
        session.rollback()
        session.close()
        raise
    for u in users:
        u.balance = u.balance + query.price / len(users)
    session.commit()

    result = {}
    result['success'] = True
    res = list()
    for u in users:
        user = session.query(User).filter_by(user_id=u.user_id).one()
        temp = {}
        temp['id'] = user.user_id
        temp['balance'] = user.balance
        temp['name'] = user.username
        res.append(temp)
    result['response'] = res
    session.close()
    return result


def create_mapping(proc_id, query_id):
    """ if query has been paid create a mapping to store which of the users have been paid when using the multiple addresses for pay_out apporach """
    if not (BitcoinConnector.initialized and BitcoinConnector.use_wallet):
        session = db.get_db_session()
        try:
            query_users = session.query(QueryUser).filter_by(proc_id=proc_id, query_id=query_id, consent=QueryState.ACCEPTED).all()
        except Exception as message:
            if Configuration.test_mode:
                logging.exception("An error occured: %s" % message)
            raise
        for u in query_users:
            mapping = QueryUserMapping(query_id=query_id, proc_id=proc_id, user_id=u.user_id, paid=0)
            session.add(mapping)
        session.commit()
        session.close()


@celery.shared_task(ignore_result=True)
def pay_out():
    """ Periodically check if users can be or want to be paid out, and do so accordingly. """
    process_queries()
    if Configuration.payment_mode is PaymentMethod.NONE:
        pass  # No payment required
    elif Configuration.payment_mode is PaymentMethod.BITCOIN_DIRECT:
        pass  # Direct pay used
    else:
        session = db.get_db_session()
        users = session.query(User).all()
        for u in users:
            amount = Decimal(0.00000001 * u.balance).quantize(Decimal("0.0000001"))
            if amount >= Configuration.payment_payout_threshold:
                if (BitcoinConnector.initialized and BitcoinConnector.use_wallet):
                    try:
                        txid = BitcoinConnector.auth_proxy.sendfrom("platform", u.btc_address, amount - Decimal("0.0001"))
                    except JSONRPCException as message:
                        if Configuration.test_mode:
                            logging.exception("An error occured: %s" % message)
                    u.balance = 0
                    session.commit()
                else:
                    query_ids = session.query(QueryUserMapping).filter_by(user_id=u.user_id).all()
                    inputs = []
                    change_address = []
                    input_counter = 1
                    unspent_transactions = BitcoinConnector.auth_proxy.listunspent()
                    left_on_address = []
                    for i in query_ids:
                        txid_all = session.query(Txid).filter(Txid.query_id == i.query_id).filter(Txid.proc_id == i.proc_id).all()
                        query = session.query(Query_Db).filter(Query_Db.query_id == i.query_id).filter(Query_Db.processor_id == i.proc_id).one()
                        for x in txid_all:
                            for y in unspent_transactions:
                                existent = False

                                if x.tx_id == y['txid']:
                                    if y['amount'] >= (Decimal((query.price / query.amount)) * Decimal(0.00000001)).quantize(Decimal("0.0000001")):

                                        txid = x

                                        left_on_address.append((txid.tx_id, y['amount'],
                                                                y['vout'], query.address))
                                        for z in inputs:
                                            if z['txid'] == txid.tx_id and z['vout'] == y['vout']:
                                                existent = True

                                        if not existent:

                                            if y['address'] == query.address:
                                                inputs.append(({"txid": txid.tx_id, "vout": y['vout'],
                                                                "scriptPubKey": y['scriptPubKey']}))
                                                input_counter = input_counter + 1
                                                change_amount = y['amount']
                                                change_address.append((query.address, query.price / query.amount, Decimal(change_amount)))
                                    else:
                                        pass  # No money left

                    user_address = u.btc_address

                    outputs = {}
                    normal_fee = Decimal("0.0000001")
                    size = ((len(inputs) * 148) + (len(change_address) * 34) + (10 + input_counter))
                    fees = Decimal(normal_fee * size).quantize(Decimal("0.000000001"))

                    for j in change_address:
                        refund = Decimal((j[2] - Decimal(0.00000001) * Decimal(j[1]))
                                         .quantize(Decimal("0.0000001")))
                        next_output = {j[0]: refund}
                        outputs.update(next_output)
                    next_output = {user_address: Decimal(amount - fees)}
                    outputs.update(next_output)
                    try:
                        tx = BitcoinConnector.auth_proxy.createrawtransaction(inputs, outputs)
                        copy_list = copy.deepcopy(inputs)
                        priv_key = []
                        for i in copy_list:
                            first_unspent = BitcoinConnector.auth_proxy.gettransaction(i.pop('txid'))
                            for j in first_unspent['details']:
                                if j['vout'] == i['vout']:
                                    priv_key.append(BitcoinConnector.auth_proxy.dumpprivkey(j['address']))
                        signed_raw_tx = BitcoinConnector.auth_proxy.signrawtransactionwithkey(tx, priv_key)
                        new_txid = BitcoinConnector.auth_proxy.sendrawtransaction(signed_raw_tx['hex'])
                        for i in query_ids:
                            session.query(Txid).filter(Txid.query_id == i.query_id).filter(Txid.proc_id == i.proc_id).update({'tx_id': new_txid})
                            session.commit()
                        session.query(QueryUserMapping).filter(QueryUserMapping.user_id == u.user_id).filter(QueryUserMapping.paid == 0).update(
                            {'paid': 1})
                        session.query(User).filter(User.user_id == u.user_id).update({'balance': 0})
                        session.commit()
                        size = BitcoinConnector.auth_proxy.decoderawtransaction(signed_raw_tx['hex'])['size']
                    except JSONRPCException as message:
                        if Configuration.test_mode:
                            logging.exception("An error occured: %s" % message)
                        session.close()
        session.close()
