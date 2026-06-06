import re
import json

with open('d:/Work/Project EPMS CLONE/DEMO_HTML', 'r', encoding='utf-8') as f:
    text = f.read()

urls = re.findall(r'/core/api[^\'\"\s\?]*', text)
for u in set(urls):
    print(u)
