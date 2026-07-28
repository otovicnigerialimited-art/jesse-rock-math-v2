import re

with open('src/components/TermsPage.tsx', 'r') as f:
    content = f.read()

replacement = """                    <li className="flex items-start gap-2 text-slate-800 font-bold">
                      <span className="mt-1 w-2 h-2 rounded-full bg-deep-navy shrink-0"></span>
                      <p className="font-semibold leading-relaxed">
                        <strong>Nickname Integrity & Automated Filters:</strong> The platform explicitly blocks users from signing in or registering with usernames containing swear words, slurs, or inappropriate language. The system incorporates a robust real-time profanity filter to actively intercept, block, and scrub any offensive submissions. Failure to abide by clean naming conventions will result in account creation denial or immediate removal from global real-time leaderboards.
                      </p>
"""

content = re.sub(
    r'<li className="flex items-start gap-2 text-slate-800 font-bold">\s*<span className="mt-1 w-2 h-2 rounded-full bg-deep-navy shrink-0"></span>\s*<p className="font-semibold leading-relaxed">\s*<strong>Nickname Integrity:</strong> The system automatically flags and scrubs profane, personally identifiable, or offensive language from global real-time leaderboards.\s*</p>',
    replacement,
    content
)

with open('src/components/TermsPage.tsx', 'w') as f:
    f.write(content)
