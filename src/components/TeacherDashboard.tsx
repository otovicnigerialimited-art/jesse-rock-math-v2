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
import { SchoolStudent, addStudentToTeacher, generateClassCode, deleteClassroom, wipeClassroomData, resetStudentCredentials } from '../lib/schoolDb';
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
  Pencil, 
  Building, 
  Upload, 
  Printer, 
  Ticket, 
  LayoutGrid, 
  Layers, 
  History, 
  FileCheck, 
  Heart, 
  Lightbulb,
  Key,
  ShieldCheck,
  Copy
} from 'lucide-react';
import { motion } from 'motion/react';

// Advanced Classroom Tools Components
import SchoolAdminSection from './teacher/SchoolAdminSection';
import BulkStudentImportModal from './teacher/BulkStudentImportModal';
import StudentLoginCardsModal from './teacher/StudentLoginCardsModal';
import LiveSessionManager from './teacher/LiveSessionManager';
import TeacherRecommendationCard from './teacher/TeacherRecommendationCard';
import ExitTicketManager from './teacher/ExitTicketManager';
import MisconceptionDetectorCard from './teacher/MisconceptionDetectorCard';
import ClassroomSeatingChart from './teacher/ClassroomSeatingChart';
import InterventionGroupBuilder from './teacher/InterventionGroupBuilder';
import HomeworkManager from './teacher/HomeworkManager';
import StudentJourneyReplay from './teacher/StudentJourneyReplay';
import AssessmentBuilderModal from './teacher/AssessmentBuilderModal';
import ParentReportModal from './teacher/ParentReportModal';
import StudentHelpCenterDrawer from './teacher/StudentHelpCenterDrawer';
import GoogleClassroomSection from './teacher/GoogleClassroomSection';

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
  const resolvedName = teacher?.teacher_name || teacherName || 'Striker Educator';
  const resolvedEmail = teacher?.email || teacherEmail || '';

  const [activeDashboardTab, setActiveDashboardTab] = useState<'roster' | 'class_login' | 'live_session' | 'school_admin' | 'assessments' | 'homework' | 'differentiation' | 'google_classroom'>('roster');

  // Modals state
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showLoginCards, setShowLoginCards] = useState(false);
  const [showAssessmentBuilder, setShowAssessmentBuilder] = useState(false);
  const [selectedStudentForJourney, setSelectedStudentForJourney] = useState<SchoolStudent | null>(null);
  const [selectedStudentForParentReport, setSelectedStudentForParentReport] = useState<SchoolStudent | null>(null);

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
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState<SchoolStudent | null>(null);

  // Credential Reset and Temporary Session PIN Tracking
  const [temporarySessionPins, setTemporarySessionPins] = useState<Record<string, string>>({});
  const [resetModalStudent, setResetModalStudent] = useState<SchoolStudent | null>(null);
  const [resetCustomPin, setResetCustomPin] = useState('');
  const [resetSuccessData, setResetSuccessData] = useState<{ username: string; pin: string } | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [copiedPin, setCopiedPin] = useState(false);

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
        setFormSuccess(`Successfully registered striker student @${cleanUsername}!`);
        if (result.studentId) {
          setTemporarySessionPins(prev => ({
            ...prev,
            [result.studentId!]: cleanPassword,
            [cleanUsername]: cleanPassword
          }));
        }
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

  // Initiate Credential Reset Workflow
  const handleOpenResetModal = (student: SchoolStudent) => {
    setResetModalStudent(student);
    setResetCustomPin('rock' + Math.floor(100 + Math.random() * 900));
    setResetSuccessData(null);
    setResetError(null);
    setCopiedPin(false);
  };

  // Confirm and Execute Credential Reset
  const handleConfirmResetPassword = async () => {
    if (!resetModalStudent) return;
    setIsResetting(true);
    setResetError(null);

    const pinToSet = resetCustomPin.trim();
    if (!pinToSet || pinToSet.length < 4) {
      setResetError("PIN must be at least 4 characters.");
      setIsResetting(false);
      return;
    }

    try {
      const res = await resetStudentCredentials(resolvedId, resetModalStudent.id, pinToSet);
      if (res.success && res.temporaryPin) {
        const finalPin = res.temporaryPin;
        setResetSuccessData({
          username: resetModalStudent.username,
          pin: finalPin
        });
        setTemporarySessionPins(prev => ({
          ...prev,
          [resetModalStudent.id]: finalPin,
          [resetModalStudent.username]: finalPin
        }));
      } else {
        setResetError(res.error || "Failed to reset credentials.");
      }
    } catch (e: any) {
      setResetError(e.message || "Error processing credential reset.");
    } finally {
      setIsResetting(false);
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
              Your classroom control board. Manage your math strikers and check real-time progress below.
            </p>
            <div className="text-xs font-mono text-indigo-400">
              Registered email: {resolvedEmail}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setShowBulkImport(true)}
              className="px-3.5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 border border-deep-navy border-4 text-slate-950 text-xs font-black uppercase transition-all tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Upload size={14} /> Bulk CSV Import
            </button>

            <button
              onClick={() => setShowLoginCards(true)}
              className="px-3.5 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border border-deep-navy border-4 text-deep-navy text-xs font-black uppercase transition-all tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Printer size={14} /> Login Cards
            </button>

            <button
              onClick={onSignOut}
              className="px-3.5 py-2.5 rounded-2xl bg-white backdrop-blur-md hover:bg-rose-500/10 border border-deep-navy border-4 hover:border-rose-500/20 text-deep-navy hover:text-rose-400 text-xs font-bold uppercase transition-all tracking-wider flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Intelligent AI Recommendation Banner */}
      <TeacherRecommendationCard
        students={students}
        onBuildLesson={(topic, skill) => {
          setActiveDashboardTab('live_session');
        }}
      />

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
      <div className="flex flex-wrap bg-white p-1.5 rounded-2xl border border-deep-navy border-4 gap-1.5 shadow-md">
        <button
          onClick={() => setActiveDashboardTab('roster')}
          className={`flex-1 min-w-[120px] py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeDashboardTab === 'roster' ? 'bg-deep-navy text-white shadow-md' : 'text-deep-navy hover:bg-slate-50'
          }`}
        >
          <Users size={14} /> Roster
        </button>

        <button
          onClick={() => setActiveDashboardTab('live_session')}
          className={`flex-1 min-w-[120px] py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeDashboardTab === 'live_session' ? 'bg-deep-navy text-white shadow-md' : 'text-deep-navy hover:bg-slate-50'
          }`}
        >
          <Activity size={14} className="text-rose-400" /> Live & Desks
        </button>

        <button
          onClick={() => setActiveDashboardTab('differentiation')}
          className={`flex-1 min-w-[120px] py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeDashboardTab === 'differentiation' ? 'bg-deep-navy text-white shadow-md' : 'text-deep-navy hover:bg-slate-50'
          }`}
        >
          <Layers size={14} className="text-indigo-400" /> Interventions
        </button>

        <button
          onClick={() => setActiveDashboardTab('homework')}
          className={`flex-1 min-w-[120px] py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeDashboardTab === 'homework' ? 'bg-deep-navy text-white shadow-md' : 'text-deep-navy hover:bg-slate-50'
          }`}
        >
          <BookOpen size={14} className="text-amber-400" /> Homework & Exit
        </button>

        <button
          onClick={() => setActiveDashboardTab('assessments')}
          className={`flex-1 min-w-[120px] py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeDashboardTab === 'assessments' ? 'bg-deep-navy text-white shadow-md' : 'text-deep-navy hover:bg-slate-50'
          }`}
        >
          <FileCheck size={14} className="text-emerald-400" /> Assessment Builder
        </button>

        <button
          onClick={() => setActiveDashboardTab('school_admin')}
          className={`flex-1 min-w-[120px] py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeDashboardTab === 'school_admin' ? 'bg-deep-navy text-white shadow-md' : 'text-deep-navy hover:bg-slate-50'
          }`}
        >
          <Building size={14} className="text-violet-400" /> School Org
        </button>

        <button
          onClick={() => setActiveDashboardTab('class_login')}
          className={`flex-1 min-w-[120px] py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeDashboardTab === 'class_login' ? 'bg-deep-navy text-white shadow-md' : 'text-deep-navy hover:bg-slate-50'
          }`}
        >
          <Globe size={14} className="text-cyan-400" /> Class Code
        </button>

        <button
          onClick={() => setActiveDashboardTab('google_classroom')}
          className={`flex-1 min-w-[140px] py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeDashboardTab === 'google_classroom' ? 'bg-deep-navy text-white shadow-md' : 'text-deep-navy hover:bg-slate-50'
          }`}
        >
          <BookOpen size={14} className="text-blue-400" /> Google Classroom
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
                  <p>No strikers registered inside your classroom ledger yet.</p>
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
                        <th className="p-4 text-center">Actions 📊</th>
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
                          <tr key={`${student.id}-${idx}`} className="hover:bg-violet-500/5 transition-all">
                            <td className="p-4 text-deep-navy">
                              <span className="font-bold block text-sm">
                                {student.real_first_name}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono italic">ID: {student.id.substring(0, 8)}...</span>
                            </td>
                            <td className="p-4 space-y-1">
                              <div className="text-cyan-600 font-mono font-bold text-xs">
                                @{student.username}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 bg-emerald-50 rounded text-emerald-800 font-bold font-mono border border-emerald-300 text-[10px] inline-flex items-center gap-1">
                                  <ShieldCheck size={10} className="text-emerald-600" /> Protected PIN
                                </span>
                                <button
                                  onClick={() => handleOpenResetModal(student)}
                                  className="p-1 text-slate-500 hover:text-amber-600 hover:bg-amber-100 rounded-lg transition-all cursor-pointer"
                                  title="Reset Student PIN"
                                >
                                  <Key size={12} />
                                </button>
                              </div>
                            </td>
                            <td className="p-4 text-center font-extrabold text-rose-500 text-sm">
                              {progress.highScore}
                            </td>
                            <td className="p-4 text-center font-black text-amber-500">
                              {progress.xp}
                            </td>
                            <td className="p-4 text-center font-black text-yellow-600">
                              <div className="inline-flex items-center gap-1 justify-center">
                                <Coins size={12} className="text-yellow-500" />
                                {student.coins ?? progress.coins ?? 100}
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <span className="inline-block px-1.5 py-0.5 bg-violet-500/10 text-violet-600 rounded-md font-mono text-xs font-bold">
                                Lvl {progress.currentLevel ?? 1}
                              </span>
                            </td>
                            <td className="p-4 text-center font-black text-orange-500">
                              {progress.streak}
                            </td>
                            <td className="p-4 text-center text-[10px] text-slate-600 font-bold">
                              {completed.length} / {LESSONS.length}
                            </td>
                            <td className="p-4 text-center">
                              {nextTopics.map(t => (
                                <span key={t.id} className="block text-[9px] text-indigo-600 font-bold">
                                  {t.title}
                                </span>
                              ))}
                            </td>
                            <td className="p-4 text-center">
                              {isStruggling ? (
                                <span className="px-2 py-1 bg-rose-500/10 text-rose-600 rounded text-[10px] font-black uppercase inline-flex items-center gap-1">
                                  <AlertCircle size={10} /> Yes ({Math.round(accuracy)}%)
                                </span>
                              ) : (
                                <span className="text-emerald-600 font-bold text-[10px] inline-flex items-center gap-1">
                                  <CheckCircle size={10} /> Good ({Math.round(accuracy)}%)
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex flex-col gap-1 items-center">
                                <button
                                  onClick={() => setSelectedStudentForDetails(student)}
                                  className="px-2.5 py-1 bg-violet-600 hover:bg-violet-700 text-white font-black text-[10px] uppercase rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1 w-full justify-center"
                                >
                                  <Activity size={11} /> Details
                                </button>
                                <button
                                  onClick={() => setSelectedStudentForJourney(student)}
                                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1 w-full justify-center"
                                >
                                  <History size={11} /> Journey
                                </button>
                                <button
                                  onClick={() => setSelectedStudentForParentReport(student)}
                                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10px] uppercase rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1 w-full justify-center"
                                >
                                  <Heart size={11} /> Parent Report
                                </button>
                                <button
                                  onClick={() => handleOpenResetModal(student)}
                                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-amber-400 font-black text-[10px] uppercase rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1 w-full justify-center"
                                >
                                  <Key size={11} /> Reset PIN
                                </button>
                              </div>
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
      ) : activeDashboardTab === 'live_session' ? (
        <div className="space-y-6">
          <LiveSessionManager
            teacherId={resolvedId}
            classId="c1"
            className={className || "Year 5A"}
            students={students}
          />
          <ClassroomSeatingChart students={students} />
        </div>
      ) : activeDashboardTab === 'differentiation' ? (
        <div className="space-y-6">
          <InterventionGroupBuilder
            students={students}
            onAssignGroupActivities={(groups) => {
              console.log("Assigned group activities:", groups);
            }}
          />
        </div>
      ) : activeDashboardTab === 'homework' ? (
        <div className="space-y-6">
          <MisconceptionDetectorCard
            onBuildMiniLesson={(topic, skill) => setActiveDashboardTab('live_session')}
            onCreatePractice={(topic, skill) => setActiveDashboardTab('homework')}
          />
          <ExitTicketManager
            teacherId={resolvedId}
            classId="c1"
            students={students}
            onAssignPractice={(skill) => console.log("Assigning follow-up practice:", skill)}
          />
          <HomeworkManager
            teacherId={resolvedId}
            classId="c1"
            students={students}
          />
        </div>
      ) : activeDashboardTab === 'assessments' ? (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-white">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-2xl">
                <FileCheck size={24} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">CLASSROOM EVALUATION ENGINE</span>
                <h3 className="text-xl font-display font-bold">ASSESSMENTS & TESTS</h3>
              </div>
            </div>

            <button
              onClick={() => setShowAssessmentBuilder(true)}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <FileCheck size={16} /> BUILD NEW ASSESSMENT
            </button>
          </div>

          <div className="p-8 text-center bg-slate-950 border border-dashed border-slate-800 rounded-2xl space-y-2">
            <FileCheck size={36} className="mx-auto text-emerald-500/50" />
            <h4 className="font-bold text-white text-base">Assessment Builder Ready</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">Create custom curriculum tests with multiple choice, short answers, word problems, and auto-generated post-test analytics.</p>
          </div>
        </div>
      ) : activeDashboardTab === 'google_classroom' ? (
        <GoogleClassroomSection
          teacherId={resolvedId}
          teacherEmail={resolvedEmail}
          teacherName={resolvedName}
        />
      ) : activeDashboardTab === 'school_admin' ? (
        <SchoolAdminSection
          currentTeacher={{ id: resolvedId, teacher_name: resolvedName, email: resolvedEmail }}
          students={students}
        />
      ) : (
        /* TAB: Class Login Code and Student Join Approvals */
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

            {/* Class pitch Chalkboard & Homework Publisher */}
            <div className="bg-clean-white border border-deep-navy border-4 rounded-3xl p-6 space-y-4 text-left shadow-lg">
              <div className="space-y-1">
                <h3 className="text-sm font-black uppercase text-deep-navy flex items-center gap-2">
                  <Pencil size={18} className="text-pink-500 animate-pulse" />
                  pitch Chalkboard Publisher
                </h3>
                <p className="text-[11px] text-slate-600 font-bold leading-relaxed">
                  Only you (the teacher) can post to the Class pitch chalkboard. Broadcast active math topics, words to learn, and custom research assignments!
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
                      placeholder="e.g. Research how ancient civilizations solved multiplication! Practice 5 times in the pitch."
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
                      PUBLISH TO CLASS pitch 🚀
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

      {/* Comprehensive Student Progress & Activity Inspector Modal */}
      {selectedStudentForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-clean-white border-4 border-deep-navy rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative my-8 text-left">
            {/* Close Button */}
            <button
              onClick={() => setSelectedStudentForDetails(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-all cursor-pointer border-2 border-deep-navy"
            >
              <X size={18} />
            </button>

            {/* Modal Title Header */}
            <div className="flex items-center gap-4 border-b border-deep-navy/20 pb-4">
              <div className="w-14 h-14 rounded-2xl bg-violet-600 flex items-center justify-center text-white shrink-0 font-black text-2xl border-2 border-deep-navy shadow">
                {selectedStudentForDetails.real_first_name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-deep-navy">
                    {selectedStudentForDetails.real_first_name}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 border border-cyan-300 text-cyan-800 font-mono text-xs font-bold">
                    @{selectedStudentForDetails.username}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  Student Progress & Detailed Activity Report (Live Synced)
                </p>
              </div>
            </div>

            {/* Metrics Overview Grid */}
            {(() => {
              const p = selectedStudentForDetails.school_math_progress || {
                highScore: 0,
                xp: 100,
                coins: 100,
                solved: 0,
                correctAnswers: 0,
                currentLevel: 1,
                streak: 0,
                completedTopics: []
              };
              const accuracy = p.solved > 0 ? Math.round((p.correctAnswers / p.solved) * 100) : 100;
              const completedList = p.completedTopics || [];
              const pendingLessons = LESSONS.filter(l => !completedList.includes(l.id));

              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-amber-50 border-2 border-amber-300 p-3.5 rounded-2xl text-center space-y-0.5">
                      <div className="text-[10px] font-black uppercase text-amber-700">Total XP</div>
                      <div className="text-xl font-black text-amber-600">{p.xp} XP</div>
                    </div>
                    <div className="bg-violet-50 border-2 border-violet-300 p-3.5 rounded-2xl text-center space-y-0.5">
                      <div className="text-[10px] font-black uppercase text-violet-700">Level</div>
                      <div className="text-xl font-black text-violet-600">Lvl {p.currentLevel}</div>
                    </div>
                    <div className="bg-emerald-50 border-2 border-emerald-300 p-3.5 rounded-2xl text-center space-y-0.5">
                      <div className="text-[10px] font-black uppercase text-emerald-700">Accuracy</div>
                      <div className="text-xl font-black text-emerald-600">{accuracy}%</div>
                    </div>
                    <div className="bg-rose-50 border-2 border-rose-300 p-3.5 rounded-2xl text-center space-y-0.5">
                      <div className="text-[10px] font-black uppercase text-rose-700">High Score</div>
                      <div className="text-xl font-black text-rose-600">{p.highScore}</div>
                    </div>
                  </div>

                  {/* Solved vs Attempted Breakdown */}
                  <div className="bg-slate-50 border-2 border-deep-navy/20 rounded-2xl p-4 space-y-3">
                    <h4 className="text-xs font-black uppercase text-deep-navy tracking-wider flex items-center gap-2">
                      <Activity size={15} className="text-indigo-600" />
                      Math Equations Performance Breakdown
                    </h4>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-500 block uppercase font-mono">Total Attempted</span>
                        <span className="text-base font-black text-deep-navy">{p.solved}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-500 block uppercase font-mono">Correct Answers</span>
                        <span className="text-base font-black text-emerald-600">{p.correctAnswers}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-500 block uppercase font-mono">Current Streak</span>
                        <span className="text-base font-black text-orange-500">{p.streak} 🔥</span>
                      </div>
                    </div>
                  </div>

                  {/* Completed Curriculum Topics */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase text-deep-navy tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <CheckCircle size={15} className="text-emerald-500" />
                        Completed Lessons ({completedList.length} / {LESSONS.length})
                      </span>
                    </h4>
                    {completedList.length === 0 ? (
                      <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-slate-200">
                        Student hasn't completed any curriculum lessons yet. They can complete lessons in the Learning Hub!
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {completedList.map(lessonId => {
                          const matched = LESSONS.find(l => l.id === lessonId);
                          return (
                            <span key={lessonId} className="px-2.5 py-1 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1">
                              <Check size={12} /> {matched ? matched.title : `Lesson #${lessonId}`}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Recommendations / What They Need */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase text-deep-navy tracking-wider flex items-center gap-2">
                      <GraduationCap size={15} className="text-violet-600" />
                      Recommended Next Focus Areas
                    </h4>
                    <div className="space-y-2">
                      {pendingLessons.slice(0, 3).map(lesson => (
                        <div key={lesson.id} className="p-3 bg-violet-50/60 border border-violet-200 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="text-xs font-black text-deep-navy block">{lesson.title}</span>
                            <span className="text-[11px] text-slate-600 font-medium">{lesson.description}</span>
                          </div>
                          <span className="px-2 py-0.5 bg-violet-200 text-violet-800 text-[10px] font-black uppercase rounded shrink-0 font-mono ml-2">
                            {lesson.category}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Diagnostic Summary for Teacher */}
                  <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-1">
                    <span className="text-[11px] font-black uppercase text-amber-800 block">Teacher Diagnostic Note</span>
                    <p className="text-xs text-amber-900 font-medium leading-relaxed">
                      {accuracy < 50 && p.solved > 10
                        ? `⚠️ ${selectedStudentForDetails.real_first_name} has an accuracy rate of ${accuracy}%. They may benefit from practice on ${pendingLessons[0]?.title || 'basic arithmetic'} or extra chalkboard encouragement.`
                        : `🌟 ${selectedStudentForDetails.real_first_name} is performing well with a ${accuracy}% accuracy rate! They are ready to tackle ${pendingLessons[0]?.title || 'advanced challenges'}.`}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Footer Close Button */}
            <div className="pt-2">
              <button
                onClick={() => setSelectedStudentForDetails(null)}
                className="w-full py-3 bg-deep-navy hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow"
              >
                Close Inspector
              </button>
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
      {/* Bulk CSV Student Import Modal */}
      <BulkStudentImportModal
        isOpen={showBulkImport}
        onClose={() => setShowBulkImport(false)}
        teacherId={resolvedId}
        onRefreshRoster={() => {}}
      />

      {/* Printable Student Login Cards Modal */}
      <StudentLoginCardsModal
        isOpen={showLoginCards}
        onClose={() => setShowLoginCards(false)}
        students={students}
        className={className || "Year 5A"}
        temporaryPins={temporarySessionPins}
        onResetStudentPin={handleOpenResetModal}
      />

      {/* Teacher Credential Reset Modal */}
      {resetModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 md:p-8 max-w-md w-full text-white shadow-2xl relative space-y-5">
            <button
              onClick={() => {
                setResetModalStudent(null);
                setResetSuccessData(null);
                setResetError(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-3 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-2xl">
                <Key size={24} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">STUDENT CREDENTIAL RECOVERY</span>
                <h3 className="text-xl font-display font-bold">Reset Student PIN</h3>
              </div>
            </div>

            {!resetSuccessData ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Student Name:</span>
                    <strong className="text-white uppercase">{resetModalStudent.real_first_name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Username:</span>
                    <strong className="text-amber-400 font-mono">@{resetModalStudent.username}</strong>
                  </div>
                </div>

                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-300 text-[11px] leading-relaxed">
                  🛡️ <strong>Zero-Plaintext Policy:</strong> In compliance with COPPA/FERPA student privacy standards, past passwords cannot be viewed. Generating a new temporary PIN will immediately invalidate any previous credential.
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                    New Temporary PIN / Password
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={resetCustomPin}
                      onChange={(e) => setResetCustomPin(e.target.value)}
                      placeholder="e.g. rock782"
                      className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-amber-400 font-mono font-bold text-sm focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => setResetCustomPin('rock' + Math.floor(100 + Math.random() * 900))}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs shrink-0 cursor-pointer"
                      title="Generate random PIN"
                    >
                      Randomize
                    </button>
                  </div>
                </div>

                {resetError && (
                  <div className="p-3 bg-rose-500/20 border border-rose-500 text-rose-300 rounded-xl font-bold">
                    {resetError}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setResetModalStudent(null)}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold uppercase tracking-wider text-xs rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmResetPassword}
                    disabled={isResetting}
                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wider text-xs rounded-xl cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
                  >
                    {isResetting ? "Updating..." : "Generate New PIN"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-5 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-2xl space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                    Credential Reset Successful
                  </span>
                  
                  <div className="space-y-1 font-mono text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-sans text-xs">Student:</span>
                      <strong className="text-white font-bold">@{resetSuccessData.username}</strong>
                    </div>
                    <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800 mt-2">
                      <span className="text-slate-400 font-sans text-xs">New Access PIN:</span>
                      <strong className="text-amber-400 text-lg font-black tracking-widest">{resetSuccessData.pin}</strong>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  📢 Give this new PIN directly to the student. The security audit log has recorded the credential update.
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`Username: @${resetSuccessData.username}\nPIN: ${resetSuccessData.pin}`);
                      setCopiedPin(true);
                      setTimeout(() => setCopiedPin(false), 2000);
                    }}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold uppercase text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Copy size={14} /> {copiedPin ? "Copied to Clipboard!" : "Copy PIN Details"}
                  </button>
                  <button
                    onClick={() => {
                      setResetModalStudent(null);
                      setResetSuccessData(null);
                    }}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase text-xs rounded-xl cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Live Student Help Center Drawer */}
      <StudentHelpCenterDrawer
        teacherId={resolvedId}
      />

      {/* Student Journey Replay Modal */}
      {selectedStudentForJourney && (
        <StudentJourneyReplay
          student={selectedStudentForJourney}
          onClose={() => setSelectedStudentForJourney(null)}
        />
      )}

      {/* Parent Report Printable Modal */}
      {selectedStudentForParentReport && (
        <ParentReportModal
          isOpen={!!selectedStudentForParentReport}
          onClose={() => setSelectedStudentForParentReport(null)}
          student={selectedStudentForParentReport}
          className={className || "Year 5A"}
        />
      )}

      {/* Assessment Builder Modal */}
      <AssessmentBuilderModal
        isOpen={showAssessmentBuilder}
        onClose={() => setShowAssessmentBuilder(false)}
        teacherId={resolvedId}
        classId="c1"
        onAssignAssessment={(assessment) => {
          console.log("Assessment assigned:", assessment);
          setShowAssessmentBuilder(false);
        }}
      />

      {/* Itch.io Embed */}
      <div className="flex justify-center mt-4 mb-0 w-full">
         <iframe frameBorder="0" src="https://itch.io/embed/4792376?linkback=true" width="552" height="167" className="rounded-xl shadow-xl max-w-full"><a href="https://jesse-otobo.itch.io/httpsjesse-math-rockstar-appvercelapp">Jesse mathstriker by Jesse otobo</a></iframe>
      </div>
    </div>
  );
}
