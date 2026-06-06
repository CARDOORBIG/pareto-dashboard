import json

try:
    with open('ai_edits.json', 'r', encoding='utf-8') as f:
        edits = json.load(f)
    
    for e in edits:
        target = e['args'].get('TargetFile', '')
        if 'App.jsx' in target and e['step'] == 1008:
            print("Step 1008 write_to_file length:", len(e['args']['CodeContent']))
            with open('app_step1008.jsx', 'w', encoding='utf-8') as out:
                out.write(e['args']['CodeContent'])
        elif 'App.jsx' in target and e['step'] == 1091:
            print("Step 1091 chunks:")
            chunks = e['args'].get('ReplacementChunks', '[]')
            if isinstance(chunks, str): chunks = json.loads(chunks)
            for c in chunks:
                print("Line", c.get('StartLine'), "to", c.get('EndLine'))
except Exception as err:
    print(err)
