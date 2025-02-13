import time
import random
from datetime import datetime
import sqlalchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base 
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import sessionmaker

Base=declarative_base()
engine=create_engine("mysql://root:password@127.0.0.1:3306/raspberry_pi")



class Driver(Base):

    __tablename__="Driver"

    Date_and_time=Column(sqlalchemy.DATETIME,primary_key=True)
    
    Drowsiness_value=Column(sqlalchemy.DECIMAL(10,2),nullable=False)
    Seat_Status=Column(Integer,nullable=False)

    Vitals_Status=Column(Integer,nullable=False)
    Heart_Rate =Column(sqlalchemy.DECIMAL(10,2),nullable=False)
    Breathing_Rate=Column(sqlalchemy.DECIMAL(10,2),nullable=False)
    Temperature_Rate=Column(sqlalchemy.DECIMAL(10,2),nullable=False)

    Head_Status=Column(Integer,nullable=False)
    Head_Position1=Column(sqlalchemy.DECIMAL(10,2),nullable=False)
    Head_Position2=Column(sqlalchemy.DECIMAL(10,2),nullable=False)

    Leg_Status=Column(Integer,nullable=False)
    Leg_Status_1=Column(sqlalchemy.DECIMAL(10,2),nullable=False)
    Leg_Status_2=Column(sqlalchemy.DECIMAL(10,2),nullable=False)
    Leg_Status_3=Column(sqlalchemy.DECIMAL(10,2),nullable=False)
    Leg_Status_4=Column(sqlalchemy.DECIMAL(10,2),nullable=False)

    Tilt_status=Column(Integer,nullable=False)
    Tilt_X=Column(sqlalchemy.DECIMAL(10,2),nullable=False)
    Tilt_Y=Column(sqlalchemy.DECIMAL(10,2),nullable=False)
    Tilt_Z=Column(sqlalchemy.DECIMAL(10,2),nullable=False)

    Alert_status=Column(Integer,nullable=False)



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
        Breathing_Rate=random.uniform(1.00,35.00)
        Temperature_Rate=random.uniform(1.00,45.00)

        Head_Status=random.randint(0,1)
        Head_Position1=random.uniform(1.00,1000.00)
        Head_Position2=random.uniform(1.00,1000.00)

        Leg_Status=random.randint(0,1)
        Leg_Status_1=random.uniform(1.00,1000.00)
        Leg_Status_2=random.uniform(1.00,1000.00)
        Leg_Status_3=random.uniform(1.00,1000.00)
        Leg_Status_4=random.uniform(1.00,1000.00)

        Tilt_status=random.randint(0,1)
        Tilt_X=random.uniform(1.00,1000.00)
        Tilt_Y=random.uniform(1.00,1000.00)
        Tilt_Z=random.uniform(1.00,1000.00)

        Alert_status=random.randint(0,1)


        Driver_data=Driver(

            Date_and_time=Date_and_time,
            Drowsiness_value=Drowsiness_value,
            Seat_Status=Seat_Status,

            Vitals_Status=Vitals_Status,
            Heart_Rate =Heart_Rate,
            Breathing_Rate=Breathing_Rate,
            Temperature_Rate=Temperature_Rate,

            Head_Status=Head_Status,
            Head_Position1=Head_Position1,
            Head_Position2=Head_Position2,

            Leg_Status=Leg_Status,
            Leg_Status_1=Leg_Status_1,
            Leg_Status_2=Leg_Status_2,
            Leg_Status_3=Leg_Status_3,
            Leg_Status_4=Leg_Status_4,

            Tilt_status=Tilt_status,
            Tilt_X=Tilt_X,
            Tilt_Y=Tilt_Y,
            Tilt_Z=Tilt_Z,

            Alert_status=Alert_status
            
        )
        session.add(Driver_data)
        session.commit()
        time.sleep(1)
        





data_generator()
    

