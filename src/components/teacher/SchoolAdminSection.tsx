import React, { useState, useEffect } from 'react';
import { Building, Users, UserPlus, Shield, Archive, BarChart3, Settings, Check, X, Plus, Trash2, Key } from 'lucide-react';
import { School, ClassRoom, createSchool, createClassRoom, fetchClassesBySchool } from '../../lib/advancedSchoolDb';
import { Teacher, SchoolStudent, fetchStudentsByTeacher } from '../../lib/schoolDb';

interface SchoolAdminSectionProps {
  currentTeacher: { id: string; teacher_name: string; email: string };
  students: SchoolStudent[];
}

export default function SchoolAdminSection({ currentTeacher, students }: SchoolAdminSectionProps) {
  const [school, setSchool] = useState<School | null>({
    id: `sch_${currentTeacher.id || 'default'}`,
    name: `${currentTeacher.teacher_name}'s School Organization`,
    code: `SCH-${(currentTeacher.id || '100').slice(0, 4).toUpperCase()}`,
    adminEmail: currentTeacher.email,
    created_at: Date.now()
  });

  const [classes, setClasses] = useState<ClassRoom[]>([
    { id: 'c1', school_id: `sch_${currentTeacher.id}`, class_name: 'Main Classroom', year_group: 'Primary / KS2', teacher_ids: [currentTeacher.id], student_count: students.length, created_at: Date.now() }
  ]);

  const [teachers, setTeachers] = useState<Teacher[]>([
    { id: currentTeacher.id, teacher_name: currentTeacher.teacher_name, email: currentTeacher.email }
  ]);

  const [showAddClass, setShowAddClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newYearGroup, setNewYearGroup] = useState('Year 5');

  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');

  const [archivedStudents, setArchivedStudents] = useState<string[]>([]);

  const handleCreateClass = async () => {
    if (!newClassName.trim()) return;
    const newC = await createClassRoom(school?.id || 'sch_1', newClassName.trim(), newYearGroup, [currentTeacher.id]);
    setClasses(prev => [...prev, newC]);
    setNewClassName('');
    setShowAddClass(false);
  };

  const handleCreateTeacher = () => {
    if (!newTeacherName.trim() || !newTeacherEmail.trim()) return;
    const newT: Teacher = { id: `t_${Date.now()}`, teacher_name: newTeacherName.trim(), email: newTeacherEmail.trim() };
    setTeachers(prev => [...prev, newT]);
    setNewTeacherName('');
    setNewTeacherEmail('');
    setShowAddTeacher(false);
  };

  const toggleArchiveStudent = (studentId: string) => {
    if (archivedStudents.includes(studentId)) {
      setArchivedStudents(prev => prev.filter(id => id !== studentId));
    } else {
      setArchivedStudents(prev => [...prev, studentId]);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-violet-500/20 text-violet-400 border border-violet-500/30 rounded-2xl">
            <Building size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 rounded-full text-[10px] font-bold uppercase tracking-wider">SCHOOL ADMIN CONSOLE</span>
              <span className="text-xs font-mono text-slate-400">ID: {school?.code}</span>
            </div>
            <h2 className="text-2xl font-display font-black text-white">{school?.name}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="p-2 bg-slate-800 border border-slate-700 rounded-xl">
            <span className="text-slate-400 block text-[10px]">Total Teachers</span>
            <span className="font-bold text-white">{teachers.length} Educators</span>
          </div>
          <div className="p-2 bg-slate-800 border border-slate-700 rounded-xl">
            <span className="text-slate-400 block text-[10px]">Total Classes</span>
            <span className="font-bold text-white">{classes.length} Active</span>
          </div>
        </div>
      </div>

      {/* School Hierarchy View */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Classes List */}
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Users size={18} className="text-violet-400" /> Classrooms & Year Groups
            </h3>
            <button
              onClick={() => setShowAddClass(true)}
              className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
            >
              <Plus size={14} /> Add Class
            </button>
          </div>

          <div className="space-y-2">
            {classes.map(c => (
              <div key={c.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">{c.class_name} ({c.year_group})</h4>
                  <p className="text-xs text-slate-400">{c.student_count} Enrolled Students</p>
                </div>
                <span className="text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg font-semibold">Active</span>
              </div>
            ))}
          </div>

          {showAddClass && (
            <div className="p-3 bg-slate-900 border border-violet-500/40 rounded-xl space-y-2 text-xs">
              <input
                placeholder="Class Name (e.g. Year 5B)..."
                value={newClassName}
                onChange={e => setNewClassName(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg"
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowAddClass(false)} className="px-3 py-1 text-slate-400">Cancel</button>
                <button onClick={handleCreateClass} className="px-3 py-1 bg-violet-600 text-white font-bold rounded-lg">Create</button>
              </div>
            </div>
          )}
        </div>

        {/* Teachers List */}
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Shield size={18} className="text-amber-400" /> Authorized Faculty
            </h3>
            <button
              onClick={() => setShowAddTeacher(true)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
            >
              <UserPlus size={14} /> Add Teacher
            </button>
          </div>

          <div className="space-y-2">
            {teachers.map(t => (
              <div key={t.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">{t.teacher_name}</h4>
                  <p className="text-xs text-slate-400">{t.email}</p>
                </div>
                <span className="text-xs text-slate-400">Full Permission</span>
              </div>
            ))}
          </div>

          {showAddTeacher && (
            <div className="p-3 bg-slate-900 border border-amber-500/40 rounded-xl space-y-2 text-xs">
              <input
                placeholder="Teacher Name..."
                value={newTeacherName}
                onChange={e => setNewTeacherName(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg"
              />
              <input
                placeholder="Email Address..."
                value={newTeacherEmail}
                onChange={e => setNewTeacherEmail(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg"
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowAddTeacher(false)} className="px-3 py-1 text-slate-400">Cancel</button>
                <button onClick={handleCreateTeacher} className="px-3 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg">Add Faculty</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Student Management & Archiving */}
      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
        <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
          <Archive size={18} className="text-rose-400" /> Student Account Management & Archiving
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="p-2">Student Name</th>
                <th className="p-2">Username</th>
                <th className="p-2">Status</th>
                <th className="p-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(st => {
                const isArchived = archivedStudents.includes(st.id);
                return (
                  <tr key={st.id} className="border-b border-slate-800/50 hover:bg-slate-900/50">
                    <td className="p-2 font-bold text-white">{st.real_first_name}</td>
                    <td className="p-2 font-mono text-slate-300">@{st.username}</td>
                    <td className="p-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isArchived ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        {isArchived ? 'ARCHIVED' : 'ACTIVE'}
                      </span>
                    </td>
                    <td className="p-2 text-right">
                      <button
                        onClick={() => toggleArchiveStudent(st.id)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded text-[10px] cursor-pointer"
                      >
                        {isArchived ? 'Unarchive' : 'Archive Account'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
