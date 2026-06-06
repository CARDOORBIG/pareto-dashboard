import json
import re

log_path = r"C:\Users\siwakorn.r\.gemini\antigravity-ide\brain\4f620cd4-79c5-47bb-8730-4d014e183589\.system_generated\logs\transcript.jsonl"
step1091 = None

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if data['step_index'] == 1091:
                for tc in data.get('tool_calls', []):
                    if tc['name'] == 'multi_replace_file_content':
                        step1091 = tc['args']
        except:
            pass

if step1091:
    chunks = step1091.get('ReplacementChunks', [])
    if isinstance(chunks, str):
        # Clean up invalid control characters before json.loads
        clean_chunks = re.sub(r'[\x00-\x1f]', '', chunks)
        try:
            chunks = json.loads(clean_chunks)
        except Exception as e:
            print("Still failed to parse:", e)
            chunks = []
    
    with open('d:/Work/Project EPMS CLONE/pareto-dashboard/src/App.jsx', 'r', encoding='utf-8') as f:
        app_content = f.read()

    # Apply in reverse!
    for i, c in enumerate(reversed(chunks)):
        original = c.get('TargetContent', '')
        replaced = c.get('ReplacementContent', '')
        # In reverse: find 'replaced', replace with 'original'
        if replaced in app_content:
            app_content = app_content.replace(replaced, original)
            print(f"Reverted chunk {len(chunks)-1-i} successfully")
        else:
            print(f"Could not find replaced content for chunk {len(chunks)-1-i}")
            
    with open('d:/Work/Project EPMS CLONE/pareto-dashboard/src/App.jsx', 'w', encoding='utf-8') as f:
        f.write(app_content)
    print("Saved reverted App.jsx")
else:
    print("Step 1091 not found")
