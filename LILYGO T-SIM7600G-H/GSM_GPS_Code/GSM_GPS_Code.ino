/*
https://opencellid.org/cell/get?key=pk.5720bee033cd3dda071fbbe4a9ca142d&mcc=405&mnc=869&lac=32&cellid=4859665&radio=LTE&format=json
*/

//using SIM7600G-H R2
//LILYGO TSIM7600G-H
#include "utilities.h"
#define SerialMon Serial         // Serial monitor for debugging
#define SerialAT Serial1        // Serial for AT commands to the module
#define BTN 18
 

#define DB_BANK_SIZE 5 //number of phone numbers

const char apn[] = "airtelgprs.com";  // Your APN (for GPRS)

const String hardwired_nos[] = {"+919922990944", "+919025501273", "+919942253436", "+919043542311"};
//const String hardwired_nos[] = {"+919025854746", "+919500357482"};

String db_nos[DB_BANK_SIZE];

#define DEFAULT_BANK_SIZE(hardwired_nos) (sizeof(hardwired_nos) / sizeof(hardwired_nos[0]))

#define ALERT_MSG_BUTTON "Emergency! The driver has pressed the alert button. Immediate action may be needed."
//for alert from raspberry pi
#define ALERT_MSG_RPI "Alert Emergency Alert! We've detected signs of drowsiness/inactivity."

struct GNSSinfo {
  int mode;
  int gps_svs;
  int glonass_svs;
  int beidou_svs;
  double lat;
  char lat_dir;
  double log;
  char log_dir;
  String date_utc;
  String time_utc;
  float alt;
  float speed;
  float course;
}gnssinfo;


// Function to send AT commands to SIM7600
bool sendAT(String cmd, bool debug = true, bool sms = false, uint32_t max_timeout = 5000) {
  if (sms) {
    SerialAT.print(cmd);  // Send AT command
    delay(500);
    SerialAT.write(26);   // Send Ctrl+Z properly
    delay(500);
  } else {
    SerialAT.println(cmd);  // Send AT command
  }

  unsigned long startTime = millis();  // Start timeout timer
  while (!SerialAT.available()) {
    if (millis() - startTime > max_timeout) {
      SerialMon.println("Error: No response from SIM7600");
      return false;
    }
  }

  String res = SerialAT.readStringUntil('\0');  // Read response

  if (debug) {
    SerialMon.println("\nResponse:");
    SerialMon.println(res);
  }

  // Check response for success or failure
  if (res.indexOf("OK") != -1 || res.indexOf(">") != -1) return true;
  if (res.indexOf("ERROR") != -1) return false;
  return false;
}


String getAT(String cmd, bool debug = false, uint32_t max_timeout = 5000, String key = "OK"){
  SerialAT.println(cmd);  // Send the AT command

  unsigned long timeout = millis();  // Start the timer to avoid hanging forever
  while (SerialAT.available() == 0) {
    if (millis() - timeout > max_timeout) {  // Timeout after 5 seconds

      if(debug){SerialMon.println("Error: No response from SIM7600");}

      return "";
    }
  }

  String res = SerialAT.readString();  // Read the response

  if(debug){
    SerialMon.println("\nResponse: ");
    SerialMon.println(res);  // Print the response for debugging 
  }

  // Check if response contains "OK" (successful response)
  if (res.indexOf(key) != -1) {
    return res;
  } else {
    SerialMon.println("Error: Response not OK");
    return "";
  }
}


void waitForModemBoot(){
  String key = "RDY";
  String res = "";
  while(res.indexOf(key) == -1){
    res = SerialAT.readString(); //wait till modem restarts
  }
}

bool restartModem(){
  SerialMon.println("\n*******Restarting Modem******");
  if(sendAT("AT+CRESET")){
    delay(20000);

    waitForModemBoot();
    SerialMon.println("Restart Successfull.");
    SerialMon.println("*****DONE*****\n");
    return true;
  } else {
    SerialMon.println("Modem is already restarting, ABORTING restart procedure call.");
    waitForModemBoot();
    SerialMon.println("*****DONE*****\n");
    return false;
  }
}

bool initNetwork(){
  SerialMon.println("\n*******Initializing Network******");
  if(sendAT("AT+CREG=2")){
    sendAT("AT+CSQ");
    SerialMon.println("Registered & Connected to "+String(apn)+"\n");
    SerialMon.println("*****DONE*****\n");
    return true;
  } else {
    SerialMon.println("Network Initialization Failed. Retrying...");
    return false;
  }
}

bool initGPS(){
  SerialMon.println("\n*******Initializing GPS/GNSS/GLONASS******\n");

  //check if modem is already on
  String gps_stat = getAT("AT+CGPS?");
  if(gps_stat.indexOf("+CGPS: 1,1") != -1){ //if already on
    SerialMon.println("*****DONE*****\n");
    return true;
  }

  if(sendAT("AT+CGPS=1")){
    SerialMon.println("GPS Enabled");
    SerialMon.println("*****DONE*****\n");
    return true;
  } else {
    SerialMon.println("GPS Initialization Failed. Retrying...");
    return false;
  }
}

