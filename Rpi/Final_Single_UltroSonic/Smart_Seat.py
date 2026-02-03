import os
import lgpio
import serial
import time
import RPi.GPIO as GPIO

# ---------------- GPIO Setup ----------------
MOTOR_PIN = 12
BUZZER_PIN = 16
h = lgpio.gpiochip_open(0)

#GPIO.setmode(GPIO.BCM)
lgpio.gpio_claim_output(h, MOTOR_PIN)
lgpio.gpio_claim_output(h, BUZZER_PIN)

lgpio.gpio_write(h, MOTOR_PIN, 0)  # OFF
lgpio.gpio_write(h, BUZZER_PIN, 0)  # OFF

# ---------------- Serial Setup ----------------
#sensor1 = serial.Serial(port="/dev/ttyAMA0", baudrate=9600, timeout=0.05)
sensor2 = serial.Serial(port="/dev/ttyAMA2", baudrate=9600, timeout=0.05)

# Use pyserial for RX (status)
status_ser = serial.Serial(port="/dev/ttyAMA3", baudrate=9600, timeout=0.01)

# Use os.write for fast TX
uart_fd = os.open("/dev/ttyAMA3", os.O_RDWR | os.O_NOCTTY | os.O_SYNC)


def uart_send(data: str):
    """Fast TX with minimal overhead"""
    os.write(uart_fd, data.encode('utf-8'))


def read_sensor(sensor):
    """Read and decode one 4-byte frame from A0221AU sensor"""
    data = sensor.read(4)
    if len(data) == 4 and data[0] == 0xFF:
        high, low, checksum = data[1], data[2], data[3]
        if checksum == ((0xFF + high + low) & 0xFF):
            return (high << 8 | low) / 10.0  # cm
    return 0


# ---------------- Handshake Phase ----------------
print("Performing handshake...")
uart_send("A00000\n")
print("Sent: A00000")

while True:
    if status_ser.in_waiting:
        response = status_ser.read(2).decode('utf-8', errors='ignore').strip()
        if response == "R1":
            print("Received R1, sending B00000")
            uart_send("B00000\n")
            break
    time.sleep(0.01)

# ---------------- Main Loop ----------------
H = 0
P = 0
count = 0
S = 0

try:
    while True:
        # ---- Read status from UART3 using pyserial ----
        if status_ser.in_waiting:
            packet = status_ser.read(2).decode('utf-8', errors='ignore').strip()
            if packet == "P1":
                print("Driver Present")
                P = 1
            elif packet == "P0":
                print("Driver Not Present")
                P = 0
                lgpio.gpio_write(h, MOTOR_PIN, 0)  # OFF
                lgpio.gpio_write(h, BUZZER_PIN, 0)  # OFF
            elif packet == "H1":
                print("Heart Beat Normal")
                time.sleep(5)
                H = 1
            elif packet == "H0":
                print("Heart Beat Abnormal")
                H = 0

        # ---- Ultrasonic when driver present and heart normal ----
        if H == 1 and P == 1:
            #dist1 = read_sensor(sensor1)
            dist1 =100
            dist2 = read_sensor(sensor2)

            print(f"Sensor2: {dist2}")

            if dist1 is not None and dist2 is not None:
                send_data = f"{int(dist1):03d}{int(dist2):03d}\n"
            else:
                send_data = "000000\n"

            uart_send(send_data)

            time.sleep(0.012)  # Just above transmission time

            # ---- Buzzer Control ----
            #if ((dist1 and dist1 > 20) and (dist1 and dist1 > 25)) or ((dist2 and dist2 < 20) and (dist2 and dist2 > 25)):
            if (dist2 and dist2 > 20):
                count += 1
                if count > 10:
                    lgpio.gpio_write(h, MOTOR_PIN, 1)  # OFF
                if count > 15:
                    lgpio.gpio_write(h, BUZZER_PIN, 1)  # ON
            #elif (dist1 and dist1 < 20) and (dist2 and dist2 < 20):
            elif (dist2 and dist2 < 20) :
                count = 0
                lgpio.gpio_write(h, MOTOR_PIN, 0)  # OFF
                lgpio.gpio_write(h, BUZZER_PIN, 0)  # OFF'''
        time.sleep(0.005)

except KeyboardInterrupt:
    print("\nStopped by user.")

finally:
    lgpio.gpio_write(h, MOTOR_PIN, 0)  # OFF
    lgpio.gpio_write(h, BUZZER_PIN, 0)  # OFF
    #GPIO.output(BUZZER_PIN, GPIO.LOW)
    lgpio.gpiochip_close(h)
    #GPIO.cleanup()
    #sensor1.close()
    sensor2.close()
    status_ser.close()
    os.close(uart_fd)
    print("Cleaned up and closed all connections.")
