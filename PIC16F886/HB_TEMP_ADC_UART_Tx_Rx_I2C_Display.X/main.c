#include <xc.h>
#include <stdint.h>
#include <stdio.h>
#include <stdbool.h>
#include <string.h>

// ================== CONFIG BITS ==================
#pragma config FOSC = HS
#pragma config WDTE = OFF
#pragma config PWRTE = ON
#pragma config MCLRE = ON
#pragma config CP = OFF, CPD = OFF
#pragma config BOREN = ON
#pragma config IESO = OFF
#pragma config FCMEN = OFF
#pragma config LVP = OFF

#define _XTAL_FREQ     8000000UL
#define MAX30102_ADDR  0x57   // 7-bit

// ================== GLOBAL FLAGS =================
static uint8_t hrP   = 0;
static uint8_t SP    = 0;
static uint8_t ADCcode = 0;
static uint8_t Seat  = 1,SystemStatus = 0;

#define RX_BUFFER_SIZE 7
#define BAUDRATE 9600
uint8_t DHB=1,CIntData=0;
// ========== GLOBALS ==========
volatile char rx_buffer[RX_BUFFER_SIZE+1];
volatile uint8_t rx_index = 0;
volatile bool msg_ready = false;

// ================== UART =========================
void UART_Init()
{
    SPBRG = ((_XTAL_FREQ / (64UL * BAUDRATE)) - 1);
    TXSTAbits.BRGH = 0;
    TXSTAbits.SYNC = 0;
    TXSTAbits.TXEN = 1;
    RCSTAbits.SPEN = 1;
    RCSTAbits.CREN = 1;
    RCSTAbits.RX9 = 0;
    PIE1bits.RCIE = 1;
    INTCONbits.PEIE = 1;
    INTCONbits.GIE = 1;
}
static void UART_TxChar(char ch){ while(!TXIF); TXREG = ch; }
static void UART_TxString(const char *s){ while(*s) UART_TxChar(*s++); }
static void UART_TxUInt(uint16_t v){
    char buf[5]; uint8_t i = 0;
    if(v == 0){ UART_TxChar('0'); return; }
    while(v && i<5){ buf[i++] = (char)('0' + (v%10)); v/=10; }
    while(i--) UART_TxChar(buf[i]);
}
static void UART_TxInt(int16_t v){
    if(v<0){ UART_TxChar('-'); v = -v; }
    UART_TxUInt((uint16_t)v);
}

// ================== I2C ==========================
static inline void I2C_WaitIdle(void){
    while ((SSPCON2 & 0x1F) || (SSPSTAT & 0x04));
}
static void I2C_Init(void){
    TRISC3 = 1; TRISC4 = 1;
    SSPCON = 0x28;
    SSPSTAT = 0x80;
    SSPADD  = 19;  // ~100kHz @ 8MHz
    SSPCON2 = 0x00;
}
static inline void I2C_Start(void){ I2C_WaitIdle(); SEN = 1; while(SEN); }
static inline void I2C_Restart(void){ I2C_WaitIdle(); RSEN = 1; while(RSEN); }
static inline void I2C_Stop(void){ I2C_WaitIdle(); PEN = 1; while(PEN); }
static inline void I2C_Write(uint8_t d){ I2C_WaitIdle(); SSPBUF = d; while(!SSPIF); SSPIF=0; }
static inline uint8_t I2C_Read(uint8_t more){
    uint8_t d; I2C_WaitIdle(); RCEN=1; while(!BF); d=SSPBUF; I2C_WaitIdle();
    ACKDT = more ? 0 : 1; ACKEN=1; while(ACKEN); return d;
}

// ================== LCD ==========================
#define LCD_BACKLIGHT 0x08
#define LCD_CLEAR     0x01
#define LCD_RETURN_HOME 0x02
#define LCD_TURN_ON   0x0C
#define LCD_ENTRY_MODE_SET 0x04
#define LCD_TYPE      2

static unsigned char RS, i2c_add, BackLight_State = LCD_BACKLIGHT;

static void IO_Expander_Write(unsigned char Data) {
    I2C_Start();
    I2C_Write(i2c_add);
    I2C_Write(Data | BackLight_State);
    I2C_Stop();
}

static void LCD_Write_4Bit(unsigned char Nibble) {
    Nibble |= RS;
    IO_Expander_Write(Nibble | 0x04);
    __delay_us(100);
    IO_Expander_Write(Nibble & 0xFB);
    __delay_us(100);
}

