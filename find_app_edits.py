import json

try:
    with open('ai_edits.json', 'r', encoding='utf-8') as f:
        edits = json.load(f)
    
    for e in edits:
        target = e['args'].get('TargetFile', '')
        if 'App.css' in target or 'App.jsx' in target:
            print(f"Step {e['step']}: {e['tool']} -> {target}")
            if e['tool'] == 'replace_file_content':
                print("Instruction: " + str(e['args'].get('Instruction', '')))
                print("TargetContent: " + str(e['args'].get('TargetContent', ''))[:100].replace('\n', ' '))
                print("ReplacementContent: " + str(e['args'].get('ReplacementContent', ''))[:100].replace('\n', ' '))
            elif e['tool'] == 'multi_replace_file_content':
                print("Instruction: " + str(e['args'].get('Instruction', '')))
                chunks = e['args'].get('ReplacementChunks', '[]')
                if isinstance(chunks, str):
                    try: chunks = json.loads(chunks)
                    except: chunks = []
                print(f"Chunks: {len(chunks)}")
            print("-" * 40)
except Exception as err:
    print(err)
