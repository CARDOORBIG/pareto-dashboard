import json
import codecs

log_path = r'C:\Users\siwakorn.r\.gemini\antigravity-ide\brain\4f620cd4-79c5-47bb-8730-4d014e183589\.system_generated\logs\transcript.jsonl'
best_content = ''

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        if 'ipcMain.handle' in line:
            try:
                data = json.loads(line.strip())
                content = data.get('content', '')
                if 'ipcMain.handle' in content:
                    print(f"Found length: {len(content)} type: {data.get('type')}")
                    best_content = content
            except Exception:
                pass

if best_content:
    out_path = r'C:\Users\siwakorn.r\.gemini\antigravity-ide\brain\4f620cd4-79c5-47bb-8730-4d014e183589\scratch_ipc.txt'
    with codecs.open(out_path, 'w', encoding='utf-8') as out_f:
        out_f.write(best_content)
    print("Written to scratch_ipc.txt")