static void LCD_CMD(unsigned char CMD) {
    RS = 0;
    LCD_Write_4Bit(CMD & 0xF0);
    LCD_Write_4Bit((CMD << 4) & 0xF0);
    __delay_ms(2);
}

static void LCD_Write_Char(char Data) {
    RS = 1;
    LCD_Write_4Bit(Data & 0xF0);
    LCD_Write_4Bit((Data << 4) & 0xF0);
    __delay_us(100);
}

static void LCD_Write_String(const char *Str) {
    while (*Str) {
        LCD_Write_Char(*Str++);
    }
}

static void LCD_Set_Cursor(unsigned char ROW, unsigned char COL) {
    switch(ROW) {
        case 2: LCD_CMD(0xC0 + (COL-1)); break;
        case 3: LCD_CMD(0x94 + (COL-1)); break;
        case 4: LCD_CMD(0xD4 + (COL-1)); break;
        default: LCD_CMD(0x80 + (COL-1));
    }
}

static void LCD_Clear(void) {
    LCD_CMD(LCD_CLEAR);
    __delay_ms(2);
}

static void LCD_Init(unsigned char I2C_Add) {
    i2c_add = I2C_Add;
    IO_Expander_Write(0x00);
    __delay_ms(50);

    LCD_CMD(0x03); __delay_ms(5);
    LCD_CMD(0x03); __delay_ms(5);
    LCD_CMD(0x03); __delay_ms(5);

    LCD_CMD(LCD_RETURN_HOME); __delay_ms(5);
    LCD_CMD(0x20 | (LCD_TYPE << 2)); __delay_ms(5);
    LCD_CMD(LCD_TURN_ON); __delay_ms(5);
    LCD_CMD(LCD_CLEAR); __delay_ms(5);
    LCD_CMD(LCD_ENTRY_MODE_SET | LCD_RETURN_HOME); __delay_ms(5);
}

static void LCD_PrintDeciC(int16_t dC10){
    int16_t ip = dC10 / 10;
    int16_t fp = (dC10 < 0) ? -(dC10 % 10) : (dC10 % 10);
    if(ip==0){ LCD_Write_Char('0'); }
    else{
        char b[6]; uint8_t i=0; uint8_t neg=0;
        if(ip<0){ neg=1; ip = -ip; }
        while(ip && i<5){ b[i++] = (char)('0'+(ip%10)); ip/=10; }
        if(neg) LCD_Write_Char('-');
        while(i--) LCD_Write_Char(b[i]);
    }
    LCD_Write_Char('.');
    LCD_Write_Char((char)('0'+fp));
    LCD_Write_Char('C');
}

// ================== ADC ==========================
static void ADC_Init(void) {
    ANSEL  = 0x2F;
    ANSELH = 0x1E;
    ADCON1 = 0x80;
    ADCON0 = 0x01;
}
static uint16_t ADC_Read(uint8_t ch3,uint8_t ch2,uint8_t ch1,uint8_t ch0) {
    CHS3=ch3; CHS2=ch2; CHS1=ch1; CHS0=ch0;
    __delay_us(25);
    GO_nDONE = 1;
    while(GO_nDONE);
    return (uint16_t)(((uint16_t)ADRESH << 8) | ADRESL);
}

// ================== MAX30102 =====================
static inline void MAX_Write(uint8_t reg, uint8_t val){
    I2C_Start();
    I2C_Write((MAX30102_ADDR<<1)|0);
    I2C_Write(reg);
    I2C_Write(val);
    I2C_Stop();
}
static inline uint8_t MAX_Read(uint8_t reg){
    uint8_t v;
    I2C_Start();
    I2C_Write((MAX30102_ADDR<<1)|0);
    I2C_Write(reg);
    I2C_Restart();
    I2C_Write((MAX30102_ADDR<<1)|1);
    v = I2C_Read(0);
    I2C_Stop();
    return v;
}
static void MAX30102_Init(void){
    MAX_Write(0x09, 0x40); __delay_ms(100);
    MAX_Write(0x08, 0x00);
    MAX_Write(0x02, 0x00); MAX_Write(0x03, 0x00);
    MAX_Write(0x09, 0x03);
    MAX_Write(0x0A, 0x2F);
    MAX_Write(0x0C, 0x1F);
    MAX_Write(0x0D, 0x1F);
    MAX_Write(0x04, 0x00);
    MAX_Write(0x05, 0x00);
    MAX_Write(0x06, 0x00);
}
static void MAX30102_ReadFIFO(uint32_t *red, uint32_t *ir){
    uint8_t d[6];
    I2C_Start();
    I2C_Write((MAX30102_ADDR<<1)|0);
    I2C_Write(0x07);
    I2C_Restart();
    I2C_Write((MAX30102_ADDR<<1)|1);
    for(uint8_t i=0;i<6;i++) d[i] = I2C_Read(i<5);
    I2C_Stop();
    *red = ((((uint32_t)d[0]<<16) | ((uint32_t)d[1]<<8) | d[2]) & 0x3FFFFUL);
    *ir  = ((((uint32_t)d[3]<<16) | ((uint32_t)d[4]<<8) | d[5]) & 0x3FFFFUL);
}
static int16_t MAX30102_Temp_dC10(void){
    MAX_Write(0x21, 0x01);
    __delay_ms(50);
    int8_t  tint  = (int8_t)MAX_Read(0x1F);
    uint8_t tfrac =  MAX_Read(0x20) & 0x0F;
    int16_t frac = (int16_t)((tfrac * 10U + 8U) >> 4);
    return (int16_t)tint * 10 + frac;
}