void initSerials(){
  // Set console baud rate
  SerialMon.begin(115200);
  delay(2000);
  SerialMon.println("\n\n\n*****Initializing Serial PORTS*****");
  // Set GSM module baud rate
  SerialAT.begin(UART_BAUD, SERIAL_8N1, MODEM_RX, MODEM_TX);
  delay(2000);
}




bool GNSSinfo(bool debug = true){

  if(gnssinfo.mode == 0){
    SerialMon.println("Failed to fetch GPS/GNSS information. No Satellite fix.");
    return false;
  } else {
    SerialMon.println("GPS/GNSS fix obtained.");
  }

  if(debug) {
    SerialMon.println("\n--------GNSS INFORMATION--------");
    SerialMon.println("Mode: "+String(gnssinfo.mode));
    SerialMon.println("GPS Satellites: "+String(gnssinfo.gps_svs));
    SerialMon.println("GLONASS Satellites: "+String(gnssinfo.glonass_svs));
    SerialMon.println("BeiDou Satellites: "+String(gnssinfo.beidou_svs));
    SerialMon.println("Latitude: "+String(gnssinfo.lat, 6));
    SerialMon.println("N/S: "+String(gnssinfo.lat_dir));
    SerialMon.println("Longitude: "+String(gnssinfo.log, 6));
    SerialMon.println("E/W: "+String(gnssinfo.log_dir));
    SerialMon.println("Date: "+gnssinfo.date_utc);
    SerialMon.println("Time: "+gnssinfo.time_utc);
    SerialMon.println("Altitude: "+String(gnssinfo.alt));
    SerialMon.println("Speed: "+String(gnssinfo.speed));
    SerialMon.println("Course: "+String(gnssinfo.course));
    SerialMon.println("---------------------------------\n");
  }

  return true;
}

double convertDMMtoDD(double dmm, char direction) {
    double degrees = (int)(dmm / 100); // Extract degrees
    double minutes = dmm - (degrees * 100); // Extract minutes
    double decimal_degrees = degrees + (minutes / 60); // Convert to DD

    // Apply direction correction
    if (direction == 'S' || direction == 'W') {
        decimal_degrees *= -1;
    }

    return decimal_degrees;
}

void fetchGNSSinfo(){
  SerialMon.println("*****Fetching GPS/GNSS Information...*****");
  //buf --> a buffer to store string data from serial coms
  String buf = getAT("AT+CGPS?");
  //if gps is configed to standalone mode, then fetch location
  if(buf != "" && (buf.indexOf("+CGPS: 1,1") != -1 || (buf.indexOf("+CGPS: 1") != -1))){
    buf = getAT("AT+CGNSSINFO");

    const int len = buf.length();

    int start_index = buf.indexOf(": ")+2;
    int end_index = buf.indexOf(",");
    gnssinfo.mode = buf.substring(start_index, end_index).toInt();

    start_index = end_index+1;
    end_index = buf.substring(start_index, len).indexOf(",")+start_index;
    gnssinfo.gps_svs = buf.substring(start_index, end_index).toInt();

    start_index = end_index+1;
    end_index = buf.substring(start_index, len).indexOf(",")+start_index;
    gnssinfo.glonass_svs = buf.substring(start_index, end_index).toInt();

    start_index = end_index+1;
    end_index = buf.substring(start_index, len).indexOf(",")+start_index;
    gnssinfo.beidou_svs = buf.substring(start_index, end_index).toInt();

    start_index = end_index+1;
    end_index = buf.substring(start_index, len).indexOf(",")+start_index;
    double lat_raw = buf.substring(start_index, end_index).toDouble();
    

    start_index = end_index+1;
    end_index = buf.substring(start_index, len).indexOf(",")+start_index;
    gnssinfo.lat_dir = buf.substring(start_index, end_index).charAt(0);

    gnssinfo.lat = convertDMMtoDD(lat_raw, gnssinfo.lat_dir);;

    start_index = end_index+1;
    end_index = buf.substring(start_index, len).indexOf(",")+start_index;
    double log_raw = buf.substring(start_index, end_index).toDouble();
    
    start_index = end_index+1;
    end_index = buf.substring(start_index, len).indexOf(",")+start_index;
    gnssinfo.log_dir = buf.substring(start_index, end_index).charAt(0);

    gnssinfo.log = convertDMMtoDD(log_raw, gnssinfo.log_dir);

    start_index = end_index+1;
    end_index = buf.substring(start_index, len).indexOf(",")+start_index;
    gnssinfo.date_utc = buf.substring(start_index, end_index);

    start_index = end_index+1;
    end_index = buf.substring(start_index, len).indexOf(",")+start_index;
    gnssinfo.time_utc = buf.substring(start_index, end_index);

    start_index = end_index+1;
    end_index = buf.substring(start_index, len).indexOf(",")+start_index;
    gnssinfo.alt = buf.substring(start_index, end_index).toFloat();

    start_index = end_index+1;
    end_index = buf.substring(start_index, len).indexOf(",")+start_index;
    gnssinfo.speed = buf.substring(start_index, end_index).toFloat();

    start_index = end_index+1;
    end_index = buf.substring(start_index, len).indexOf(",")+start_index;
    gnssinfo.course = buf.substring(start_index, end_index).toFloat();


    GNSSinfo();

    
  } else {
    SerialMon.println("Failed to start GPS/GNSS services. Restarting GPS services...");
    sendAT("AT+CGPS=1,1");
    fetchGNSSinfo();
  }
}

