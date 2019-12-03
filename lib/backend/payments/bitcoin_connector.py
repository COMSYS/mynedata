""" This module defines a conenctor for the Bitcoin Core client. """

from lib.config import Configuration
from lib.data_structures import PaymentMethod
from lib.backend.payments import AuthServiceProxy


class BitcoinConnector():
    """ This static class connects the myneData backend to the Bitcoin Core client via JSON-RPC. """

    bitcoincli_auth_proxy = None
    platform_address = None
    # Wallet if payments can be send from platform easier but not transparent. else complex transaction with every input corresponding to a query transaction the user took part in
    use_wallet = False
    initialized = False

    @staticmethod
    def initialize():
        """ Initialize proxy to Bitcoin Core client. """
        BitcoinConnector.auth_proxy = AuthServiceProxy(
            'http://{rpcuser}:{rpcpassword}@{rpchost}:{rpcport}'.format(
                rpcuser=Configuration.payment_bitcoin_rpc_user,
                rpcpassword=Configuration.payment_bitcoin_rpc_password,
                rpchost=Configuration.payment_bitcoin_rpc_host,
                rpcport=Configuration.payment_bitcoin_rpc_port,
            ),
            timeout=Configuration.payment_bitcoin_rpc_timeout,
        )

        BitcoinConnector.platform_address = BitcoinConnector.bitcoincli_auth_proxy.getnewaddress('platform')
        BitcoinConnector.use_wallet = (Configuration.payment_mode is PaymentMethod.BITCOIN_CENTRAL)

        BitcoinConnector.initialized = True
