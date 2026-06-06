import os

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Pareto panel is from line 1780 to 1804 (index 1779 to 1804 exclusive)
# Wait, let's search for the exact lines.
pareto_start = -1
pareto_end = -1
for i, line in enumerate(lines):
    if '<div className="panel chart-panel pareto-panel">' in line:
        pareto_start = i
        # find the matching closing div. It's indentation level is the same.
        # But we know it ends right before `        {conditionData && (`
        for j in range(i+1, len(lines)):
            if '{conditionData && (' in lines[j]:
                pareto_end = j - 1 # the empty line before it or the </div>
                # let's step back to the </div>
                while '</div>' not in lines[pareto_end]:
                    pareto_end -= 1
                pareto_end += 1 # inclusive of </div>
                break
        break

print(f"Pareto: {pareto_start} to {pareto_end}")

cat_start = -1
cat_end = -1
for i, line in enumerate(lines):
    if '<div ref={panelRef} className={`panel chart-panel down-panel' in line:
        cat_start = i
        # find the end. It ends before `              {`
        # actually, it ends before `                {` and `                  activeCondition === 'PM'`
        for j in range(i+1, len(lines)):
            if "activeCondition === 'PM'" in lines[j]:
                # The div ends a few lines above.
                cat_end = j - 1
                while '</div>' not in lines[cat_end] and '</>' not in lines[cat_end]:
                    cat_end -= 1
                cat_end -= 1 # It's the </div> before </>
                while '</div>' not in lines[cat_end]:
                    cat_end -= 1
                cat_end += 1 # inclusive of </div>
                break
        break

print(f"Category: {cat_start} to {cat_end}")

if pareto_start != -1 and cat_start != -1:
    pareto_lines = lines[pareto_start:pareto_end]
    cat_lines = lines[cat_start:cat_end]

    # Because cat_start > pareto_end, we should delete from bottom to top to avoid shifting indices.
    del lines[cat_start:cat_end]
    # Insert Pareto where Category was
    lines = lines[:cat_start] + pareto_lines + lines[cat_start:]
    
    # Now replace Pareto with Category. Since Pareto was before Category, its index hasn't shifted!
    del lines[pareto_start:pareto_end]
    lines = lines[:pareto_start] + cat_lines + lines[pareto_start:]

    with open('src/App.jsx', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Swap successful by line array manipulation.")
else:
    print("Could not find blocks.")
