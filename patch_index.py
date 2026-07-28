import re

with open('index.html', 'r') as f:
    content = f.read()

faq_entry = """          <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
            <h3 itemprop="name">How does Jesse Rock Math protect students from inappropriate usernames and swear words?</h3>
            <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
              <p itemprop="text">
                Jesse Rock Math enforces a strict anti-profanity and zero-tolerance inappropriate language policy. The system includes a built-in automated filter that instantly intercepts and blocks any attempts to sign in or register using swear words, offensive slurs, or inappropriate usernames. This ensures that the platform, leaderboards, and live multiplayer arenas remain 100% safe, clean, and appropriate for educational classroom environments.
              </p>
            </div>
          </div>
          <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
            <h3 itemprop="name">How does the global leaderboard maintain fair competition?</h3>"""

content = content.replace(
    """          <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
            <h3 itemprop="name">How does the global leaderboard maintain fair competition?</h3>""",
    faq_entry
)

with open('index.html', 'w') as f:
    f.write(content)
