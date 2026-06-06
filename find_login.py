import json

log_path = r'C:\Users\siwakorn.r\.gemini\antigravity-ide\brain\4f620cd4-79c5-47bb-8730-4d014e183589\.system_generated\logs\transcript.jsonl'

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line.strip())
            step = data.get('step_index', -1)
            if step == 361:
                content = data.get('content', '')
                # Write content to file
                with open(r'd:\Work\Project EPMS CLONE\old_app_361.txt', 'w', encoding='utf-8') as out:
                    out.write(content)
                print("Wrote step 361, len={}".format(len(content)))
                break
        except:
            pass
