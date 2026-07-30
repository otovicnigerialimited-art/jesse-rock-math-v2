with open('src/components/AuthGate.tsx', 'r') as f:
    content = f.read()

start_idx = content.find("  if (showLanding) {")
end_idx = content.find("  return (\n    <div className=\"min-h-screen flex flex-col items-center justify-between", start_idx + 1)

print(content[start_idx:end_idx])
