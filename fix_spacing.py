import re

files = [
    'src/components/AuthGate.tsx',
    'src/components/HomeLanding.tsx',
    'src/components/TeacherDashboard.tsx'
]

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    content = content.replace('className="flex justify-center mt-12 mb-8 w-full"', 'className="flex justify-center mt-6 mb-2 w-full"')
    
    with open(file, 'w') as f:
        f.write(content)

