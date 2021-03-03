
/**
 * Use this file to define custom functions and blocks.
 * Read more at https://makecode.microbit.org/blocks/custom
 */

enum MOTOR {
    //% block="M1"
    M1=0X00,
    //% block="M2"
    M2=0X02,
    //% block="M3"
    M3=0X04,
    //%block="M4"
    M4=0X06
}

enum DIRECTION {
    //% block="CW"
    CW=0X0,
    //% block="CCW"
    CCW=0X01
}

enum LED {
    //% block="Red"
    RD=0X8,
    //% block="Yellow"
    YW=0X09,
    //%block="Green"
    GN=0X0A
}

enum SWITCH{
    //% block="ON"
    ON=0X01,
    //% block="OFF"
    OFF=0X00
}

enum STATE{
    //% block="Speed"
    SPEED,
    //% block="Direction"
    DIR
}

enum RELAY{
    //% block="close"
    CLOSE,
    //% block="discon"
    DISCON
}

//% weight=100 color=#0fbc11 icon="" block="PinPong"
namespace pinpong {

    const i2cAddr = 0x10;
  /**
   * 电机运行
   */
    //% weight=100
    //% blockId=pinpong_motorRun block="motor %index move %dir at speed %speed"
    //% speed.min=0 speed.max=255
    export function motorRun(index:MOTOR, dir:DIRECTION, speed:number): void {
        pins.i2cWriteNumber(i2cAddr, index, NumberFormat.Int8LE)
        let buf=pins.createBuffer(2);
        buf[0]=dir;
        buf[1]=speed;
        pins.i2cWriteBuffer(i2cAddr, buf)
    }
    /**
     * 电机停止
     */
    //% weight=99
    //% blockId=pinpong_motorStop block="motor %index stop"
    export function motorStop(index:MOTOR){
        let buf=pins.createBuffer(3);
        buf[0]=index;
        buf[1]=0;
        buf[2]=0;
        pins.i2cWriteBuffer(i2cAddr, buf);
    }
    /**
     * LED灯控制
     */
    //% weight=98
    //% blockId=pinpong_LED block="%color LED True %state"
    export function LED(color:LED, state:SWITCH){
        let buf=pins.createBuffer(2);
        buf[0]=color;
        buf[1]=state;
        pins.i2cWriteBuffer(i2cAddr, buf);
    }
    /**
     * 读取电位器数据
     */
    //% weight=97
    //% blockId=pinpong_getPotentiometer block="read potentiometer number"
    export function readPotentiometer():number{
        pins.i2cWriteNumber(i2cAddr, 0X0B, NumberFormat.Int8LE);
        let buf = pins.i2cReadBuffer(i2cAddr, 2)
        let data =buf[0]<<8|buf[1]; 
        return data;
    }
    /**
     * 读取火焰传感器数据
     */
    //% weight=96
    //% blockId=pinpong_readFlame block="read flame sensor number"
    export function readFlame():number{
        pins.i2cWriteNumber(i2cAddr, 0x0D, NumberFormat.Int8LE);
        let buf = pins.i2cReadBuffer(i2cAddr, 2);
        let data = buf[0]<<8|buf[1];
        return data;
    }
    /**
     * 获取电机方向和速度
     */
    //% weight=95
    //% blockId=pinpong_motorState block="motor %motor state %state"
    export function motorState(motor:MOTOR, state:STATE):number{
        pins.i2cWriteNumber(i2cAddr, motor, NumberFormat.Int8LE);
        let buf = pins.i2cReadBuffer(i2cAddr, 2);
        let data;
        switch(state){
            case STATE.SPEED: data = buf[0];break;
            case STATE.DIR: data = buf[1];break;
            default:break;
        }
        return data;
    }
    /**
     * 获取LED灯状态
     */
    //% weight=94
    //%blockId=pinpong_LDEState block="%color state"
    export function LEDState(color:LED):number{
        pins.i2cWriteNumber(i2cAddr, color, NumberFormat.Int8LE);
        return pins.i2cReadNumber(i2cAddr, NumberFormat.Int8LE);
    }
    /**
     * 继电器控制
     */
    //% weight=93
    //%blockId=pinpong_setRelay block="%state relay"
    export function setRelay(state:RELAY){
        switch(state){
            case RELAY.CLOSE: pins.digitalWritePin(DigitalPin.P9, 1);break;
            case RELAY.DISCON:pins.digitalWritePin(DigitalPin.P9, 0);break;
            default:break;
        }
    }
    /**
     * 超声波
     */
    //%weight=92
    //% blockId=ultrasonic_sensor block="read ultrasonic sensor (cm)"
    export function Ultrasonic(maxCmDistance = 500): number {
        let d
        pins.digitalWritePin(DigitalPin.P0, 1);
        basic.pause(1)
        pins.digitalWritePin(DigitalPin.P0, 0);
        if (pins.digitalReadPin(DigitalPin.P1) == 0) {
            pins.digitalWritePin(DigitalPin.P0, 0);
            //sleep_us(2);
            pins.digitalWritePin(DigitalPin.P0, 1);
            //sleep_us(10);
            pins.digitalWritePin(DigitalPin.P0, 0);
            d = pins.pulseIn(DigitalPin.P1, PulseValue.High, maxCmDistance * 58);//readPulseIn(1);
        } else {
            pins.digitalWritePin(DigitalPin.P0, 0);
            pins.digitalWritePin(DigitalPin.P0, 1);
            d = pins.pulseIn(DigitalPin.P1, PulseValue.Low, maxCmDistance * 58);//readPulseIn(0);
        }
        let x = d / 39;
        if (x <= 0 || x > 500) {
            return 0;
        }
        return Math.round(x);
    }
    
