import json
import os
from datetime import datetime
import api_caller
import calculator
import exporter

def load_config():
    with open('config.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def load_assets():
    with open('asset_list.txt', 'r', encoding='utf-8') as f:
        return [line.strip() for line in f if line.strip() and not line.startswith('#')]

def main():
    print("Starting Downtime Data Extraction...")
    
    try:
        config = load_config()
        assets = load_assets()
    except FileNotFoundError as e:
        print(f"Error loading config or asset list: {e}")
        return
    
    start_date = config.get('start_date')
    end_date = config.get('end_date')
    
    all_results = []
    
    for idx, asset in enumerate(assets, 1):
        print(f"[{idx}/{len(assets)}] Processing {asset}...")
        records = api_caller.get_daily_data(asset, start_date, end_date, config)
        
        if records is None:
            # Token expired or critical error
            print("Aborting due to critical API error.")
            break
            
        if not records:
            print(f"No records found for {asset}")
            continue
            
        # compute
        computed = calculator.compute(records, asset)
        all_results.extend(computed)
        
    if all_results:
        today = datetime.now().strftime("%Y%m%d")
        out_file = os.path.join("output", f"downtime_{today}.xlsx")
        exporter.to_excel(all_results, out_file)
        print(f"Done: {out_file}")
    else:
        print("No valid data retrieved. No Excel file generated.")

if __name__ == '__main__':
    main()
