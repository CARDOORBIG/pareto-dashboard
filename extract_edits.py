import json
import os

log_path = r"C:\Users\siwakorn.r\.gemini\antigravity-ide\brain\4f620cd4-79c5-47bb-8730-4d014e183589\.system_generated\logs\transcript.jsonl"
edits = []

try:
    with open(log_path, 'r', encoding='utf-8') as f:
        for line in f:
            try:
                data = json.loads(line)
                if 'tool_calls' in data:
                    for tc in data['tool_calls']:
                        if tc['name'] in ['replace_file_content', 'multi_replace_file_content', 'write_to_file']:
                            edits.append({
                                'step': data['step_index'],
                                'tool': tc['name'],
                                'args': tc['args']
                            })
            except:
                pass

    with open('d:/Work/Project EPMS CLONE/ai_edits.json', 'w', encoding='utf-8') as out:
        json.dump(edits, out, indent=2)
    print(f"Found {len(edits)} edits. Wrote to ai_edits.json")
except Exception as e:
    print(f"Error: {e}")
