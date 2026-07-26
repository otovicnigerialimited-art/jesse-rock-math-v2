import re

with open('index.html', 'r') as f:
    content = f.read()

# Add meta tag after the charset or inside head
meta_tag = '<meta name="google-site-verification" content="cQcVVKEUHMGr4KLdbN7aXIXG1b3-fmZ33slyLXrOTjU" />'

if meta_tag not in content:
    content = content.replace('<head>', f'<head>\n    {meta_tag}')
    with open('index.html', 'w') as f:
        f.write(content)
        print("Meta tag added.")
else:
    print("Meta tag already present.")
