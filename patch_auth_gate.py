import re

with open('src/components/AuthGate.tsx', 'r') as f:
    content = f.read()

# Add import
import_stmt = "import { isAppropriate } from '../lib/filterUtils';\n"
content = re.sub(r'(import [^\n]+;\n)', r'\1' + import_stmt, content, count=1)

# In handleGuestSubmit
check_guest = """    if (!isAppropriate(cleanUsername)) {
      setError("Username contains inappropriate language. Please choose a safe username.");
      setIsLoading(false);
      return;
    }
"""
content = re.sub(
    r'(if \(cleanUsername\.length < 3\) \{[\s\S]*?return;\n    \})',
    r'\1\n' + check_guest,
    content
)

with open('src/components/AuthGate.tsx', 'w') as f:
    f.write(content)
