import requests, json

token = 'Bearer 3a5a7f90c2bfe85c660f2a8514e4fc63'
asset = 'EQPTZ2501068'

# Test 1: status/analysis (what we currently use)
params1 = {
    'assetsCode': asset, 'sapCode': '', 'technologyId': '222234064455901199',
    'timeUnit': 'Hour', 'myInterestFlag': 'N',
    'startDate': '2026-05-22', 'endDate': '2026-05-28',
    'isCancelApiLoad': 'true', 'statisticsMethod': 'DAY',
    'eqpStatus': 'RUN', 'firstDeptId': ''
}
r1 = requests.get('http://10.190.0.184:8080/core/api/epm/rpt/eqp-activation/eqp/status/analysis',
                   params=params1, headers={'Authorization': token}, timeout=10)
d1 = r1.json()
lst1 = d1.get('data', {}).get('eqpStatusAnalysisList', [])
print("=== status/analysis (RUN) ===")
print(f"Records: {len(lst1)}")
for item in lst1:
    print(f"  {item.get('key')}: value={item.get('value')}")

# Test 2: utilizationRateForOffline (has proportion field)
params2 = {
    'assetsCode': asset, 'sapCode': '', 'technologyId': '222234064455901199',
    'timeUnit': 'Hour', 'myInterestFlag': 'N',
    'startDate': '2026-05-22', 'endDate': '2026-05-28',
    'isCancelApiLoad': 'true'
}
r2 = requests.get('http://10.190.0.184:8080/core/api/epmExt/rpt/utilizationRateForOffline',
                   params=params2, headers={'Authorization': token}, timeout=10)
d2 = r2.json()
data2 = d2.get('data', {})
print("\n=== utilizationRateForOffline ===")
print(f"timeUseRate: {data2.get('timeUseRate')}")
print(f"runningTimeHour: {data2.get('runningTimeHour')}")
print(f"totalDuration: {data2.get('totalDuration')}")
eqpStatusList = data2.get('eqpStatusList', [])
print(f"eqpStatusList count: {len(eqpStatusList)}")
for item in eqpStatusList:
    status = item.get('eqpStatus')
    prop = item.get('proportion')
    propStr = item.get('proportionStr')
    seq = item.get('seq')
    print(f"  {status}: proportion={prop} ({propStr}) seq={seq}")

# Test 3: Same thing for EQPTZ2501066 to compare
print("\n\n=== COMPARISON: EQPTZ2501066 ===")
params3 = params1.copy()
params3['assetsCode'] = 'EQPTZ2501066'
r3 = requests.get('http://10.190.0.184:8080/core/api/epm/rpt/eqp-activation/eqp/status/analysis',
                   params=params3, headers={'Authorization': token}, timeout=10)
d3 = r3.json()
lst3 = d3.get('data', {}).get('eqpStatusAnalysisList', [])
print(f"status/analysis Records: {len(lst3)}")
for item in lst3[:3]:
    print(f"  {item.get('key')}: value={item.get('value')}")
