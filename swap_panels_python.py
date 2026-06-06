import sys

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

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find pareto-panel
pareto_start = content.find('<div className="panel chart-panel pareto-panel">')
pareto_block = get_block(content, pareto_start)

# Find down-panel (Category fault causes)
cat_start = content.rfind('<div ref={panelRef}', 0, content.find('Category fault causes proportion'))
if cat_start == -1:
    cat_start = content.rfind('<div className="panel chart-panel down-panel', 0, content.find('Category fault causes proportion'))
cat_block = get_block(content, cat_start)

if not pareto_block or not cat_block:
    print("Error: Could not find panels.")
    sys.exit(1)

# Swap them
# Replace pareto_block with a placeholder, then cat_block with pareto_block, then placeholder with cat_block
new_content = content.replace(pareto_block, '___PARETO_PLACEHOLDER___')
new_content = new_content.replace(cat_block, pareto_block)
new_content = new_content.replace('___PARETO_PLACEHOLDER___', cat_block)

# Add 60% space to Equipment Condition
# Find condition-panel
cond_start = new_content.find('<div className="panel condition-panel">')
if cond_start != -1:
    new_content = new_content.replace('<div className="panel condition-panel">', '<div className="panel condition-panel" style={{ flex: "0 0 60%" }}>')

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Swapped panels and updated Equipment Condition width!")
