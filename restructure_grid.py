import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

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

# Find all panels
util_start = content.find('{utilSummary && (')
util_end = content.find(')}', util_start) + 2
util_panel = content[util_start:util_end]

pareto_start = content.find('<div className="panel chart-panel pareto-panel">')
pareto_panel = get_block(content, pareto_start)

condition_start = content.find('{conditionData && (')
condition_end = content.find(')}', condition_start) + 2
condition_panel = content[condition_start:condition_end]

trend_start = content.find('<div className="panel chart-panel trend-panel">')
trend_panel = get_block(content, trend_start)

output_start = content.find('<div className="panel chart-panel output-panel">')
output_panel = get_block(content, output_start)

category_start = content.rfind('<div ref={panelRef}', 0, content.find('Category fault causes proportion'))
if category_start == -1:
    category_start = content.rfind('<div className="panel chart-panel down-panel', 0, content.find('Category fault causes proportion'))
category_panel = get_block(content, category_start)

eqp_details_start = content.rfind('<div className="panel table-panel"', 0, content.find('<h2>Equipment Details</h2>'))
eqp_details_panel = get_block(content, eqp_details_start)

# Other panels we might need to find or omit if they don't exist:
# 'Idle Time Analysis', 'PM Activity Analysis', 'Detailed Records'
# For now, let's just stick the ones we know into the new grid layout.

new_grid = f"""<div className="dashboard-grid">
              
              <div className="grid-row-top">
                {category_panel}
                {condition_panel}
              </div>

              <div className="grid-row-middle">
                {util_panel}
                {trend_panel}
              </div>

              <div className="grid-row-bottom">
                {pareto_panel}
                {output_panel}
              </div>
              
              {eqp_details_panel}

            </div>"""

# Replace the old dashboard-grid with new_grid
grid_start = content.find('<div className="dashboard-grid">')
grid_end = content.find('</div>\n          )}\n\n          {popupOpen')
if grid_end == -1:
    grid_end = content.find('</div>\n          )}\n\n          {/* Bottom row: Table */}', grid_start)
# We need to correctly find the end of dashboard-grid
grid_html = get_block(content, grid_start)

if grid_html:
    new_content = content.replace(grid_html, new_grid)
    with open('src/App.jsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully replaced dashboard-grid.")
else:
    print("Error: Could not extract dashboard-grid.")
