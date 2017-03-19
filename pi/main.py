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
    print(ultrasonic.distance)
    print("test")
    dist = ultrasonic.distance
    touch = GPIO.input(22)
    payload = {'pi_id': unique_id, 'ultrasonic': str(dist), 'touch': str(touch)}
    print(payload)
    r = requests.post(url, json=payload)
    print GPIO.input(22)
    print(r.json)
    print(r.status_code)
    time.sleep(2)
