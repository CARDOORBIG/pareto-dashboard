import os

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

cat_start = 1779  # line 1780
cat_end = 1892    # line 1892

cond_start = 1893 # line 1894
cond_end = 1907   # line 1907

# Actually let's search them dynamically to be completely safe
cat_s = -1
cat_e = -1
cond_s = -1
cond_e = -1

for i, line in enumerate(lines):
    if '<div ref={panelRef} className={`panel chart-panel down-panel' in line:
        cat_s = i
        break

for i in range(cat_s, len(lines)):
    if '{conditionData && (' in lines[i]:
        cat_e = i - 1
        cond_s = i
        break

for i in range(cond_s, len(lines)):
    if ')}' in lines[i] and '</div>' in lines[i+1] and 'Middle row' in lines[i+3]:
        cond_e = i + 1
        break

if cat_s != -1 and cat_e != -1 and cond_s != -1 and cond_e != -1:
    print(f"Cat: {cat_s}-{cat_e}, Cond: {cond_s}-{cond_e}")
    cat_lines = lines[cat_s:cat_e+1]
    cond_lines = lines[cond_s:cond_e+1]
    
    # swap
    new_lines = lines[:cat_s] + cond_lines + ['\n'] + cat_lines + lines[cond_e+1:]
    
    with open('src/App.jsx', 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print("Order swapped safely!")
else:
    print(f"Failed to find indices. {cat_s} {cat_e} {cond_s} {cond_e}")

