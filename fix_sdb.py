import re

with open('src/lib/schoolDb.ts', 'r') as f:
    content = f.read()

# Fix authenticateSchoolUser
old1 = """    const q = query(
      collection(db, 'school_students'),
      where('username_lower', '==', cleanUser.toLowerCase())
    );

  const snap = await getDocs(q);
  if (snap.empty) {
    return { success: false, error: "School student username not found. Ask your teacher to register you!" };
  }"""
new1 = """    let snap = await getDocs(query(
      collection(db, 'school_students'),
      where('username_lower', '==', cleanUser.toLowerCase())
    ));

  if (snap.empty) {
    snap = await getDocs(query(
      collection(db, 'school_students'),
      where('username', '==', cleanUser)
    ));
    if (snap.empty) {
      return { success: false, error: "School student username not found. Ask your teacher to register you!" };
    }
  }"""
content = content.replace(old1, new1)

# Fix addStudentToTeacher
old2 = """  // Verify unique student username globally (or in classroom)
  const q = query(
    collection(db, 'school_students'),
    where('username_lower', '==', cleanUser.toLowerCase())
  );
  const snap = await getDocs(q);
  if (!snap.empty) {
    return { success: false, error: `Username @${cleanUser} is already claimed by another student. Try an initial/suffix variation!` };
  }"""
new2 = """  // Verify unique student username globally (or in classroom)
  let snap = await getDocs(query(
    collection(db, 'school_students'),
    where('username_lower', '==', cleanUser.toLowerCase())
  ));
  if (!snap.empty) {
    return { success: false, error: `Username @${cleanUser} is already claimed by another student. Try an initial/suffix variation!` };
  }
  
  snap = await getDocs(query(
    collection(db, 'school_students'),
    where('username', '==', cleanUser)
  ));
  if (!snap.empty) {
    return { success: false, error: `Username @${cleanUser} is already claimed by another student. Try an initial/suffix variation!` };
  }"""
content = content.replace(old2, new2)

with open('src/lib/schoolDb.ts', 'w') as f:
    f.write(content)

