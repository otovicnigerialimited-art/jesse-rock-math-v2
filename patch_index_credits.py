import re

with open('index.html', 'r') as f:
    content = f.read()

pattern = r"<h2>Family Credits & Global Support Team</h2>.*?</ul>\s*</li>\s*</ul>"
# Actually the previous command already removed a chunk. Let's just restore the file from git or fix it carefully.
