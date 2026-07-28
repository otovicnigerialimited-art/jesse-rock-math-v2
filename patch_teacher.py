import re

with open('src/components/TeacherDashboard.tsx', 'r') as f:
    content = f.read()

import_stmt = "import { isAppropriate } from '../lib/filterUtils';\n"
content = re.sub(r'(import [^\n]+;\n)', r'\1' + import_stmt, content, count=1)

check_student = """    if (!isAppropriate(cleanUsername) || !isAppropriate(cleanFirstName)) {
      setFormError("Name or username contains inappropriate language. Please use school-appropriate names.");
      setIsAddingStudent(false);
      return;
    }
"""

content = re.sub(
    r'(if \(!/^[a-zA-Z0-9_]+\$/.test\(cleanUsername\)\) \{[\s\S]*?return;\n    \})',
    r'\1\n' + check_student,
    content
)

with open('src/components/TeacherDashboard.tsx', 'w') as f:
    f.write(content)
