import re

with open('src/components/HomeLanding.tsx', 'r') as f:
    content = f.read()

pattern = r'      <div className="flex justify-center pt-8 pb-4">.*?</div>'
# Wait, this regex would consume too much. Let's just use string replacement.

target = """      <div className="flex justify-center pt-8 pb-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="relative inline-block"
        >
          <img 
            src="/jesse_rock_logo.jpg" 
            alt="Jesse Rock Math Official Logo" 
            className="w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-2xl rounded-3xl border border-deep-navy/10"
            referrerPolicy="no-referrer"
          />
        </motion.div>
      </div>"""

content = content.replace(target, "")

with open('src/components/HomeLanding.tsx', 'w') as f:
    f.write(content)
