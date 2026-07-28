import re

with open('src/components/AuthGate.tsx', 'r') as f:
    content = f.read()

check_teacher = """    if (cleanName.length < 2) {
      setError("Error: Educator's name must be at least 2 characters long.");
      return;
    }

    if (!isAppropriate(cleanName) || !isAppropriate(cleanEmail)) {
      setError("Error: Name or email contains inappropriate language.");
      return;
    }"""

content = content.replace("""    if (cleanName.length < 2) {
      setError("Error: Educator's name must be at least 2 characters long.");
      return;
    }""", check_teacher)

with open('src/components/AuthGate.tsx', 'w') as f:
    f.write(content)
