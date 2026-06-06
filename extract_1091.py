import json

try:
    with open('ai_edits.json', 'r', encoding='utf-8') as f:
        edits = json.load(f)
    
    for e in edits:
        target = e['args'].get('TargetFile', '')
        if 'App.jsx' in target and e['step'] == 1091:
            chunks = e['args'].get('ReplacementChunks', [])
            if isinstance(chunks, str):
                chunks = json.loads(chunks, strict=False)
            
            with open('step1091_revert.txt', 'w', encoding='utf-8') as out:
                for idx, c in enumerate(chunks):
                    out.write(f"--- Chunk {idx} (Lines {c.get('StartLine')} - {c.get('EndLine')}) ---\n")
                    out.write("ORIGINAL WAS (TargetContent):\n")
                    out.write(c.get('TargetContent', ''))
                    out.write("\nREPLACED WITH (ReplacementContent):\n")
                    out.write(c.get('ReplacementContent', ''))
                    out.write("\n\n")
            print("Wrote step1091_revert.txt")
except Exception as err:
    print("Error:", err)
