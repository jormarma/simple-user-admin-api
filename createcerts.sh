#!/bin/bash
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./userapi.key -out userapi.crt