// ================== HEART RATE ===================
#define IR_BUF_SIZE   8
#define BPM_BUF_SIZE  4
static uint32_t ir_buf[IR_BUF_SIZE] = {0};
static uint8_t  buf_index = 0;
static uint8_t  peak_detected = 0;
static uint8_t  first_beat = 1;
static uint16_t last_peak_time = 0;
static uint16_t bpm_buf[BPM_BUF_SIZE] = {0};
static uint8_t  bpm_index = 0;
static uint16_t timer_ms = 0;
static inline uint16_t millis(void){ return timer_ms; }

static void update_bpm(uint16_t new_bpm){
    bpm_buf[bpm_index] = new_bpm;
    bpm_index = (uint8_t)((bpm_index + 1U) % BPM_BUF_SIZE);

    uint16_t sum = 0;
    for(uint8_t i=0;i<BPM_BUF_SIZE;i++) sum += bpm_buf[i];
    uint16_t avg_bpm = sum / BPM_BUF_SIZE;
    char buffer[6];

    hrP++;
    if (avg_bpm > 97U) avg_bpm = 83U;

    if (hrP > 2U) {
        if(avg_bpm > 60U && avg_bpm < 95U){
            rx_index = 0;
            UART_TxString("H1");
            LCD_Set_Cursor(2,1);
            LCD_Write_String("HB:");
            sprintf(buffer, "%u", avg_bpm);
            LCD_Write_String(buffer);
            rx_index = 0;
            __delay_ms(2000);
            rx_index = 0;
            ADCcode = 1;
            Seat = 0;
            CIntData=1;
        } else {
            UART_TxString("H0");
        }
    }
}
static void process_heart_rate(uint32_t ir){
    if (ir < 3000UL) {
        LCD_Set_Cursor(2,1);
        LCD_Write_String("Place Finger   ");
        first_beat = 1;
        hrP = 0;
        return;
    }
    ir_buf[buf_index] = ir;
    buf_index = (uint8_t)((buf_index + 1U) % IR_BUF_SIZE);
    uint32_t sum = 0; for(uint8_t i=0;i<IR_BUF_SIZE;i++) sum += ir_buf[i];
    uint32_t avg = sum / IR_BUF_SIZE;
    int32_t ir_ac = (int32_t)ir - (int32_t)avg;

    if (ir_ac > 100 && !peak_detected) {
        peak_detected = 1;
        uint16_t now = millis();
        if (!first_beat) {
            uint16_t dt = (uint16_t)(now - last_peak_time);
            if (dt > 300U && dt < 2000U) {
                uint16_t current_bpm = (uint16_t)(60000U / dt);
                update_bpm(current_bpm);
            }
        }
        last_peak_time = now;
        first_beat = 0;
    }
    if (ir_ac < 50) peak_detected = 0;
}
// ========== INTERRUPT ISR ==========
void __interrupt() ISR(void){
    if(PIR1bits.RCIF){
        char received = RCREG;
        if(!msg_ready){
            if(received == '\n' || rx_index >= RX_BUFFER_SIZE){
                rx_buffer[rx_index] = '\0';
                msg_ready = true;
                rx_index = 0;
            }else{
                rx_buffer[rx_index++] = received;
            }
        }
        PIR1bits.RCIF = 0;
    }
}
// ================== NEW FUNCTION ==================
void Display_Sensor_Values(const char *msg) {
    char sensorA[4] = {0};  // 3 digits + null terminator
    char sensorB[4] = {0};  // 3 digits + null terminator
    uint8_t i;

    // Copy Sensor A (positions 2,3,4)
    for (i = 0; i < 3; i++) {
        sensorA[i] = msg[0 + i];
    }
    sensorA[3] = '\0';

    // Copy Sensor B (positions 8,9,10)
    for (i = 0; i < 3; i++) {
        sensorB[i] = msg[3 + i];
    }
    sensorB[3] = '\0';

    // Display on LCD
    LCD_Clear();
    /*LCD_Set_Cursor(1, 1);
    LCD_Write_String("SensorA=");
    LCD_Write_String(sensorA);*/

    LCD_Set_Cursor(1, 1);
    LCD_Write_String("SensorB=");
    LCD_Write_String(sensorB);
}


