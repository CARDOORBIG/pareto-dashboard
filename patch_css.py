import sys

with open('src/App.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Add min-height to .chart-wrapper if not present
if 'min-height: 300px' not in css:
    css = css.replace('.chart-wrapper{', '.chart-wrapper{min-height:300px;')

# Add .sidebar-closed if not present
if '.sidebar-closed' not in css:
    sidebar_closed_css = """
.left-sidebar.sidebar-closed {
  width: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
  opacity: 0 !important;
  overflow: hidden !important;
}
"""
    css += sidebar_closed_css

with open('src/App.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("App.css patched successfully!")
