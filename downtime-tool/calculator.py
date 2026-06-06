def compute(records, asset_code):
    results = []
    
    for record in records:
        # Based on Tech Spec Section 4.3 and 2.1
        # Extract fields robustly in case API returns slightly different names
        run_time = record.get("runTime", 0)
        downtime = record.get("downtimeDuration", 0)
        utilization = record.get("timeUtilization", 0)
        date = record.get("date", "Unknown Date")
        
        # Ensure we are dealing with float values
        try:
            run_time = float(run_time) if run_time is not None else 0.0
            downtime = float(downtime) if downtime is not None else 0.0
            utilization = float(utilization) if utilization is not None else 0.0
        except ValueError:
            run_time, downtime, utilization = 0.0, 0.0, 0.0
            
        # TechSpec Section 2.1: Total Available Time = RunTime / Utilization
        if utilization > 0:
            total_time = run_time / utilization
        else:
            total_time = 0.0
            
        # TechSpec Section 2.2: Downtime % = (Downtime / Total) * 100
        downtime_pct = (downtime / total_time * 100) if total_time > 0 else 0.0
        
        # Idle = Total - Run - Down
        idle_h = total_time - run_time - downtime if total_time > 0 else 0.0
        idle_pct = (idle_h / total_time * 100) if total_time > 0 else 0.0
        
        # Save computed result
        results.append({
            "assetCode": asset_code,
            "date": date,
            "runTime": run_time,
            "downtime": downtime,
            "utilization": utilization,
            "totalTime": total_time,
            "downtimePct": downtime_pct,
            "idlePct": idle_pct
        })
        
    return results
