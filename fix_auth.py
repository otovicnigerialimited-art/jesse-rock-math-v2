import re

with open('src/components/AuthGate.tsx', 'r') as f:
    content = f.read()

old_query = """      const schoolStudentsCol = collection(db, 'school_students');
      const studentQuery = query(schoolStudentsCol, 
        where('teacher_id', '==', teacherId),
        where('username_lower', '==', cleanName.toLowerCase())
      );
      const studentSnap = await getDocs(studentQuery);

      if (studentSnap.empty) {
        setError(`Error: The handle "@${cleanName}" is not registered inside your teacher's student roster. Please ask your teacher to add you first!`);
        setLoading(false);
        return;
      }

      // Read registered progress from teacher's roster
      const schoolStudentData = studentSnap.docs[0].data();"""

new_query = """      const schoolStudentsCol = collection(db, 'school_students');
      const studentQuery = query(schoolStudentsCol, where('teacher_id', '==', teacherId));
      const studentSnap = await getDocs(studentQuery);

      let foundStudentDoc = null;
      studentSnap.forEach(doc => {
        const data = doc.data();
        if ((data.username_lower === cleanName.toLowerCase()) || 
            (data.username && data.username.toLowerCase() === cleanName.toLowerCase())) {
          foundStudentDoc = doc;
        }
      });

      if (!foundStudentDoc) {
        setError(`Error: The handle "@${cleanName}" is not registered inside your teacher's student roster. Please ask your teacher to add you first!`);
        setLoading(false);
        return;
      }

      // Read registered progress from teacher's roster
      const schoolStudentData = foundStudentDoc.data();"""

content = content.replace(old_query, new_query)

with open('src/components/AuthGate.tsx', 'w') as f:
    f.write(content)