    /**
    * Initialize OLED, just put the module in the module at the beginning of the code, no need to reuse
    */

    //% weight=91
    //% block="init display"
    export function microIoT_initDisplay(): void {
        OLEDcmd(0xAE);  // Set display OFF
        OLEDcmd(0xD5);  // Set Display Clock Divide Ratio / OSC Frequency 0xD4
        OLEDcmd(0x80);  // Display Clock Divide Ratio / OSC Frequency 
        OLEDcmd(0xA8);  // Set Multiplex Ratio
        OLEDcmd(0x3F);  // Multiplex Ratio for 128x64 (64-1)
        OLEDcmd(0xD3);  // Set Display Offset
        OLEDcmd(0x00);  // Display Offset
        OLEDcmd(0x40);  // Set Display Start Line
        OLEDcmd(0x8D);  // Set Charge Pump
        OLEDcmd(0x14);  // Charge Pump (0x10 External, 0x14 Internal DC/DC)
        OLEDcmd(0xA1);  // Set Segment Re-Map
        OLEDcmd(0xC8);  // Set Com Output Scan Direction
        OLEDcmd(0xDA);  // Set COM Hardware Configuration
        OLEDcmd(0x12);  // COM Hardware Configuration
        OLEDcmd(0x81);  // Set Contrast
        OLEDcmd(0xCF);  // Contrast
        OLEDcmd(0xD9);  // Set Pre-Charge Period
        OLEDcmd(0xF1);  // Set Pre-Charge Period (0x22 External, 0xF1 Internal)
        OLEDcmd(0xDB);  // Set VCOMH Deselect Level
        OLEDcmd(0x40);  // VCOMH Deselect Level
        OLEDcmd(0xA4);  // Set all pixels OFF
        OLEDcmd(0xA6);  // Set display not inverted
        OLEDcmd(0xAF);  // Set display On
        OLEDclear();
    }
    /**
     * OLED clear
     */
    //% weight=90
    //% block="clear OLED"
    export function OLEDclear() {
        for (let j = 0; j < 8; j++) {
            OLEDsetText(j, 0);
            {
                for (let i = 0; i < 16; i++)  //clear all columns
                {
                    OLEDputChar(' ');
                }
            }
        }
        OLEDsetText(0, 0);
    }

    function OLEDsetText(row: number, column: number) {
        let r = row;
        let c = column;
        if (row < 0) { r = 0 }
        if (column < 0) { c = 0 }
        if (row > 7) { r = 7 }
        if (column > 15) { c = 15 }

        OLEDcmd(0xB0 + r);            //set page address
        OLEDcmd(0x00 + (8 * c & 0x0F));  //set column lower address
        OLEDcmd(0x10 + ((8 * c >> 4) & 0x0F));   //set column higher address
    }

    function OLEDputChar(c: string) {
        let c1 = c.charCodeAt(0);
        OLEDwriteCustomChar(basicFont[c1 - 32]);
    }
    /**
     * @param line line num (8 pixels per line), eg: 0
     * @param text value , eg: DFRobot
     * OLED  display string
     */
    //% weight=89
    //% text.defl="DFRobot"
    //% line.min=0 line.max=7
    //% block="OLED show text %text|on line %line"
    export function microIoT_showUserText(line: number, text: string): void {
        OLEDsetText(line, 0);
        for (let c of text) {
            OLEDputChar(c);
        }

        for (let i = text.length; i < 16; i++) {
            OLEDsetText(line, i);
            OLEDputChar(" ");
        }

    }
	/**
     * @param line line num (8 pixels per line), eg: 0
     * @param n value , eg: 2019
     * OLED  shows the number
     */
    //% weight=88
    //% line.min=0 line.max=7
    //% block="OLED show number %n|on line %line"