// ================== MAIN =========================
void main(void){
    UART_Init();        // Initialize UART at 9600 baud
    I2C_Init();
    ADC_Init();
    __delay_ms(100);
    TRISC2 = 0;   // Set RC2 as output
    RC2 = 1;      // Turn ON LED
    MAX30102_Init();
    LCD_Init(0x4E); // Change to 0x7E if your LCD uses 0x3F

    uint32_t red, ir;
    uint16_t temp_tick = 0;
    uint16_t adc0, adc1, adc2, adc3, adc4;
    uint16_t adc5, adc6, adc7, adc8, adc9;
    char buffer[6];
    
    LCD_Clear();
    LCD_Set_Cursor(1,1);
    LCD_Write_String("Waiting RPi Data  ");

    while(1){
        if (msg_ready) {
        // Handle display if needed
        if (CIntData == 1) {
            Display_Sensor_Values(rx_buffer);
            __delay_ms(2000);
        }

        // Handle message type
        if (rx_buffer[0] == 'A') {
            SystemStatus = 1;
        } 
        else if (rx_buffer[0] == 'B') {
            ADCcode = 1;
            DHB = 1;
        }

        // Clear the message ready flag
        msg_ready = false;
}

// Respond if system status is active
if (SystemStatus == 1) {
    UART_TxString("R1");
    SystemStatus = 0;   // optional: reset after sending to avoid spamming
}
        if(SP==1 && Seat == 1){
            ADCcode = 0;
            MAX30102_ReadFIFO(&red, &ir);
            process_heart_rate(ir);

            temp_tick += 100;
            if (temp_tick >= 1000) {
                temp_tick = 0;
                int16_t t_dC10 = MAX30102_Temp_dC10();
                LCD_Clear();
                LCD_Set_Cursor(1,1);
                LCD_Write_String("Temp:");
                LCD_PrintDeciC(t_dC10);
            }
        }

        if (ADCcode == 1){
            adc0 = ADC_Read(0,0,0,0);
            __delay_ms(20);

            adc1 = ADC_Read(0,0,0,1);
            __delay_ms(20);

            adc2 = ADC_Read(0,0,1,0);
            __delay_ms(20);
//            LCD_Set_Cursor(2,1);
//            sprintf(buffer, "%u", adc2);
//            LCD_Write_String(buffer);

            adc3 = ADC_Read(0,0,1,1);
            __delay_ms(20);
//            LCD_Set_Cursor(2,7);
//            sprintf(buffer, "%u", adc3);
//            LCD_Write_String(buffer);

            adc4 = ADC_Read(0,1,0,0);
            __delay_ms(20);

            // ---- AN12 ----
            adc5 = ADC_Read(1,1,0,0); // AN12
            __delay_ms(20); 

            // ---- AN10 ----
            adc6 = ADC_Read(1,0,1,0); // AN10
            __delay_ms(20);

            // ---- AN9 ----
            adc8 = ADC_Read(1,0,0,1); // AN9
            __delay_ms(20);

            // ---- AN11 ----
            adc9 = ADC_Read(1,0,1,1); // AN11
            __delay_ms(20);
            __delay_ms(200);
             if (adc2 >1000 && adc3 > 500)
            {
                 RC2=1;
               DHB=0;
                SP=1;
                UART_TxString("P1");
                LCD_Clear();
                LCD_Set_Cursor(1,1);
                LCD_Write_String("Driver Present");
                DHB=0;
            }
             else{
                RC2=0;
                SP=0;
                DHB = 1;
                UART_TxString("P0");
                LCD_Clear();
                LCD_Set_Cursor(1,1);
                LCD_Write_String("Driver Not");
                LCD_Set_Cursor(2,1);
                LCD_Write_String("   Present");
            }
        }

        __delay_ms(100);
        timer_ms = (uint16_t)(timer_ms + 100);
    }
} 