import urllib.request
import json
import ssl

url = 'http://10.190.0.184:8080/core/api/auth/login'
# EPMS login paths might be:
urls = [
    'http://10.190.0.184:8080/core/api/auth/login',
    'http://10.190.0.184:8080/api/auth/login',
    'http://10.190.0.184:8080/auth/login',
    'http://10.190.0.184:8080/login',
    'http://10.190.0.184:8080/core/api/login'
]

payloads = [
    (b'{"username": "C24KM1", "password": "123456"}', 'application/json'),
    (b'{"loginName": "C24KM1", "password": "123456"}', 'application/json'),
    (b'{"empId": "C24KM1", "password": "123456"}', 'application/json'),
    (b'username=C24KM1&password=123456', 'application/x-www-form-urlencoded'),
    (b'loginName=C24KM1&password=123456', 'application/x-www-form-urlencoded'),
]

for u in urls:
    print(f"Testing URL: {u}")
    for body, ctype in payloads:
        req = urllib.request.Request(u, data=body, headers={'Content-Type': ctype}, method='POST')
        try:
            res = urllib.request.urlopen(req, timeout=5)
            print('SUCCESS:', ctype, body)
            print(res.read().decode('utf-8'))
        except urllib.error.HTTPError as e:
            print(f'FAILED ({e.code}):', ctype, body)
        except Exception as e:
            print('ERROR:', e)