    export function OLEDshowUserNumber(line: number, n: number): void {
        pinpong.microIoT_showUserText(line, "" + n)
    }


    function OLEDwriteCustomChar(c: string) {
        for (let i = 0; i < 8; i++) {
            OLEDwriteData(c.charCodeAt(i));
        }
    }


    function OLEDcmd(c: number) {
        pins.i2cWriteNumber(0x3C, c, NumberFormat.UInt16BE);
    }


    function OLEDwriteData(n: number) {
        let b = n;
        if (n < 0) { n = 0 }
        if (n > 255) { n = 255 }

        pins.i2cWriteNumber(0x3C, 0x4000 + b, NumberFormat.UInt16BE);
    }

    const DISPLAY_OFF = 0xAE;
    const DISPLAY_ON = 0xAF;
    const basicFont: string[] = [
        "\x00\x00\x00\x00\x00\x00\x00\x00", // " "
        "\x00\x00\x5F\x00\x00\x00\x00\x00", // "!"
        "\x00\x00\x07\x00\x07\x00\x00\x00", // """
        "\x00\x14\x7F\x14\x7F\x14\x00\x00", // "#"
        "\x00\x24\x2A\x7F\x2A\x12\x00\x00", // "$"
        "\x00\x23\x13\x08\x64\x62\x00\x00", // "%"
        "\x00\x36\x49\x55\x22\x50\x00\x00", // "&"
        "\x00\x00\x05\x03\x00\x00\x00\x00", // "'"
        "\x00\x1C\x22\x41\x00\x00\x00\x00", // "("
        "\x00\x41\x22\x1C\x00\x00\x00\x00", // ")"
        "\x00\x08\x2A\x1C\x2A\x08\x00\x00", // "*"
        "\x00\x08\x08\x3E\x08\x08\x00\x00", // "+"
        "\x00\xA0\x60\x00\x00\x00\x00\x00", // ","
        "\x00\x08\x08\x08\x08\x08\x00\x00", // "-"
        "\x00\x60\x60\x00\x00\x00\x00\x00", // "."
        "\x00\x20\x10\x08\x04\x02\x00\x00", // "/"
        "\x00\x3E\x51\x49\x45\x3E\x00\x00", // "0"
        "\x00\x00\x42\x7F\x40\x00\x00\x00", // "1"
        "\x00\x62\x51\x49\x49\x46\x00\x00", // "2"
        "\x00\x22\x41\x49\x49\x36\x00\x00", // "3"
        "\x00\x18\x14\x12\x7F\x10\x00\x00", // "4"
        "\x00\x27\x45\x45\x45\x39\x00\x00", // "5"
        "\x00\x3C\x4A\x49\x49\x30\x00\x00", // "6"
        "\x00\x01\x71\x09\x05\x03\x00\x00", // "7"
        "\x00\x36\x49\x49\x49\x36\x00\x00", // "8"
        "\x00\x06\x49\x49\x29\x1E\x00\x00", // "9"
        "\x00\x00\x36\x36\x00\x00\x00\x00", // ":"
        "\x00\x00\xAC\x6C\x00\x00\x00\x00", // ";"
        "\x00\x08\x14\x22\x41\x00\x00\x00", // "<"
        "\x00\x14\x14\x14\x14\x14\x00\x00", // "="
        "\x00\x41\x22\x14\x08\x00\x00\x00", // ">"
        "\x00\x02\x01\x51\x09\x06\x00\x00", // "?"
        "\x00\x32\x49\x79\x41\x3E\x00\x00", // "@"
        "\x00\x7E\x09\x09\x09\x7E\x00\x00", // "A"
        "\x00\x7F\x49\x49\x49\x36\x00\x00", // "B"
        "\x00\x3E\x41\x41\x41\x22\x00\x00", // "C"
        "\x00\x7F\x41\x41\x22\x1C\x00\x00", // "D"
        "\x00\x7F\x49\x49\x49\x41\x00\x00", // "E"
        "\x00\x7F\x09\x09\x09\x01\x00\x00", // "F"
        "\x00\x3E\x41\x41\x51\x72\x00\x00", // "G"
        "\x00\x7F\x08\x08\x08\x7F\x00\x00", // "H"
        "\x00\x41\x7F\x41\x00\x00\x00\x00", // "I"
        "\x00\x20\x40\x41\x3F\x01\x00\x00", // "J"
        "\x00\x7F\x08\x14\x22\x41\x00\x00", // "K"
        "\x00\x7F\x40\x40\x40\x40\x00\x00", // "L"
        "\x00\x7F\x02\x0C\x02\x7F\x00\x00", // "M"
        "\x00\x7F\x04\x08\x10\x7F\x00\x00", // "N"
        "\x00\x3E\x41\x41\x41\x3E\x00\x00", // "O"
        "\x00\x7F\x09\x09\x09\x06\x00\x00", // "P"
        "\x00\x3E\x41\x51\x21\x5E\x00\x00", // "Q"
        "\x00\x7F\x09\x19\x29\x46\x00\x00", // "R"
        "\x00\x26\x49\x49\x49\x32\x00\x00", // "S"
        "\x00\x01\x01\x7F\x01\x01\x00\x00", // "T"
        "\x00\x3F\x40\x40\x40\x3F\x00\x00", // "U"
        "\x00\x1F\x20\x40\x20\x1F\x00\x00", // "V"
        "\x00\x3F\x40\x38\x40\x3F\x00\x00", // "W"
        "\x00\x63\x14\x08\x14\x63\x00\x00", // "X"
        "\x00\x03\x04\x78\x04\x03\x00\x00", // "Y"
        "\x00\x61\x51\x49\x45\x43\x00\x00", // "Z"
        "\x00\x7F\x41\x41\x00\x00\x00\x00", // """
        "\x00\x02\x04\x08\x10\x20\x00\x00", // "\"
        "\x00\x41\x41\x7F\x00\x00\x00\x00", // """
        "\x00\x04\x02\x01\x02\x04\x00\x00", // "^"
        "\x00\x80\x80\x80\x80\x80\x00\x00", // "_"
        "\x00\x01\x02\x04\x00\x00\x00\x00", // "`"
        "\x00\x20\x54\x54\x54\x78\x00\x00", // "a"
        "\x00\x7F\x48\x44\x44\x38\x00\x00", // "b"
        "\x00\x38\x44\x44\x28\x00\x00\x00", // "c"
        "\x00\x38\x44\x44\x48\x7F\x00\x00", // "d"
        "\x00\x38\x54\x54\x54\x18\x00\x00", // "e"
        "\x00\x08\x7E\x09\x02\x00\x00\x00", // "f"
        "\x00\x18\xA4\xA4\xA4\x7C\x00\x00", // "g"
        "\x00\x7F\x08\x04\x04\x78\x00\x00", // "h"
        "\x00\x00\x7D\x00\x00\x00\x00\x00", // "i"
        "\x00\x80\x84\x7D\x00\x00\x00\x00", // "j"
        "\x00\x7F\x10\x28\x44\x00\x00\x00", // "k"
        "\x00\x41\x7F\x40\x00\x00\x00\x00", // "l"
        "\x00\x7C\x04\x18\x04\x78\x00\x00", // "m"
        "\x00\x7C\x08\x04\x7C\x00\x00\x00", // "n"
        "\x00\x38\x44\x44\x38\x00\x00\x00", // "o"
        "\x00\xFC\x24\x24\x18\x00\x00\x00", // "p"
        "\x00\x18\x24\x24\xFC\x00\x00\x00", // "q"
        "\x00\x00\x7C\x08\x04\x00\x00\x00", // "r"
        "\x00\x48\x54\x54\x24\x00\x00\x00", // "s"
        "\x00\x04\x7F\x44\x00\x00\x00\x00", // "t"
        "\x00\x3C\x40\x40\x7C\x00\x00\x00", // "u"
        "\x00\x1C\x20\x40\x20\x1C\x00\x00", // "v"
        "\x00\x3C\x40\x30\x40\x3C\x00\x00", // "w"
        "\x00\x44\x28\x10\x28\x44\x00\x00", // "x"
        "\x00\x1C\xA0\xA0\x7C\x00\x00\x00", // "y"
        "\x00\x44\x64\x54\x4C\x44\x00\x00", // "z"
        "\x00\x08\x36\x41\x00\x00\x00\x00", // "{"
        "\x00\x00\x7F\x00\x00\x00\x00\x00", // "|"
        "\x00\x41\x36\x08\x00\x00\x00\x00", // "}"
        "\x00\x02\x01\x01\x02\x01\x00\x00"  // "~"
    ];
    let _brightness = 255
    let neopixel_buf = pins.createBuffer(16 * 3);
    for (let i = 0; i < 16 * 3; i++) {
        neopixel_buf[i] = 0
    }
    /**
     * TODO: describe your function here
     * @param value describe value here, eg: 5
     */
    //% block
    export function fib(value: number): number {
        return value <= 1 ? value : fib(value -1) + fib(value - 2);
    }
}
