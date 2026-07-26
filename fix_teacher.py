import re

with open('src/components/TeacherDashboard.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '<div className="space-y-6">',
    '<div className="flex flex-col flex-1 justify-between w-full h-full">\n      <div className="space-y-6 flex-1">'
)

content = content.replace(
    '      {/* Delete Confirmation Modal */}',
    '      </div>\n      {/* Delete Confirmation Modal */}'
)

with open('src/components/TeacherDashboard.tsx', 'w') as f:
    f.write(content)

