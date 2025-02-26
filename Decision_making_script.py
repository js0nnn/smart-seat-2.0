import spidev
import time
import RPi.GPIO as GPIO
import serial

# SPI Configuration
SPI_BUS = 0
SPI_DEVICE = 0
spi = spidev.SpiDev()
spi.open(SPI_BUS, SPI_DEVICE)
spi.max_speed_hz = 500000  # Adjust as needed
spi.mode = 0b00  # SPI mode 0

# GPIO Setup for Actuators
VIBRATION_MOTOR = 17  # GPIO pin for vibration motor
SPEAKER = 22  # GPIO pin for alarm
SOS_BUTTON = 27  # GPIO pin for SOS button
GPIO.setmode(GPIO.BCM)
GPIO.setup(VIBRATION_MOTOR, GPIO.OUT)
GPIO.setup(SPEAKER, GPIO.OUT)
GPIO.setup(SOS_BUTTON, GPIO.IN, pull_up_down=GPIO.PUD_UP)  # Pull-up resistor for button

# Serial Configuration for SIM7000G
SERIAL_PORT = "/dev/ttyS0"  # Adjust based on your setup
BAUD_RATE = 115200
ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)

# SPI Commands for ESP32-S3
CMD_HEART_RATE = 0x01
CMD_OXYGEN = 0x02
CMD_TEMPERATURE = 0x03  # From MAX30102
CMD_HEAD_POSITION = 0x04
CMD_TILT_ANGLE = 0x05
CMD_LEG_POSITION = 0x06

CMD_PRESSURE_SEAT_START = 0x10  # Start address for seat sensors (6 sensors)
CMD_PRESSURE_ALERT_START = 0x20  # Start address for alertness sensors (4 sensors)

# Function to send SPI command and read response
def spi_transfer(command):
    spi.xfer2([command])
    time.sleep(0.1)  # Small delay for processing
    response = spi.xfer2([0x00])  # Read response
    return response[0]

# Function to read health parameters
def read_health_data():
    heart_rate = spi_transfer(CMD_HEART_RATE)
    oxygen_level = spi_transfer(CMD_OXYGEN)
    temperature = spi_transfer(CMD_TEMPERATURE)  # Extracted from MAX30102
    return heart_rate, oxygen_level, temperature

# Function to read pressure sensor data
def read_pressure_sensors(start_cmd, count):
    return [spi_transfer(start_cmd + i) for i in range(count)]

# Function to send SMS alert
def send_sms_alert(phone_number, message):
    ser.write(b'AT+CMGF=1\r')  # Set SMS text mode
    time.sleep(1)
    ser.write(f'AT+CMGS="{phone_number}"\r'.encode())
    time.sleep(1)
    ser.write(f'{message}\x1A'.encode())  # End message with Ctrl+Z
    time.sleep(3)
    print("SMS Sent")

# Function to make an emergency call
def make_emergency_call(phone_number):
    ser.write(f'ATD{phone_number};\r'.encode())
    time.sleep(10)  # Allow time for the call to go through
    ser.write(b'ATH\r')  # Hang up the call
    print("Emergency Call Made")

# Function to check SOS button
def check_sos():
    if GPIO.input(SOS_BUTTON) == GPIO.LOW:  # Button pressed
        print("SOS Button Pressed! Sending Alert...")
        send_sms_alert("+911234567890", "SOS Alert! Emergency Assistance Needed!")
        make_emergency_call("+911234567890")
        return True
    return False

# Function to process and take actions
def process_data():
    # Read all sensor data
    heart_rate, oxygen_level, temperature = read_health_data()
    seat_pressure = read_pressure_sensors(CMD_PRESSURE_SEAT_START, 6)
    alertness_pressure = read_pressure_sensors(CMD_PRESSURE_ALERT_START, 4)
    
    # Decision Making Logic
    if heart_rate < 50 or oxygen_level < 90:
        print("ALERT: Abnormal heart rate or oxygen level!")
        GPIO.output(SPEAKER, GPIO.HIGH)  # Activate alarm
        send_sms_alert("+911234567890", "Health Alert: Abnormal heart rate or oxygen level!")
    else:
        GPIO.output(SPEAKER, GPIO.LOW)  # Deactivate alarm

    # Seat Occupancy Check (if all sensors are activated and below 4000, seat is occupied)
    if all(s < 4000 for s in seat_pressure):
        print("Seat Occupied: ")
    else:
        print("Seat Unoccupied: ")

    # Driver Alertness Check (if no leg movement detected, consider drowsy)
    if all(a > 9000 for a in alertness_pressure): #Inactive state values above 9000 ,10000 above
        print("ALERT: Driver Alertness LOW! Take a Break!")
        GPIO.output(SPEAKER, GPIO.HIGH)  # Sound alarm
        send_sms_alert("+911234567890", "Driver Alertness Low! Possible Drowsiness Detected!")
    else:
        GPIO.output(SPEAKER, GPIO.LOW)

    # Check for SOS Button Press
    check_sos()

    # Debug Output
    print(f"Heart: {heart_rate} | O2: {oxygen_level} | Temp: {temperature}")

# Main Loop
try:
    while True:
        process_data()
        time.sleep(1)  # Adjust based on real-time needs

except KeyboardInterrupt:
    print("Shutting down...")
    GPIO.cleanup()
    spi.close()
    ser.close()
