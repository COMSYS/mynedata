""" This module implements a parser for our query language. """

import sys

from lark import Lark
from lark import Transformer
from lark.lexer import Token

sql_parser = Lark(r"""

    start : selectstatement wherestatement
          | selectstatement

    selectstatement : SELECT select_expr_list

    SELECT : "SELECT"

    select_expr_list: select_expr ("," select_expr)*


    select_expr: function

    FROM : "FROM"

    tablename: STRING

    expr: "(" expr ")" AND "(" expr ")"  -> andconcat
        | "(" expr ")" OR "(" expr ")"   -> orconcat
        | expr comp expr                 -> comparison
        | NEG expr                       -> negation
        | NUMBER                         -> number_parameter
        | value                          -> text_parameter
        | NAME                           -> attributename


    function: sum
            | corr
            | avg
            | rawavg
            | count
            | COUNT
            | all

    corr: "CORR" "(" NAME "," NAME ")"
    sum: "SUM" "(" NAME ("," NAME)* ")"
    avg: "AVG" "(" NAME ("," NAME)* ")"
    rawavg: "RAVG" "(" NAME ("," NAME)* ")"
    all: "ALL" "(" NAME ("," NAME)* ")"
    count: "COUNT" "(" NAME ")"

    FCTNAME: /[\w.]/+

    AVG: "AVG"

    COUNT: "COUNT"


    AND: "AND"

    OR: "OR"

    NEG: "!"

    comp: LARGER
        | SMALLER
        | EQUALS

    LARGER: ">"

    SMALLER: "<"

    EQUALS: "="

    wherestatement : WHERE expr

    WHERE : "WHERE"

    value : ESCAPED_STRING


    NUMBER.1: SIGNED_NUMBER

    NAME.5: /[\w"."]/+

    STRING : /[\w.]/+

    INTEGER: SIGNED_NUMBER
    %import common.ESCAPED_STRING

    %import common.SIGNED_NUMBER
    %import common.WS
    %ignore WS
    """)


class SqlTransformer(Transformer):
    """ This class transforms a query into a parsed query. """

    @staticmethod
    def start(items):
        """ Determine whether we hava a WHERE-clause. """
        res = {}
        res['Select'] = items[0]
        if len(items) > 1:
            res['Where'] = items[1]
        return res

    @staticmethod
    def function(a):
        """ Function names are idempotent. """
        return a

    @staticmethod
    def get_values(a):
        """ Aggregate attribute values over users. """
        return [attr.value for attr in a]

    @staticmethod
    def count(a):
        """ Preparation of COUNT. """
        res = {}
        res['name'] = "COUNT"
        res['attr'] = SqlTransformer.get_values(a)
        return res

    @staticmethod
    def avg(a):
        """ Preparation of AVG. """
        res = {}
        res['name'] = "AVG"
        res['attr'] = SqlTransformer.get_values(a)
        return res

    @staticmethod
    def rawavg(a):
        """ Preparation of RAVG, for showcase purposes. """
        res = {}
        res['name'] = "RAVG"
        res['attr'] = SqlTransformer.get_values(a)
        return res

    @staticmethod
    def all(a):
        """ Preparation of ALL. """
        res = {}
        res['name'] = "ALL"
        res['attr'] = SqlTransformer.get_values(a)
        return res

    @staticmethod
    def sum(a):
        """ Preparation of SUM. """
        res = {}
        res['name'] = "SUM"
        res['attr'] = SqlTransformer.get_values(a)
        return res

    @staticmethod
    def corr(a):
        """ Preparation of CORR. """
        res = {}
        res['name'] = "CORR"
        res['attr'] = SqlTransformer.get_values(a)
        return res

    @staticmethod
    def wherestatement(a):
        """ Return WHERE-clause of query. """
        return a[1]

    @staticmethod
    def select_expr_list(a):
        """ Return list of SELECT expressions. """
        return a

    @staticmethod
    def select_expr(a):
        """ Return SELECT expression. """
        return a[0]

    @staticmethod
    def selectstatement(a):
        """ Return the SELECT statement. """
        res = {}
        res['select'] = a[1]
        return a[1]

    @staticmethod
    def functioncall(a):
        """ Determine required function calls of a query. """
        for item in a:
            if isinstance(item, Token) and item.type == "FUNCTION":
                functionname = item.value
            else:
                parameter = item
        res = {}
        res['functioncall'] = functionname
        res['functionparameter'] = parameter
        return res

    @staticmethod
    def andconcat(a):
        """ Interpret AND. """
        res = {}
        res['leftquery'] = a[0]
        res['concat'] = a[1].value
        res['rightquery'] = a[2]
        return res

    @staticmethod
    def orconcat(a):
        """ Interpret OR. """
        res = {}
        res['leftquery'] = a[0]
        res['concat'] = a[1].value
        res['rightquery'] = a[2]
        return res

    @staticmethod
    def comparison(items):
        """ Intepret comparison. """
        res = {}
        res['compleft'] = items[0]
        res['comparator'] = items[1]
        res['compright'] = items[2]
        return res

    @staticmethod
    def attributename(a):
        """ Return attribute name. """
        res = {}
        res['attr'] = a[0].value
        return res

    @staticmethod
    def comp(items):
        """ Execute comparison. """
        return items[0].value

    @staticmethod
    def text_parameter(items):
        """ Return text parameter. """
        res = {}
        res['textparam'] = items[0].children[0].value[1:-1]
        return res

    @staticmethod
    def number_parameter(items):
        """ Return number parameter. """
        res = {}
        res['numparam'] = items[0].value
        return res

    @staticmethod
    def tablename(a):
        """ Return table name. """
        res = {}
        res['tablename'] = a[0].value
        return res


def constructConstraintList(inp, result):
    """ Derive list of query constraints affecting user selection. """

    if 'comparator' in inp and inp['comparator'] == '=':
        for i in inp['compright']:
            param = inp['compright'][i]
        inpparam = inp['compleft']['attr'].split(".")
        datasource = inpparam[0].strip()
        attr = inpparam[1]
        return result + [[datasource, attr, param]]

    if 'concat' in inp and inp['concat'] == 'AND':
        return result + constructConstraintList(inp['leftquery'], result,) + constructConstraintList(inp['rightquery'], result)

    if 'comparator' in inp and inp['comparator'] == '<':
        for i in inp['compright']:
            param = inp['compright'][i]
        inpparam = inp['compleft']['attr'].split(".")
        datasource = inpparam[0].strip()
        attr = inpparam[1]
        return result + [[datasource, attr, ":" + str(param)]]

    if 'comparator' in inp and inp['comparator'] == '>':
        for i in inp['compright']:
            param = inp['compright'][i]
        inpparam = inp['compleft']['attr'].split(".")
        datasource = inpparam[0].strip()
        attr = inpparam[1]
        return result + [[datasource, attr, str(param) + ":" + str(sys.maxsize)]]

    return RuntimeError('Internal server error: Unknown constraint.')


def find_and_parts(inp, result):
    """ Implement concatination. """
    if 'concat' in inp and inp['concat'] == 'OR':
        return result + [inp['leftquery']] + find_and_parts(inp['rightquery'], result)

    return [inp]