void userCmds() {
  SerialMon.println("\n******Entering DevMode*****\n");
  String cmd = "";
  String key = "exit";
  while(1){
    while(SerialMon.available() == 0) {}
    cmd = SerialMon.readString();

    if(cmd.equalsIgnoreCase(key)) break;

    sendAT(cmd);
  }
  SerialMon.println("\n******Exiting DevMode*****\n");
  return;
}

bool sendMSG(const String num, int alert_flag) {
  sendAT("AT+CMGF=1"); // Set text mode
  delay(500);

  sendAT("AT+CMGS=\""+num+"\""); // Set recipient number
  delay(500);

  // Construct the GPS link
  String gpsLink = "https://www.google.com/maps?q=" + String(gnssinfo.lat, 6) + "," + String(gnssinfo.log, 6);
  
  // Send message with GPS location
  if(gnssinfo.mode == 0) {
    switch(alert_flag) {

    case 1: if (sendAT(String(ALERT_MSG_BUTTON)+" Location not available.", true, true)) {
              delay(500);
              return true;
            } break;

    case 2: if (sendAT(String(ALERT_MSG_RPI)+" Location not available.", true, true)) {
              delay(500);
              return true;
            } break;
    }
  } else {
    switch(alert_flag) {

    case 1: if (sendAT(String(ALERT_MSG_BUTTON)+" Check location: " + gpsLink, true, true)) {
              delay(500);
              return true;
            } break;

    case 2: if (sendAT(String(ALERT_MSG_RPI)+" Check location: " + gpsLink, true, true)) {
              delay(500);
              return true;
            } break;

  }
  }
  delay(500);
  return false;
}

void processSendSMS(int alert_flag) {
  SerialMon.println("******Sending SMS******");
  //for hardwired users
  for(int i = 0; i < DEFAULT_BANK_SIZE(hardwired_nos); i++) {
    if(sendMSG(hardwired_nos[i], alert_flag)) 
      SerialMon.printf("%s - SMS sent\n", hardwired_nos[i]);
    else
      SerialMon.printf("%s - failed\n", hardwired_nos[i]);

    delay(2000);
  }
}

void watchButton() {
  static unsigned long pressStart = 0;   // store press start time
  bool currentButtonState = digitalRead(BTN);

  // Button pressed (LOW)
  if (currentButtonState == LOW) {
    if (pressStart == 0) {
      pressStart = millis();  // record the time when button is first pressed
    }
    // Check if held for 2 seconds
    if (millis() - pressStart >= 2000) {
      Serial.println("Button Pressed for 2s: SOS Message Sent");
      fetchGNSSinfo();
      delay(500);
      processSendSMS(1);
      // Reset pressStart so it won’t send repeatedly
      pressStart = 0;
      // Wait until button released
      while (digitalRead(BTN) == LOW);
    }
  } 
  else {
    // Button released → reset timer
    pressStart = 0;
  }
}


void setup(){
  /*
    MODEM_PWRKEY IO:4 The power-on signal of the modulator must be given to it,
    otherwise the modulator will not reply when the command is sent
  */
  pinMode(MODEM_PWRKEY, OUTPUT);
  digitalWrite(MODEM_PWRKEY, HIGH);
  delay(300); //Need delay
  digitalWrite(MODEM_PWRKEY, LOW);
  delay(3000);

  initSerials();
  restartModem();
  
  if(initNetwork() &&  initGPS()){
    // modem_ready = true;
    SerialMon.println("\n*****Modem Ready*****\n\n");
  }
  pinMode(BTN, INPUT_PULLUP);

  delay(2000);
}


void loop() {

  watchButton();

  // Check for serial input
  if (SerialMon.available()) {
    String user_input = SerialMon.readString();

    if (user_input.equalsIgnoreCase("dev")) {
      userCmds();
    } else if (user_input.equalsIgnoreCase("getloc")) {
      fetchGNSSinfo();
    } else if (user_input.equalsIgnoreCase("sendmsg")) {
      fetchGNSSinfo();
      delay(500);
      processSendSMS(2);
    }
  }
}
 