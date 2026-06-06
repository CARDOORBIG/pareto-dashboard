import subprocess
import sys

result = subprocess.run(['git', 'show', 'HEAD:src/App.jsx'], capture_output=True, text=True, encoding='utf-8')
orig_content = result.stdout

def get_block(text, start_idx):
    open_count = 0
    i = start_idx
    while i < len(text):
        if text[i:i+4] == '<div':
            open_count += 1
        elif text[i:i+5] == '</div':
            open_count -= 1
            if open_count == 0:
                return text[start_idx:i+6]
        i += 1
    return None

condition_start_orig = orig_content.find('{conditionData && (')
condition_panel_div_start = orig_content.find('<div className="panel condition-panel">', condition_start_orig)
condition_panel_div = get_block(orig_content, condition_panel_div_start)
full_condition_panel = '{conditionData && (\n                  ' + condition_panel_div + '\n                )}'

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    curr_content = f.read()

broken_start = curr_content.find('{conditionData && (\n                  <div className="panel condition-panel">')
broken_end = curr_content.find('</div>\n\n              <div className="grid-row-middle">')

if broken_start != -1 and broken_end != -1:
    new_content = curr_content[:broken_start] + full_condition_panel + '\n              ' + curr_content[broken_end:]
    with open('src/App.jsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('Fixed condition_panel!')
else:
    print('Could not find broken section bounds in App.jsx')
