""" This module defines the database representation of a data processor. """

import hashlib

from sqlalchemy import Column, Integer, String, Enum as DbEnum

from lib.data_structures.enums import OrganizationType
from . import BaseObject


class Processor(BaseObject):
    """ Database representation of a data processor. """
    __tablename__ = 'processors'

    puid = Column(Integer, primary_key=True)
    processorname = Column(String)
    password_hash = Column(String)
    name = Column(String)
    address = Column(String)
    postcode = Column(String)
    city = Column(String)
    org_type = Column(DbEnum(OrganizationType))
    thumbnail_url = Column(String)

    def __init__(self, puid, processorname, password_hash, name="Anonymous", address="Anonymous", postcode="Anonymous", city="Anonymous", org_type=OrganizationType.PRIVATE, thumbnail_url="https://www.comsys.rwth-aachen.de/fileadmin/_processed_/csm_mynedata_a51489a7a9.png"):
        self.puid = puid
        self.processorname = processorname
        self.password_hash = password_hash
        self.name = name
        self.address = address
        self.postcode = postcode
        self.city = city
        self.org_type = org_type
        self.thumbnail_url = thumbnail_url

    def __repr__(self):
        return "<Processor(puid='%s', processorname='%s', password_hash='%s', name='%s', address='%s', postcode='%s', city='%s', org_type='%s', thumbnail_url='%s')>" % (
            self.puid,
            self.processorname,
            self.password_hash,
            self.name,
            self.address,
            self.postcode,
            self.city,
            self.org_type,
            self.thumbnail_url
        )

    @staticmethod
    def derive_uid(name):
        """ Function to get the corresponding uid of a username

        Args:
            - name (string): name of user

        Returns:
            - int: uid of name
        """
        name_utf8 = name.encode('utf-8')
        uid = int(hashlib.sha256(name_utf8).hexdigest()[:5], 16)
        return uid
