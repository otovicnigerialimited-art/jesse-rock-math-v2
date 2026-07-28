import React, { useState, useEffect } from 'react';
import { isAppropriate } from '../lib/filterUtils';
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  doc,
  updateDoc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SchoolStudent, addStudentToTeacher, generateClassCode, deleteClassroom, wipeClassroomData } from '../lib/schoolDb';
import { LESSONS } from '../data/lessons';
import { 
  Users, 
  Search, 
  Lock, 
  LogOut, 
  RefreshCw, 
  Award, 
  GraduationCap, 
  Sparkles,
  UserPlus,
  Coins,
  CheckCircle,
  AlertCircle,
  Globe,
  Activity,
  Check,
  X,
  BookOpen,
  FileText,
  Pencil
} from 'lucide-react';
import { motion } from 'motion/react';

interface TeacherDashboardProps {
  teacher?: {
    id: string;
    teacher_name: string;
    email: string;
  };
  teacherId?: string;
  teacherName?: string;
  teacherEmail?: string;
  onSignOut: () => void;
}

export default function TeacherDashboard({ 
  teacher, 
  teacherId, 
  teacherName, 
  teacherEmail, 
  onSignOut 
}: TeacherDashboardProps) {
  // Resolve props cleanly supporting both nested teacher object and flat props
  const resolvedId = teacher?.id || teacherId || '';
  const resolvedName = teacher?.teacher_name || teacherName || 'Rockstar Educator';
  const resolvedEmail = teacher?.email || teacherEmail || '';

  const [activeDashboardTab, setActiveDashboardTab] = useState<'roster' | 'class_login'>('roster');

  const [students, setStudents] = useState<SchoolStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State for Adding Student
  const [firstName, setFirstName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // local UX feedbacks
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Class Code states
  const [teacherCode, setTeacherCode] = useState<string>('');
  const [className, setClassName] = useState<string>('');
  const [newClassNameInput, setNewClassNameInput] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeSuccess, setCodeSuccess] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [studentToRemove, setStudentToRemove] = useState<string | null>(null);

  // Active Class Students state
  const [activeSessions, setActiveSessions] = useState<any[]>([]);

  // 1. Live Firestore listener on students registered under this teacher
  useEffect(() => {
    if (!resolvedId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, 'school_students'),
      where('teacher_id', '==', resolvedId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docsList: SchoolStudent[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        docsList.push({
          id: docSnap.id,
          ...data
        } as SchoolStudent);
      });
      setStudents(docsList);
      setLoading(false);
    }, (err) => {
      console.error("Firestore classroom roster sub failed:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [resolvedId]);

  // 2. Live Firestore listener on teacher's active class code
  useEffect(() => {
    if (!resolvedId) return;
    const unsubscribe = onSnapshot(doc(db, 'teachers', resolvedId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setTeacherCode(data.class_code || '');
        setClassName(data.class_name || '');
      }
    });
    return () => unsubscribe();
  }, [resolvedId]);

  // 3. Live Firestore listener on Active Class Sessions (students currently logged in)
  useEffect(() => {
    if (!resolvedId || !teacherCode) {
      setActiveSessions([]);
      return;
    }
    const q = query(
      collection(db, 'class_sessions'),
      where('class_code', '==', teacherCode),
      where('status', '==', 'active')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Sort by last_active descending
      list.sort((a, b) => (b.last_active || 0) - (a.last_active || 0));
      setActiveSessions(list);
    }, (err) => {
      console.error("Failed to sync class sessions:", err);
    });
    return () => unsubscribe();
  }, [resolvedId, teacherCode]);

  // Homework & Lesson Chalkboard Publisher State
  const [pubSubject, setPubSubject] = useState('');
  const [pubWord, setPubWord] = useState('');
  const [pubHomework, setPubHomework] = useState('');
  const [pubSuccess, setPubSuccess] = useState<string | null>(null);
  const [pubError, setPubError] = useState<string | null>(null);
  const [pubLoading, setPubLoading] = useState(false);

  const handlePublishChalkboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setPubSuccess(null);
    setPubError(null);

    if (!teacherCode) {
      setPubError("You must activate a Class Code first before you can publish assignments!");
      return;
    }

    if (!pubSubject.trim() || !pubWord.trim() || !pubHomework.trim()) {
      setPubError("Please fill out all fields (Subject, Word to Learn, and Homework Description)!");
      return;
    }

    setPubLoading(true);

    try {
      // Save active lesson chalkboard to Firebase
      const postRef = doc(db, 'class_posts', teacherCode);
      await setDoc(postRef, {
        class_code: teacherCode,
        teacher_id: resolvedId,
        teacher_name: resolvedName,
        subject: pubSubject.trim(),
        word_to_learn: pubWord.trim(),
        homework: pubHomework.trim(),
        timestamp: Date.now()
      });

      // Also append to chronological class announcements
      const announcementsCol = collection(db, 'class_announcements');
      await addDoc(announcementsCol, {
        class_code: teacherCode,
        teacher_id: resolvedId,
        teacher_name: resolvedName,
        subject: pubSubject.trim(),
        word_to_learn: pubWord.trim(),
        homework: pubHomework.trim(),
        timestamp: Date.now()
      });

      setPubSuccess("Published successfully! Lesson, math word, and homework have been broadcasted live! 🚀");
      setPubSubject('');
      setPubWord('');
      setPubHomework('');
    } catch (err: any) {
      console.error("Failed to publish chalkboard post:", err);
      setPubError(err.message || "An error occurred while publishing.");
    } finally {
      setPubLoading(false);
    }
  };

  // Activate / create classroom with generated code
  const handleActivateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError(null);
    setCodeSuccess(null);
    const cleanClassName = newClassNameInput.trim();

    if (!cleanClassName) {
      setCodeError("Classroom name cannot be empty!");
      return;
    }
    if (cleanClassName.length < 2) {
      setCodeError("Classroom name must be at least 2 characters long!");
      return;
    }

    setIsGeneratingCode(true);
    try {
      // Generate a hard-to-guess code
      let uniqueCode = '';
      let isCodeUnique = false;
      let attempts = 0;

      while (!isCodeUnique && attempts < 10) {
        uniqueCode = generateClassCode();
        const teachersCol = collection(db, 'teachers');
        const q = query(teachersCol, where('class_code', '==', uniqueCode));
        const snap = await getDocs(q);
        if (snap.empty) {
          isCodeUnique = true;
        }
        attempts++;
      }

      if (!isCodeUnique) {
        throw new Error("Failed to generate a unique class code after multiple attempts. Please try again.");
      }

      // Save class name and code to teacher doc
      const teacherRef = doc(db, 'teachers', resolvedId);
      await updateDoc(teacherRef, {
        class_code: uniqueCode,
        class_name: cleanClassName
      });
      
      setTeacherCode(uniqueCode);
      setClassName(cleanClassName);
      setCodeSuccess(`Successfully created Classroom: ${cleanClassName}!`);
      setNewClassNameInput('');
    } catch (err: any) {
      setCodeError(err.message || "Failed to activate Class Code.");
    } finally {
      setIsGeneratingCode(false);
    }
  };

  // Deactivate Class Code
  const handleDeactivateCode = async () => {
    if (!window.confirm("Are you sure you want to disable your active Class Code? Students will no longer be able to log in to this classroom.")) {
      return;
    }
    setCodeError(null);
    setCodeSuccess(null);
    try {
      const teacherRef = doc(db, 'teachers', resolvedId);
      await updateDoc(teacherRef, {
        class_code: null,
        class_name: null
      });
      setTeacherCode('');
      setClassName('');
      setCodeSuccess("Classroom disabled successfully.");
    } catch (err: any) {
      setCodeError(err.message || "Failed to disable Class Code.");
    }
  };

  // Remove a student from class
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
  };

  const handleSendEncouragement = async (sessionId: string, text: string) => {
    try {
      const docRef = doc(db, 'class_sessions', sessionId);
      await updateDoc(docRef, {
        teacher_message: {
          text,
          timestamp: Date.now()
        }
      });
    } catch (err) {
      console.error("Failed to send encouragement:", err);
    }
  };

  // Client-side Form Validation and Student Register Creation
  const handleRegisterStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const cleanFirstName = firstName.trim();
    const cleanUsername = username.trim().replace(/\s/g, '');
    const cleanPassword = password.trim();

    // STRICT LOCAL VERIFICATION (Enforce browser-side checks to protect DB resources)
    if (!cleanFirstName) {
      setFormError("Error: Real first name is required.");
      return;
    }
    if (cleanFirstName.length < 2) {
      setFormError("Error: Real first name must be at least 2 characters long.");
      return;
    }
    if (!/^[a-zA-Z\s]+$/.test(cleanFirstName)) {
      setFormError("Error: Real first name can only contain letters and spaces.");
      return;
    }

    if (!cleanUsername) {
      setFormError("Error: Username is required.");
      return;
    }
    if (cleanUsername.length < 3) {
      setFormError("Error: Username must be at least 3 characters long.");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      setFormError("Error: Username can only contain letters, numbers, and underscores.");
      return;
    }

    if (!isAppropriate(cleanUsername) || !isAppropriate(cleanFirstName)) {
      setFormError("Name or username contains inappropriate language. Please use school-appropriate names.");
      return;
    }

    if (!cleanPassword) {
      setFormError("Error: Password is required.");
      return;
    }
    if (cleanPassword.length < 4) {
      setFormError("Error: Password PIN must be at least 4 characters long.");
      return;
    }

    // Pass validated state to database helper to save
    setIsSubmitting(true);
    try {
      const result = await addStudentToTeacher(cleanFirstName, cleanUsername, cleanPassword, resolvedId);
      if (result.success) {
        setFormSuccess(`Successfully registered rockstar student @${cleanUsername}!`);
        // Reset local form immediately
        setFirstName('');
        setUsername('');
        setPassword('');
      } else {
        setFormError(result.error || "Failed to create student account.");
      }
    } catch (err: any) {
      setFormError(err.message || "A network error occurred while writing to the registry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Search Filter Logic
  const filteredStudents = students.filter(s => {
    const fullName = s.real_first_name.toLowerCase();
    const queryStr = searchQuery.toLowerCase();
    return fullName.includes(queryStr) || s.username.includes(queryStr);
  });

  // Computed stats
  const totalStudents = students.length;
  const totalClassXP = students.reduce((acc, current) => {
    const prog = current.school_math_progress || { xp: 0 };
    return acc + (prog.xp || 100);
  }, 0);

  return (
    <div className="flex flex-col flex-1 justify-between w-full h-full">
      <div className="space-y-6 flex-1">
      {/* Teacher Dashboard Master Panel */}
      <div id="teacher-header-panel" className="bg-clean-white border border-deep-navy border-4 rounded-3xl p-6 md:p-8 space-y-6 backdrop-blur-xl relative overflow-hidden">
        {/* Colorful top bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 font-mono text-xs font-black uppercase">
                Classroom Lead
              </div>
              <h2 className="text-xl font-extrabold text-deep-navy tracking-tight flex items-center gap-2">
                <GraduationCap className="text-violet-400" size={24} />
                Welcome, {resolvedName}!
              </h2>
            </div>
            <p className="text-sm text-deep-navy">
              Your classroom control board. Manage your math rockstars and check real-time progress below.
            </p>
            <div className="text-xs font-mono text-indigo-400">
              Registered email: {resolvedEmail}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onSignOut}
              className="px-4 py-3 rounded-2xl bg-white backdrop-blur-md hover:bg-rose-500/10 border border-deep-navy border-4 hover:border-rose-500/20 text-deep-navy hover:text-rose-400 text-xs font-bold uppercase transition-all tracking-wider flex items-center gap-2 cursor-pointer"
            >
              <LogOut size={13} />
              Sign Out
            </button>

          </div>
        </div>
      </div>

      {/* Classroom Stats Widget Row */}
      <div id="classroom-tracker-widgets" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-clean-white border border-deep-navy border-4 rounded-3xl p-5 flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-400 shrink-0">
            <Users size={22} />
          </div>
          <div>
            <div className="text-xs text-deep-navy font-bold uppercase tracking-wider">Total Active Class Students</div>
            <div className="text-2xl font-black text-deep-navy">{totalStudents}</div>
          </div>
        </div>
        <div className="bg-clean-white border border-deep-navy border-4 rounded-3xl p-5 flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
            <Sparkles size={22} />
          </div>
          <div>
            <div className="text-xs text-deep-navy font-bold uppercase tracking-wider">Accumulated Class XP Points</div>
            <div className="text-2xl font-black text-deep-navy">{totalClassXP} XP</div>
          </div>
        </div>
      </div>

      {/* Dashboard Sub-Tab Navigation */}
      <div className="flex bg-white p-1 rounded-2xl border border-deep-navy border-4 gap-1.5 shadow-md">
        <button
          onClick={() => setActiveDashboardTab('roster')}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeDashboardTab === 'roster'
              ? 'bg-deep-navy text-white shadow-md'
              : 'text-deep-navy hover:bg-slate-50'
          }`}
        >
          <Users size={15} />
          Roster & Registrations
        </button>
        <button
          onClick={() => setActiveDashboardTab('class_login')}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeDashboardTab === 'class_login'
              ? 'bg-deep-navy text-white shadow-md'
              : 'text-deep-navy hover:bg-slate-50'
          }`}
        >
          <Globe size={15} />
          Class Login Hub 👑
        </button>
      </div>

      {/* Conditional Dashboard Tab Content */}
      {activeDashboardTab === 'roster' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Form: Register New Student in Classroom */}
          <div id="card-student-register" className="bg-clean-white border border-deep-navy border-4 rounded-3xl p-6 space-y-6 backdrop-blur-xl h-fit text-left">
            <div className="space-y-1">
              <h3 className="text-md font-black uppercase text-deep-navy flex items-center gap-2">
                <UserPlus size={18} className="text-emerald-400" />
                Register student
              </h3>
              <p className="text-xs text-deep-navy">
                Instantly create a new credentials profile to onboard a student.
              </p>
            </div>

            <form onSubmit={handleRegisterStudentSubmit} className="space-y-4">
              {formError && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-xl flex items-start gap-2">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl flex items-start gap-2 animate-bounce-short">
                  <CheckCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {/* First Name Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-deep-navy tracking-wider block">Real First Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mason"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white backdrop-blur-md border border-deep-navy border-4 rounded-xl text-deep-navy text-xs outline-none focus:border-violet-500 transition-all font-semibold"
                  disabled={isSubmitting}
                />
                <p className="text-[9px] text-slate-500">Real name is visible only to you on this roster.</p>
              </div>

              {/* Username Entry */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-deep-navy tracking-wider block">Game Username</label>
                <input
                  type="text"
                  placeholder="e.g. mason_star"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white backdrop-blur-md border border-deep-navy border-4 rounded-xl text-deep-navy text-xs outline-none focus:border-violet-500 transition-all font-semibold"
                  disabled={isSubmitting}
                />
                <p className="text-[9px] text-slate-500">Must be lowercase & alphanumeric. Must be unique in the database.</p>
              </div>

              {/* Password Entry */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-deep-navy tracking-wider block">Roster Login Password</label>
                <input
                  type="text"
                  placeholder="e.g. play777"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white backdrop-blur-md border border-deep-navy border-4 rounded-xl text-deep-navy text-xs outline-none focus:border-violet-500 transition-all font-semibold"
                  disabled={isSubmitting}
                />
                <p className="text-[9px] text-slate-500">PIN or passcode used by the student to log in.</p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-slate-950 text-xs font-black uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-950/15 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    Creating Student...
                  </>
                ) : (
                  <>
                    <UserPlus size={13} />
                    Register Student Account
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Columns: Live Roster & Student Stats */}
          <div id="card-class-roster" className="lg:col-span-2 space-y-6 text-left">
            <div className="bg-clean-white border border-deep-navy border-4 rounded-3xl p-6 space-y-6 backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h3 className="text-md font-black uppercase text-deep-navy flex items-center gap-2">
                    <Users size={18} className="text-violet-400" />
                    Active Class Student Roster
                  </h3>
                  <p className="text-xs text-deep-navy">Reference student passwords and track math scoreboard stats live.</p>
                </div>

                {/* Search filter input */}
                <div className="relative max-w-xs w-full sm:w-56">
                  <Search size={14} className="absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Filter student name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white backdrop-blur-md border border-deep-navy border-4 rounded-2xl pl-9 pr-4 py-2 text-xs outline-none focus:border-violet-500 font-medium transition-all text-deep-navy placeholder:text-slate-700"
                  />
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12 text-slate-500 text-xs font-mono">
                  <RefreshCw size={16} className="animate-spin mx-auto mb-2 text-violet-400" />
                  Loading live classroom roster...
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="border border-dashed border-deep-navy border-4 rounded-3xl p-12 text-center text-slate-450 text-xs mx-auto space-y-3">
                  <p>No rockstars registered inside your classroom ledger yet.</p>
                  <p className="text-[11px] text-slate-500">
                    Fill in the registration form on the left of this screen to instantly add students!
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-deep-navy border-4">
                  <table className="w-full text-left text-xs text-deep-navy">
                    <thead className="bg-white backdrop-blur-md text-[10px] font-black uppercase text-deep-navy tracking-wider border-b border-deep-navy border-4">
                      <tr>
                        <th className="p-4">Student Name</th>
                        <th className="p-4">Game Logins</th>
                        <th className="p-4 text-center">Score 🏆</th>
                        <th className="p-4 text-center">XP Points ✨</th>
                        <th className="p-4 text-center">Math Coins 🪙</th>
                        <th className="p-4 text-center">Level ⭐</th>
                        <th className="p-4 text-center">Streak 🔥</th>
                        <th className="p-4 text-center">Completed Topics ✅</th>
                        <th className="p-4 text-center">Next Topics 🎯</th>
                        <th className="p-4 text-center">Struggling? ⚠️</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-medium">
                      {filteredStudents.map((student, idx) => {
                        const progress = student.school_math_progress || {
                          highScore: 0,
                          xp: 100,
                          coins: 100,
                          solved: 0,
                          correctAnswers: 0,
                          currentLevel: 1,
                          streak: 0,
                          completedTopics: []
                        };
                        const accuracy = progress.solved > 0 ? (progress.correctAnswers / progress.solved) * 100 : 100;
                        const isStruggling = accuracy < 50 && progress.solved > 10;
                        const completed = progress.completedTopics || [];
                        const nextTopics = LESSONS.filter(l => !completed.includes(l.id)).slice(0, 2);
                        
                        return (
                          <tr key={`${student.id}-${idx}`} className="hover:bg-white/[2%] transition-all">
                            <td className="p-4 text-deep-navy">
                              <span className="font-bold block text-sm">
                                {student.real_first_name}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono italic">ID: {student.id.substring(0, 8)}...</span>
                            </td>
                            <td className="p-4 space-y-1">
                              <div className="text-cyan-400 font-mono font-bold text-xs">
                                @{student.username}
                              </div>
                              <span className="px-2 py-0.5 bg-white backdrop-blur-md rounded text-deep-navy font-bold font-mono border border-deep-navy border-4 inline-flex items-center gap-1">
                                <Lock size={9} className="text-slate-700" /> {student.password}
                              </span>
                            </td>
                            <td className="p-4 text-center font-extrabold text-rose-400 text-sm">
                              {progress.highScore}
                            </td>
                            <td className="p-4 text-center font-black text-amber-400">
                              {progress.xp}
                            </td>
                            <td className="p-4 text-center font-black text-yellow-400 inline-flex items-center gap-1 justify-center pt-5">
                              <Coins size={12} className="text-yellow-500" />
                              {student.coins ?? progress.coins ?? 100}
                            </td>
                            <td className="p-4 text-center">
                              <span className="inline-block px-1.5 py-0.5 bg-violet-500/10 text-violet-400 rounded-md font-mono text-xs font-bold">
                                Lvl {progress.currentLevel ?? 1}
                              </span>
                            </td>
                            <td className="p-4 text-center font-black text-orange-500">
                              {progress.streak}
                            </td>
                            <td className="p-4 text-center text-[10px] text-slate-500">
                              {completed.length} / {LESSONS.length}
                            </td>
                            <td className="p-4 text-center">
                              {nextTopics.map(t => (
                                <span key={t.id} className="block text-[9px] text-indigo-500 font-bold">
                                  {t.title}
                                </span>
                              ))}
                            </td>
                            <td className="p-4 text-center">
                              {isStruggling ? (
                                <span className="px-2 py-1 bg-rose-500/10 text-rose-500 rounded text-[10px] font-black uppercase">
                                  Yes ({Math.round(accuracy)}%)
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[10px]">No</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* TAB 2: Class Login Code and Student Join Approvals */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel column container */}
          <div className="space-y-6 lg:col-span-1 flex flex-col">
            {/* Class Code Manager */}
            <div className="bg-clean-white border border-deep-navy border-4 rounded-3xl p-6 space-y-6 text-left shadow-lg">
            <div className="space-y-1">
              <h3 className="text-md font-black uppercase text-deep-navy flex items-center gap-2">
                <Globe size={18} className="text-cyan-400 animate-spin-slow" />
                Class Login Code
              </h3>
              <p className="text-xs text-deep-navy">
                Set a globally unique Class Code. Share this code with students so they can join your real-time playground!
              </p>
            </div>

            {/* Code Feedback notifications */}
            {codeError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-xl flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{codeError}</span>
              </div>
            )}

            {codeSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl flex items-start gap-2">
                <CheckCircle size={15} className="shrink-0 mt-0.5" />
                <span>{codeSuccess}</span>
              </div>
            )}

            {/* Display Active Code or Setup Form */}
            {teacherCode ? (
              <div className="space-y-4">
                <div className="p-5 bg-sunny-yellow/15 border border-deep-navy border-4 rounded-2xl text-center space-y-2 shadow-inner">
                  <span className="text-[10px] font-mono font-black text-deep-navy/60 uppercase block">ACTIVE CLASSROOM: {className}</span>
                  <div className="text-4xl font-black text-deep-navy tracking-wider uppercase select-all font-mono">
                    {teacherCode}
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 rounded text-[9px] font-mono font-black uppercase inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE ACCESSIBLE
                  </span>
                </div>

                <div className="text-xs text-deep-navy/80 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-deep-navy border-2 space-y-1">
                  <p className="font-bold">Instructions for Students:</p>
                  <p>1. Go to the main login portal.</p>
                  <p>2. Select the <strong>Class Login</strong> tab.</p>
                  <p>3. Enter name and the generated code: <strong className="font-mono">{teacherCode}</strong></p>
                  <p>4. They will enter the playground instantly!</p>
                </div>

                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full py-2.5 rounded-xl bg-rose-900/10 hover:bg-rose-500 hover:text-white border border-rose-500/30 hover:border-rose-600 text-rose-600 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                >
                  Disable Classroom
                </button>
              </div>
            ) : (
              <form onSubmit={handleActivateCode} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-deep-navy tracking-wider block">Set Classroom Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Mrs. Smith's Math Stars"
                    value={newClassNameInput}
                    onChange={(e) => setNewClassNameInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-deep-navy border-4 rounded-xl text-deep-navy text-xs outline-none focus:border-cyan-400 font-semibold"
                    disabled={isGeneratingCode}
                  />
                  <p className="text-[9px] text-slate-500">Give your classroom a name. A secure, unique code will be generated for you!</p>
                </div>

                <button
                  type="submit"
                  disabled={isGeneratingCode}
                  className="w-full py-3 bg-gradient-to-r from-cyan-400 to-sky-500 hover:brightness-110 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isGeneratingCode ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      Creating Classroom...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={13} />
                      Generate Class Code
                    </>
                  )}
                </button>
              </form>
            )}
            </div>

            {/* Class Arena Chalkboard & Homework Publisher */}
            <div className="bg-clean-white border border-deep-navy border-4 rounded-3xl p-6 space-y-4 text-left shadow-lg">
              <div className="space-y-1">
                <h3 className="text-sm font-black uppercase text-deep-navy flex items-center gap-2">
                  <Pencil size={18} className="text-pink-500 animate-pulse" />
                  Arena Chalkboard Publisher
                </h3>
                <p className="text-[11px] text-slate-600 font-bold leading-relaxed">
                  Only you (the teacher) can post to the Class Arena chalkboard. Broadcast active math topics, words to learn, and custom research assignments!
                </p>
              </div>

              {pubError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 text-[11px] font-bold rounded-xl flex items-start gap-2">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{pubError}</span>
                </div>
              )}

              {pubSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[11px] font-bold rounded-xl flex items-start gap-2">
                  <CheckCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{pubSuccess}</span>
                </div>
              )}

              <form onSubmit={handlePublishChalkboard} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-deep-navy tracking-wider block font-mono">
                    1. Active Teaching Subject
                  </label>
                  <div className="relative">
                    <BookOpen size={13} className="absolute left-3 top-3 text-deep-navy" />
                    <input
                      type="text"
                      placeholder="e.g. Multiplication & Fractions"
                      value={pubSubject}
                      onChange={(e) => setPubSubject(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-white border border-deep-navy border-4 rounded-xl text-deep-navy text-xs outline-none focus:border-pink-500 transition-all font-semibold"
                      disabled={pubLoading}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-deep-navy tracking-wider block font-mono">
                    2. Word to Learn in Math
                  </label>
                  <div className="relative">
                    <Sparkles size={13} className="absolute left-3 top-3 text-deep-navy" />
                    <input
                      type="text"
                      placeholder="e.g. Denominator (The bottom number)"
                      value={pubWord}
                      onChange={(e) => setPubWord(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-white border border-deep-navy border-4 rounded-xl text-deep-navy text-xs outline-none focus:border-pink-500 transition-all font-semibold"
                      disabled={pubLoading}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-deep-navy tracking-wider block font-mono">
                    3. Homework Assignment / Math Research Topic
                  </label>
                  <div className="relative flex">
                    <FileText size={13} className="absolute left-3 top-3 text-deep-navy" />
                    <textarea
                      placeholder="e.g. Research how ancient civilizations solved multiplication! Practice 5 times in the Arena."
                      rows={3}
                      value={pubHomework}
                      onChange={(e) => setPubHomework(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-white border border-deep-navy border-4 rounded-xl text-deep-navy text-xs outline-none focus:border-pink-500 transition-all font-semibold resize-none"
                      disabled={pubLoading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={pubLoading || !teacherCode}
                  className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_4px_10px_rgba(236,72,153,0.3)] disabled:opacity-50"
                >
                  {pubLoading ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Pencil size={13} />
                      PUBLISH TO CLASS ARENA 🚀
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Columns: Active Class Sessions */}
          <div className="lg:col-span-2 space-y-6 text-left">
            <div className="bg-clean-white border border-deep-navy border-4 rounded-3xl p-6 space-y-4 backdrop-blur-xl">
              <div className="space-y-0.5">
                <h3 className="text-md font-black uppercase text-deep-navy flex items-center gap-2">
                  <Activity size={18} className="text-pink-500 animate-pulse" />
                  Active Classroom Players
                </h3>
                <p className="text-xs text-deep-navy">Currently logged-in students. You can remove any player from the session instantly.</p>
              </div>

              {activeSessions.length === 0 ? (
                <div className="border border-dashed border-deep-navy border-4 rounded-2xl p-12 text-center text-slate-450 text-xs mx-auto space-y-2">
                  <p>No students are currently active in the playground.</p>
                  {teacherCode ? (
                    <p className="text-[11px] text-slate-500 font-medium">
                      Share code <strong className="font-mono text-cyan-600">{teacherCode}</strong> with your class to see them appear here!
                    </p>
                  ) : (
                    <p className="text-[11px] text-rose-500 font-bold">
                      You must create a Classroom on the left panel first!
                    </p>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-deep-navy border-4">
                  <table className="w-full text-left text-xs text-deep-navy">
                    <thead className="bg-white text-[10px] font-black uppercase text-deep-navy tracking-wider border-b border-deep-navy border-4">
                      <tr>
                        <th className="p-4">Student</th>
                        <th className="p-4">Stats & Level</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-medium">
                      {activeSessions.map((session, idx) => {
                        const loginTime = new Date(session.timestamp).toLocaleTimeString();
                        return (
                          <tr key={`${session.id}-${idx}`} className="hover:bg-white/[2%] transition-all">
                            <td className="p-4">
                              <span className="font-bold text-sm block text-deep-navy">
                                @{session.student_name}
                              </span>
                              <span className="text-[9px] text-slate-500 font-mono block mt-0.5">Logged in at {loginTime}</span>
                            </td>
                            <td className="p-4 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded text-[9px] font-black uppercase">
                                  {session.xp || 0} XP
                                </span>
                                <span className="px-1.5 py-0.5 bg-violet-500/10 border border-violet-500/20 text-violet-600 rounded text-[9px] font-black uppercase">
                                  Lvl {session.level || 1}
                                </span>
                              </div>
                            </td>
                            <td className="p-4 text-center space-y-2">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => handleSendEncouragement(session.id, "Great effort!")}
                                  className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-[9px] rounded uppercase tracking-wider transition-all cursor-pointer shadow"
                                >
                                  👍 Great Effort!
                                </button>
                                <button
                                  onClick={() => handleSendEncouragement(session.id, "Take your time!")}
                                  className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold text-[9px] rounded uppercase tracking-wider transition-all cursor-pointer shadow"
                                >
                                  ⏳ Take your time
                                </button>
                              </div>
                              <button
                                onClick={() => setStudentToRemove(session.id)}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg uppercase tracking-wider transition-all cursor-pointer shadow flex items-center gap-1 mx-auto"
                              >
                                <X size={11} /> Remove
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}


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

      </div>
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border border-rose-500 border-4 shadow-2xl relative">
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                setDeleteConfirmText('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 border-4 border-rose-200">
                <AlertCircle size={32} />
              </div>
            </div>

            <h3 className="text-xl font-black text-center text-deep-navy mb-2 uppercase tracking-wide">
              Danger Zone
            </h3>
            <p className="text-sm text-center text-slate-600 mb-6 font-medium">
              Are you ABSOLUTELY sure you want to disable this classroom? ALL student data, progress, and accounts will be permanently deleted and cannot be recovered.
            </p>

            <div className="space-y-4">
              {deleteError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2">
                  <AlertCircle size={14} className="text-rose-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-rose-600 font-bold">{deleteError}</p>
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider text-center">
                  Type "yes" to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="yes"
                  className="w-full text-center px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-rose-500 focus:outline-none transition-all font-bold text-slate-700"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                    setDeleteError('');
                  }}
                  className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  disabled={deleteConfirmText.toLowerCase() !== 'yes' || isDeleting}
                  onClick={async () => {
                    if (deleteConfirmText.toLowerCase() === 'yes') {
                      setIsDeleting(true);
                      setDeleteError('');
                      try {
                        await wipeClassroomData(resolvedId);
                        setTeacherCode('');
                        setClassName('');
                        setShowDeleteConfirm(false);
                      } catch (error: any) {
                        console.error("Error deleting classroom:", error);
                        setDeleteError(error.message || "There was an error deleting the classroom. Please try again.");
                      } finally {
                        setIsDeleting(false);
                      }
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? "Deleting..." : "Disable"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Itch.io Embed */}
      <div className="flex justify-center mt-4 mb-0 w-full">
         <iframe frameBorder="0" src="https://itch.io/embed/4792376?linkback=true" width="552" height="167" className="rounded-xl shadow-xl max-w-full"><a href="https://jesse-otobo.itch.io/httpsjesse-math-rockstar-appvercelapp">Jesse mathrockstar by Jesse otobo</a></iframe>
      </div>
    </div>
  );
}
