import re

with open('src/components/TeacherDashboard.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { updateDoc, doc, collection, onSnapshot, query, where, getDocs } from 'firebase/firestore';\\nimport { wipeClassroomData } from '../lib/schoolDb';", "")
content = content.replace("import { SchoolStudent, addStudentToTeacher, generateClassCode, deleteClassroom } from '../lib/schoolDb';", "import { SchoolStudent, addStudentToTeacher, generateClassCode, deleteClassroom, wipeClassroomData } from '../lib/schoolDb';")

with open('src/components/TeacherDashboard.tsx', 'w') as f:
    f.write(content)

