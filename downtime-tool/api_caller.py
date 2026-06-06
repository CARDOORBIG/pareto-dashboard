import requests
import time
from datetime import datetime

def get_daily_data(asset_code, start_date, end_date, config):
    base_url = config.get("base_url", "http://10.190.0.184:8080")
    token = config.get("token", "")
    technology_id = config.get("technologyId", "222234064455901199")
    
    # Use one of the intercepted endpoints
    api_path = "/core/api/epmExt/rpt/utilizationRateForOffline"
    api_url = f"{base_url}{api_path}"
    
    headers = {
        "Authorization": f"Bearer {token}" if not token.startswith("Bearer ") else token,
        "Content-Type": "application/json"
    }
    
    params = {
        "assetsCode": asset_code,
        "sapCode": "",
        "technologyId": technology_id,
        "timeUnit": "Hour",
        "myInterestFlag": "N",
        "startDate": start_date,
        "endDate": end_date,
        "isCancelApiLoad": "true"
    }
    
    max_retries = 3
    backoff_times = [1, 2, 4]
    
    for attempt in range(max_retries):
        try:
            response = requests.get(api_url, headers=headers, params=params, timeout=15)
            
            if response.status_code in (401, 403):
                print(f"Token expired/invalid — update config.json (Status: {response.status_code})")
                return None
                
            response.raise_for_status()
            data = response.json()
            
            # Navigate typical standard API wrapper (e.g., response.data.list)
            records = data.get("data", data)
            if isinstance(records, dict):
                for key, val in records.items():
                    if isinstance(val, list):
                        records = val
                        break
            
            if not isinstance(records, list):
                records = [records]
                
            return records
            
        except requests.exceptions.Timeout:
            print(f"Network timeout for {asset_code}. Retrying in {backoff_times[attempt]}s...")
            time.sleep(backoff_times[attempt])
            
        except requests.exceptions.HTTPError as e:
            print(f"HTTP Error for {asset_code}: {e}. Retrying in {backoff_times[attempt]}s...")
            time.sleep(backoff_times[attempt])
            
        except Exception as e:
            _log_error(f"Error fetching {asset_code}: {str(e)}")
            return []
            
    _log_error(f"Failed to fetch data for {asset_code} after {max_retries} attempts.")
    return []

def _log_error(message):
    with open("error_log.txt", "a", encoding="utf-8") as log_file:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_file.write(f"[{timestamp}] {message}\n")
