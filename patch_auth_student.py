import re

with open('src/components/AuthGate.tsx', 'r') as f:
    content = f.read()

check_student = """    if (!cleanPass) {
      setError("Error: Student password pin is required.");
      return;
    }

    if (!isAppropriate(cleanUser)) {
      setError("Error: Username contains inappropriate language.");
      return;
    }"""

content = content.replace("""    if (!cleanPass) {
      setError("Error: Student password pin is required.");
      return;
    }""", check_student)

with open('src/components/AuthGate.tsx', 'w') as f:
    f.write(content)
