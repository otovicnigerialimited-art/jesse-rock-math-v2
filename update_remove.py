import re

with open('src/components/TeacherDashboard.tsx', 'r') as f:
    content = f.read()

# Add state
content = content.replace("const [deleteError, setDeleteError] = useState('');", "const [deleteError, setDeleteError] = useState('');\n  const [studentToRemove, setStudentToRemove] = useState<string | null>(null);")

# Update handleRemoveStudentFromClass
old_handle = """  // Remove a student from class
  const handleRemoveStudentFromClass = async (sessionId: string) => {
    if (!window.confirm("Are you sure you want to remove this student from the active class? They will be logged out instantly.")) {
      return;
    }
    try {
      const docRef = doc(db, 'class_sessions', sessionId);
      await updateDoc(docRef, {
        status: 'removed',
        removed_at: Date.now()
      });
    } catch (err) {
      console.error("Failed to remove student from class:", err);
    }
  };"""
new_handle = """  // Remove a student from class
  const handleRemoveStudentFromClass = async (sessionId: string) => {
    try {
      const docRef = doc(db, 'class_sessions', sessionId);
      await updateDoc(docRef, {
        status: 'removed',
        removed_at: Date.now()
      });
      setStudentToRemove(null);
    } catch (err) {
      console.error("Failed to remove student from class:", err);
    }
  };"""
content = content.replace(old_handle, new_handle)

# Update the remove button and add modal
old_btn = """                              <button
                                onClick={() => handleRemoveStudentFromClass(session.id)}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg uppercase tracking-wider transition-all cursor-pointer shadow flex items-center gap-1 mx-auto"
                              >
                                <X size={11} /> Remove
                              </button>"""
new_btn = """                              <button
                                onClick={() => setStudentToRemove(session.id)}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg uppercase tracking-wider transition-all cursor-pointer shadow flex items-center gap-1 mx-auto"
                              >
                                <X size={11} /> Remove
                              </button>"""
content = content.replace(old_btn, new_btn)

remove_modal = """
      {/* Remove Student Modal */}
      {studentToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center border-4 border-rose-500">
             <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-3 text-rose-500">
               <X size={24} />
             </div>
             <h3 className="font-black text-deep-navy mb-2">Remove Student?</h3>
             <p className="text-xs text-slate-500 mb-6 font-medium">They will be logged out instantly.</p>
             <div className="flex gap-2">
                <button onClick={() => setStudentToRemove(null)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer">CANCEL</button>
                <button onClick={() => handleRemoveStudentFromClass(studentToRemove)} className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer">REMOVE</button>
             </div>
          </div>
        </div>
      )}
"""
content = content.replace("      {/* Delete Confirmation Modal */}", remove_modal + "\n      {/* Delete Confirmation Modal */}")

with open('src/components/TeacherDashboard.tsx', 'w') as f:
    f.write(content)

