import re

with open('src/components/TeacherDashboard.tsx', 'r') as f:
    content = f.read()

# 1. Add wipeClassroomData import
content = content.replace("import { updateDoc, doc, collection, onSnapshot, query, where, getDocs } from 'firebase/firestore';", "import { updateDoc, doc, collection, onSnapshot, query, where, getDocs } from 'firebase/firestore';\nimport { wipeClassroomData } from '../lib/schoolDb';")

# 2. Remove the top Disable Classroom button
remove_btn = """            <button
              onClick={() => {
                if (!resolvedId) {
                  alert("Error: Classroom ID not found.");
                  return;
                }
                setShowDeleteConfirm(true);
              }}
              disabled={isDeleting}
              className="px-4 py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-500 text-xs font-bold uppercase transition-all tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <X size={13} />
              {isDeleting ? "Deleting..." : "Disable Classroom"}
            </button>"""
content = content.replace(remove_btn, "")

# 3. Change the Class Code button to open the modal
replace_btn = """                <button
                  onClick={handleDeactivateCode}
                  className="w-full py-2.5 rounded-xl bg-rose-900/10 hover:bg-rose-500 hover:text-white border border-rose-500/30 hover:border-rose-600 text-rose-600 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                >
                  Disable Classroom
                </button>"""
new_btn = """                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full py-2.5 rounded-xl bg-rose-900/10 hover:bg-rose-500 hover:text-white border border-rose-500/30 hover:border-rose-600 text-rose-600 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                >
                  Disable Classroom
                </button>"""
content = content.replace(replace_btn, new_btn)

# 4. Modify the delete confirm modal to call wipeClassroomData
replace_delete = """                        await deleteClassroom(resolvedId);
                        setShowDeleteConfirm(false);
                        onSignOut();"""
new_delete = """                        await wipeClassroomData(resolvedId);
                        setTeacherCode('');
                        setClassName('');
                        setShowDeleteConfirm(false);"""
content = content.replace(replace_delete, new_delete)

with open('src/components/TeacherDashboard.tsx', 'w') as f:
    f.write(content)

