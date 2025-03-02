import random
import time

def generate_random_data():
    return {
        'Heart_Rate':40 ,
        'spo2': 40,
        'Head_Position1':200,
        'Head_Position2':200,
        'Temperature_Rate': 200,
        'Leg_Status_1': random.uniform(0, 1),
        'Leg_Status_2': random.uniform(0, 1),
        'Leg_Status_3': random.uniform(0, 1),
        'Leg_Status_4': random.uniform(0, 1),
        'Tilt_X': random.uniform(-90, 90),
        'Tilt_Y': random.uniform(-90, 90),
        'Tilt_Z': random.uniform(-90, 90),
        'Seat_Status': 1,
        'Vitals_Status': 0,
        'Head_Status': 0,
        'leg_status': 0,
        'Tilt_status': 0,
        'Alert_status':0,
        'Surrounding_status':0,#addon
        'Drowsiness_value': random.uniform(0, 1),
        'ambient_temp': random.uniform(-10, 50),
        'humidity': random.uniform(0, 100),
        'latitude': random.uniform(-90, 90),
        'longitude': random.uniform(-180, 180),
        'speed': 70,
        'altitude': random.uniform(0, 10000)
    }
def monitor_vitals(heart_rate, spo2, temperature,vita_stat):
    if (heart_rate < 50 or heart_rate > 100) and (spo2<90) and (temperature <60 or temperature >150):
        vita_stat=1
        print(vita_stat)
        return 1
    else:
        vita_stat=0
        print(vita_stat)
        return 0

def Seat_status(s):
    if(s):
        return 1
    else:
        return 0
    
def check_leg_position(leg_status1, leg_status2, leg_status3, leg_status4,lg):
    leg_statuses = [leg_status1, leg_status2, leg_status3, leg_status4]
    if Seat_status(data['Seat_Status']):
        if sum(v < 5000 for v in leg_statuses) >= 3:
            #(what change in leg status value)
            return 0
        else:
            #(what change in leg status value)
            return 1
    return -1


def monitor_environment(am_temp, humidity,surr):
    if (am_temp<5 or am_temp > 400) or (humidity < 10 or humidity > 90):
        surr=1
        return 1
    surr=0
    return 0


def detect_sudden_tilt(gyro_x, gyro_y, gyro_z,Tilt_status):
    if ():
        Tilt_status=1
        return 1
    else:
        Tilt_status=0
        return 0
        
        
        
        


def check_head_position(head_pos1, head_pos2, speed,head):
    if speed > 80:  # Stricter limits at higher speeds
        tilt_limit = 120
    else:
        tilt_limit = 150

    if head_pos1 > tilt_limit or head_pos2 > tilt_limit:
        print("Exception")
        head=1
        return 1
    print("No Exception")
    head=0
    return 0

        
        
def responsiveness(a,b,c,d,e):
    arr=[a,b,c,d,e]
    if sum(v ==1 for v in arr) >= 3:
        return 1
    else:
        return 0
def accident(a,b,c):
    ad=[a,b,c]
    if sum(v ==1 for v in ad) >= 1:
        return 1
    else:
        return 0
    
def make_decision(data):
    alerts = []
    
    # Health condition checks
    if monitor_vitals(data['Heart_Rate'],data['spo2'],data['Temperature_Rate'],data['Vitals_Status']):
        alerts.append("Medical Emergency: Low Heart Rate or Oxygen Level!")
    
    if check_head_position(data['Head_Position1'],data['Head_Position2'],data['Head_Status'],data['speed']):
        alerts.append("Head tilted too much")
    
    if Seat_status(data['Seat_Status']):
        alerts.append("Abnormal Not seated")
    
    if detect_sudden_tilt(data['Tilt_X'],data['Tilt_Y'],data['Tilt_Z'],data['Tilt_status']):
        alerts.append("Accident")
        
    if  monitor_environment(data['ambient_temp'],data['humidity'],data['Surrounding_status']):
        alerts.append("Fire")
        
    if check_leg_position(data['Leg_Status_1'],data['Leg_Status_2'],data['Leg_Status_3'],data['Leg_Status_4'],data['leg_status']):
        alerts.append("Unresponsive_leg_movements")
    
    if(responsiveness(data['Tilt_status'],data['Surrounding_status'],data['leg_status'],data['Head_status'],data['Vitals_Status'])):
        alerts.append("Unresponsive_person")
        data['Alert_status']=1
    if(accident(detect_sudden_tilt(data['Tilt_X'],data['Tilt_Y'],data['Tilt_Z'],data['Tilt_status']), monitor_environment(data['ambient_temp'],data['humidity'],data['Surrounding_status']),responsiveness(data['Tilt_status'],data['Surrounding_status'],data['leg_status'],data['Head_status'],data['Vitals_Status']))):
        alerts.append("Accident")
        
        
        
    

    
    
    
    return alerts
F=7
try:
    while (F):
        sample_data = generate_random_data()
        alerts = make_decision(sample_data)
        for alert in alerts:
            print(alert)
        time.sleep(1)  # Adjust based on real-time needs
        F=F-1

except KeyboardInterrupt:
    print("Shutting down...")

