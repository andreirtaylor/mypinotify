import time
import requests
import RPi.GPIO as GPIO
from gpiozero import DistanceSensor
import json

url = 'http://app.mypinotify.me/api/newEvent'
f = open('/boot/mypinotify.config', 'r')
unique_id = str(f.read())[:-1]
print(unique_id)
GPIO.setmode(GPIO.BCM)
GPIO.setup(22, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)
ultrasonic = DistanceSensor(echo=17, trigger=4)

while True:
    try:
        dist = ultrasonic.distance
    except:
        dist = -1
    touch = GPIO.input(22)
    payload = {'pi_id': unique_id, 'ultrasonic': str(dist), 'touch': str(touch)}
    print(payload)
    try:
        r = requests.post(url, json=payload)
    except:
        print("ERROR")
    time.sleep(1)
