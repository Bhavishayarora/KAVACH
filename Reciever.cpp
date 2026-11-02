#include <Arduino.h>
#include <SPI.h>
#include <LoRa.h>
#include <WiFi.h>
#include <PubSubClient.h>


// ---------- WIFI ----------
const char* ssid = "rani";
const char* password = "rani@123";


// ---------- MQTT ----------
const char* mqtt_server = "broker.hivemq.com";
const int mqtt_port = 1883;

WiFiClient espClient;
PubSubClient client(espClient);


// ---------- LORA ----------
#define LORA_SCK   18
#define LORA_MISO  19
#define LORA_MOSI  23
#define LORA_NSS   5
#define LORA_RST   14
#define LORA_DIO0  26



void setup_wifi()
{
  WiFi.begin(ssid,password);

  Serial.print("Connecting WiFi");

  while(WiFi.status()!=WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi Connected");
}



void reconnect()
{
  while(!client.connected())
  {

    Serial.print("MQTT Connecting...");

    String id =
    "ESP32Gateway-" + String(random(1000));


    if(client.connect(id.c_str()))
    {
      Serial.println("Connected");
    }
    else
    {
      Serial.println("Failed");
      delay(3000);
    }
  }
}





void setup()
{

  Serial.begin(115200);


  setup_wifi();


  client.setServer(
    mqtt_server,
    mqtt_port
  );



  SPI.begin(
    LORA_SCK,
    LORA_MISO,
    LORA_MOSI,
    LORA_NSS
  );



  LoRa.setPins(
    LORA_NSS,
    LORA_RST,
    LORA_DIO0
  );



  if(!LoRa.begin(433E6))
  {
    Serial.println("LoRa Failed");
    while(1);
  }


  Serial.println(
  "LoRa MQTT Gateway Ready");

}




void loop()
{

  if(!client.connected())
  {
    reconnect();
  }

  client.loop();



  int packetSize =
  LoRa.parsePacket();



  if(packetSize)
  {

    String data="";


    while(LoRa.available())
    {
      data +=
      (char)LoRa.read();
    }



    Serial.println(
    "Received:");

    Serial.println(data);



    client.publish(
    "child/watch/data",
    data.c_str()
    );


    Serial.println(
    "Sent to MQTT");

  }

}
