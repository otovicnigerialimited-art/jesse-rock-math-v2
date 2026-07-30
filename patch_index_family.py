import re

with open('index.html', 'r') as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    # Skip lines 294 to 309
    if 293 <= i <= 308:
        continue
    # Skip lines 659 to 674
    if 659 <= i <= 674:
        continue
    new_lines.append(line)

with open('index.html', 'w') as f:
    f.writelines(new_lines)
