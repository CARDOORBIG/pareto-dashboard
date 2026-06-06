import json

log_path = r"C:\Users\siwakorn.r\.gemini\antigravity-ide\brain\4f620cd4-79c5-47bb-8730-4d014e183589\.system_generated\logs\transcript.jsonl"
step1008 = None
step1091 = None

try:
    with open(log_path, 'r', encoding='utf-8') as f:
        for line in f:
            data = json.loads(line)
            if data['step_index'] == 1008:
                for tc in data.get('tool_calls', []):
                    if tc['name'] == 'write_to_file':
                        step1008 = tc['args']
            elif data['step_index'] == 1091:
                for tc in data.get('tool_calls', []):
                    if tc['name'] == 'multi_replace_file_content':
                        step1091 = tc['args']

    if step1008:
        with open('d:/Work/Project EPMS CLONE/app_step1008.jsx', 'w', encoding='utf-8') as f:
            f.write(step1008.get('CodeContent', ''))
        print("Wrote app_step1008.jsx")
    
    if step1091:
        chunks = step1091.get('ReplacementChunks', [])
        if isinstance(chunks, str): chunks = json.loads(chunks)
        with open('d:/Work/Project EPMS CLONE/step1091_revert.txt', 'w', encoding='utf-8') as f:
            for i, c in enumerate(chunks):
                f.write(f"--- Chunk {i} ---\nOriginal:\n{c.get('TargetContent')}\nReplaced:\n{c.get('ReplacementContent')}\n\n")
        print("Wrote step1091_revert.txt")

except Exception as e:
    print("Error:", e)
