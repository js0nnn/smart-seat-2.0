# Smart Seat 2.0

**An Embedded Driver Monitoring and Safety System**

## 1. Project Overview

Smart Seat 2.0 is a multi-controller embedded system designed to monitor **driver presence, physiological condition, and alertness**, and to generate **local and remote safety alerts** when abnormal conditions are detected.

The system integrates:

* Biometric sensing (heart rate and body temperature)
* Seat occupancy detection
* Ultrasonic-based inactivity/drowsiness monitoring
* Local visual feedback using an LCD
* Local web-based monitoring through a Raspberry Pi
* Emergency alerting with GPS location using an LTE module

The project is intended as a **driver safety solution** and demonstrates real-time coordination between microcontrollers, a single-board computer, sensors, and communication modules.

---

## 2. System Architecture

The system is divided into four main hardware/software blocks:

### 2.1 PIC16F886 – Seat and Biometric Controller

This microcontroller acts as the **sensor interface and local display controller**.

**Functions:**

* Detects driver presence using seat/pressure sensors (ADC inputs)
* Measures heart rate and body temperature using the MAX30102 sensor
* Displays system status and sensor values on a 20×4 I²C LCD
* Communicates with the Raspberry Pi over UART
* Determines whether the driver is present and physiologically normal

**Outputs:**

* Local LCD display connected to the PIC
* Status messages (`P1`, `P0`, `H1`, `H0`, etc.) sent to the Raspberry Pi

---

### 2.2 Raspberry Pi – Central Processing Unit

The Raspberry Pi acts as the **main decision-making and coordination unit**.

**Functions:**

* Receives driver presence and heart-rate status from the PIC
* Reads ultrasonic sensor data to detect inactivity or unsafe posture
* Controls external actuators (motor and buzzer) via GPIO
* Sends processed sensor data back to the PIC for LCD display
* Hosts a **local web server** for monitoring via a browser on the same network

**Outputs:**

* Buzzer and vibration/motor alerts
* Data sent to PIC for LCD visualization
* Data served to a local web interface

---

### 2.3 LILYGO T-SIM7600G-H – LTE and GPS Alert Module

This module provides **emergency communication and location tracking**.

**Functions:**

* Acquires GPS location using the SIM7600 GNSS module
* Sends SMS alerts with Google Maps location links
* Supports two alert modes:

  * Manual emergency button press
  * Automatic alert triggered by Raspberry Pi

**Outputs:**

* SMS alerts sent to predefined phone numbers
* GPS coordinates embedded in alert messages

---

### 2.4 Web Interface (WebDev_scripts)

The web interface runs **locally on the Raspberry Pi** and provides an alternative way to view system status.

**Features:**

* Displays driver presence and sensor data
* Accessible from any device on the same local network
* Provides a software-based monitoring view in addition to the LCD

**Note:**
The system output can be observed in two ways:

1. **Physically**, via the LCD connected to the PIC microcontroller
2. **Digitally**, via the web interface hosted on the Raspberry Pi (local network access)

---

## 3. Repository Structure

```
smart-seat-2.0/
│
├── ESP32_scripts/
│   └── (Auxiliary ESP32-related experiments or tests)
│
├── LILYGO T-SIM7600G-H/
│   └── LTE_GPS_SMS.ino        # GPS acquisition and SMS alert firmware
│
├── PIC16F886/
│   └── main.c                 # Seat sensing, heart rate, LCD, UART logic
│
├── Rpi/
│   └── Final_Single_UltroSonic/
│       └── main.py            # Central control logic, UART, GPIO, sensors
│
├── WebDev_scripts/
│   └── (Local website files served by Raspberry Pi)
│
└── README.md
```

---

## 4. Communication Flow

1. PIC detects driver presence and heart rate
2. PIC sends status data to Raspberry Pi via UART
3. Raspberry Pi:

   * Evaluates ultrasonic sensor data
   * Activates buzzer/motor if unsafe conditions are detected
   * Sends sensor values back to PIC for LCD display
4. Raspberry Pi updates the local web interface
5. In emergency conditions:

   * Raspberry Pi or manual button triggers LTE module
   * SMS with GPS location is sent to predefined contacts

---

## 5. Hardware Requirements

* PIC16F886 microcontroller
* Raspberry Pi (UART and GPIO support required)
* LILYGO T-SIM7600G-H LTE/GPS module
* MAX30102 heart rate and temperature sensor
* Ultrasonic distance sensor
* 20×4 I²C LCD
* Buzzer and vibration motor
* Push button (emergency trigger)
* Power supply and interfacing components

---

## 6. Software Requirements

* MPLAB X IDE with XC8 compiler (PIC firmware)
* Python 3 with:

  * `pyserial`
  * `lgpio`
* Arduino IDE (for LTE/GPS firmware)
* Local web server stack (for WebDev_scripts)
* Linux OS on Raspberry Pi

---

## 7. How to Run

1. Flash the PIC16F886 firmware using MPLAB X
2. Upload the LTE/GPS sketch to the LILYGO module
3. Connect UART lines between PIC, Raspberry Pi, and LTE module
4. Run the Raspberry Pi Python script:

   ```bash
   python3 main.py
   ```
5. Start the local web server on the Raspberry Pi
6. Access the web interface using:

   ```
   http://<raspberry-pi-ip>/
   ```

---

## 8. Key Features

* Real-time driver presence detection
* Continuous heart rate monitoring
* Ultrasonic-based inactivity and alertness detection
* Local LCD feedback
* Local network web monitoring
* GPS-based emergency SMS alerts

---

## 9. Future Enhancements

* Cloud-based data logging
* Mobile application support
* Machine learning–based fatigue detection
* Camera-based monitoring
* Encrypted communication between modules

---

## 10. License

This project is developed for academic and educational purposes on collaboration with TATA's seat manufacturing department.

