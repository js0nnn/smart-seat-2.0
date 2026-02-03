import time
import random
from datetime import datetime
import sqlalchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base 
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import sessionmaker

Base=declarative_base()
engine=create_engine("mysql://root:password@127.0.0.1:3306/contacts")



class contacts(Base):

    __tablename__="contacts"

    name=Column(sqlalchemy.String(50),nullable=False)
    phone_number=Column(sqlalchemy.String(13),nullable=False,primary_key=True)



Base.metadata.create_all(engine)


Session=sessionmaker(bind=engine)
