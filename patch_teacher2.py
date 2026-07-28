import re

with open('src/components/TeacherDashboard.tsx', 'r') as f:
    content = f.read()

target = """    if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      setFormError("Error: Username can only contain letters, numbers, and underscores.");
      return;
    }"""

check_student = """    if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      setFormError("Error: Username can only contain letters, numbers, and underscores.");
      return;
    }

    if (!isAppropriate(cleanUsername) || !isAppropriate(cleanFirstName)) {
      setFormError("Name or username contains inappropriate language. Please use school-appropriate names.");
      return;
    }"""

content = content.replace(target, check_student)

with open('src/components/TeacherDashboard.tsx', 'w') as f:
    f.write(content)
