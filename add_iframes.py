import re

itch_embed = """      {/* Itch.io Embed */}
      <div className="flex justify-center mt-12 mb-8 w-full">
         <iframe frameBorder="0" src="https://itch.io/embed/4792376?linkback=true" width="552" height="167" className="rounded-xl shadow-xl max-w-full"><a href="https://jesse-otobo.itch.io/httpsjesse-math-rockstar-appvercelapp">Jesse mathrockstar by Jesse otobo</a></iframe>
      </div>"""

# 1. HomeLanding.tsx
with open('src/components/HomeLanding.tsx', 'r') as f:
    home_content = f.read()

home_content = home_content.replace("{/* Sleek Professional Footer */}", itch_embed + "\n\n      {/* Sleek Professional Footer */}")
with open('src/components/HomeLanding.tsx', 'w') as f:
    f.write(home_content)

# 2. AuthGate.tsx
with open('src/components/AuthGate.tsx', 'r') as f:
    auth_content = f.read()

auth_content = auth_content.replace("    </div>\n  );\n}", itch_embed + "\n    </div>\n  );\n}")
with open('src/components/AuthGate.tsx', 'w') as f:
    f.write(auth_content)

# 3. TeacherDashboard.tsx
with open('src/components/TeacherDashboard.tsx', 'r') as f:
    teacher_content = f.read()

teacher_content = teacher_content.replace("      )}\n    </div>\n  );\n}", "      )}\n" + itch_embed + "\n    </div>\n  );\n}")
with open('src/components/TeacherDashboard.tsx', 'w') as f:
    f.write(teacher_content)

