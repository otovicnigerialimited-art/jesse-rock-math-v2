import re

with open('src/lib/schoolDb.ts', 'r') as f:
    content = f.read()

old_auth = """    const q = query(
      collection(db, 'school_students'),
      where('username_lower', '==', cleanUser.toLowerCase())
    );
  const snap = await getDocs(q);

  if (snap.empty) {
    return { success: false, error: "School student username not found. Ask your teacher to register you!" };
  }"""

new_auth = """    let snap = await getDocs(query(
      collection(db, 'school_students'),
      where('username_lower', '==', cleanUser.toLowerCase())
    ));

  if (snap.empty) {
    // Fallback for older documents that don't have username_lower
    snap = await getDocs(query(
      collection(db, 'school_students'),
      where('username', '==', cleanUser)
    ));
    if (snap.empty) {
      return { success: false, error: "School student username not found. Ask your teacher to register you!" };
    }
  }"""

content = content.replace(old_auth, new_auth)

with open('src/lib/schoolDb.ts', 'w') as f:
    f.write(content)

