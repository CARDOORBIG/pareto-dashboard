import re
import collections
import json

try:
    with open('D:/Work/Project EPMS CLONE/DEMO_HTML', 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Let's find any JSON-like structures that might contain options or lists
    # We can search for the Station / Line things by looking for specific keywords in Chinese.
    # line: 线体, station: 站点, department: 部门, workshop: 车间
    
    keywords = ["线体", "站点", "部门", "车间", "lineId", "spotId", "deptId"]
    results = {}
    for kw in keywords:
        matches = re.findall(r'.{0,50}' + kw + r'.{0,50}', html, re.IGNORECASE)
        results[kw] = matches[:10]  # Just take first 10 matches
        
    with open('scratch_analysis.json', 'w', encoding='utf-8') as out:
        json.dump(results, out, ensure_ascii=False, indent=2)

except Exception as e:
    with open('scratch_analysis.json', 'w', encoding='utf-8') as out:
        out.write(str(e))
