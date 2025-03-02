import time
import random
from datetime import datetime
import sqlalchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base 
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import sessionmaker



Base=declarative_base()
engine=create_engine("mysql://root:password@127.0.0.1:3306/alerts")


class alerts(Base):

    __tablename__="alerts"

    Date_and_time=Column(sqlalchemy.DATETIME,primary_key=True)
    
    Drowsiness_value=Column(sqlalchemy.DECIMAL(10,2),nullable=False)
    Seat_Status=Column(Integer,nullable=False)

    Vitals_Status=Column(Integer,nullable=False)
    Heart_Rate =Column(sqlalchemy.DECIMAL(10,2),nullable=False)
    spo2=Column(sqlalchemy.DECIMAL(10,2),nullable=False)
    Temperature_Rate=Column(sqlalchemy.DECIMAL(10,2),nullable=False)

    latitude=Column(sqlalchemy.DECIMAL(10,7),nullable=False)
    longitude=Column(sqlalchemy.DECIMAL(10,7),nullable=False)
    emergency_status=Column(Integer,nullable=False)


   



Base.metadata.create_all(engine)


Session=sessionmaker(bind=engine)

def data_generator():
    session=Session()

    while True:
        
        Date_and_time=datetime.now()

        Drowsiness_value=random.randint(0,100)
        Seat_Status=random.randint(0,1)

        Vitals_Status=random.randint(0,1)
        Heart_Rate =random.uniform(1.00,160.00)
        spo2=random.uniform(1.00,35.00)
        Temperature_Rate=random.uniform(1.00,45.00)

        latitude=random.uniform(-90.0000000,90.0000000)
        longitude=random.uniform(-180.0000000,180.0000000)
        emergency_status=random.randint(0,1)

      


        Alerts=alerts(

            Date_and_time=Date_and_time,
            Drowsiness_value=Drowsiness_value,
            Seat_Status=Seat_Status,

            Vitals_Status=Vitals_Status,
            Heart_Rate =Heart_Rate,
            spo2=spo2,
            Temperature_Rate=Temperature_Rate,
            
            latitude=latitude,
            longitude=longitude,
            emergency_status=emergency_status,
        )
        session.add(Alerts)
        session.commit()
        time.sleep(1)
    

data_generator()