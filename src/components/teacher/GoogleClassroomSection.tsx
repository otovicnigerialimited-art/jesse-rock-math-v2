import React, { useState, useEffect } from 'react';
import { BookOpen, Users, CheckCircle, AlertCircle, RefreshCw, Sparkles, Send, ExternalLink, ShieldCheck, Check } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, addDoc, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { addStudentToTeacher } from '../../lib/schoolDb';

interface GoogleClassroomSectionProps {
  teacherId: string;
  teacherEmail: string;
  teacherName: string;
}

interface GCourse {
  id: string;
  name: string;
  section?: string;
  room?: string;
  alternateLink?: string;
}

interface GStudent {
  userId: string;
  profile: {
    id: string;
    name: {
      fullName: string;
      givenName: string;
      familyName: string;
    };
    emailAddress: string;
    photoUrl?: string;
  };
}

export default function GoogleClassroomSection({ teacherId, teacherEmail, teacherName }: GoogleClassroomSectionProps) {
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('gc_access_token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [courses, setCourses] = useState<GCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [courseStudents, setCourseStudents] = useState<GStudent[]>([]);
  const [importingStudents, setImportingStudents] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);

  // Assignment posting state
  const [assignmentTitle, setAssignmentTitle] = useState('Jesse Math Rockstar Challenge');
  const [assignmentDesc, setAssignmentDesc] = useState('Complete your daily math sprint on Jesse Math Rockstar and boost your classroom ranking!');
  const [postingAssignment, setPostingAssignment] = useState(false);

  // Initialize Google Token Client
  const handleConnectGoogleClassroom = () => {
    setError(null);
    setLoading(true);

    try {
      // @ts-ignore
      if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
        // Load GIS script dynamically if not present
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          initAndRequestToken();
        };
        script.onerror = () => {
          setError("Failed to load Google Identity Services. Please check your network connection.");
          setLoading(false);
        };
        document.head.appendChild(script);
      } else {
        initAndRequestToken();
      }
    } catch (err: any) {
      setError(err.message || "Failed to initialize Google sign-in.");
      setLoading(false);
    }
  };

  const initAndRequestToken = () => {
    try {
      // @ts-ignore
      const client = google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '483318254290-placeholder.apps.googleusercontent.com', // fallback or configured id
        scope: [
          'https://www.googleapis.com/auth/classroom.courses.readonly',
          'https://www.googleapis.com/auth/classroom.rosters.readonly',
          'https://www.googleapis.com/auth/classroom.coursework.students',
          'https://www.googleapis.com/auth/classroom.profile.emails',
          'https://www.googleapis.com/auth/classroom.profile.photos'
        ].join(' '),
        callback: (response: any) => {
          if (response.error) {
            setError(`Google Authorization Error: ${response.error}`);
            setLoading(false);
            return;
          }
          if (response.access_token) {
            setAccessToken(response.access_token);
            localStorage.setItem('gc_access_token', response.access_token);
            fetchCourses(response.access_token);
          } else {
            setError("No access token returned from Google.");
            setLoading(false);
          }
        },
      });
      client.requestAccessToken();
    } catch (e: any) {
      setError(e.message || "Error requesting Google Classroom permissions.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchCourses(accessToken);
    }
  }, [accessToken]);

  const fetchCourses = async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('https://classroom.googleapis.com/v1/courses?courseState=ACTIVE', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) {
        if (res.status === 401) {
          setAccessToken(null);
          localStorage.removeItem('gc_access_token');
          throw new Error("Session expired. Please reconnect Google Classroom.");
        }
        throw new Error(`Failed to fetch Google Classroom courses (HTTP ${res.status})`);
      }
      const data = await res.json();
      setCourses(data.courses || []);
    } catch (err: any) {
      setError(err.message || "Failed to load courses.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCourse = async (courseId: string) => {
    setSelectedCourseId(courseId);
    if (!courseId || !accessToken) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/students`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      if (!res.ok) {
        throw new Error("Failed to fetch students for this course.");
      }
      const data = await res.json();
      setCourseStudents(data.students || []);
    } catch (err: any) {
      setError(err.message || "Failed to load course students.");
    } finally {
      setLoading(false);
    }
  };

  const handleImportStudents = async () => {
    if (courseStudents.length === 0) return;
    setImportingStudents(true);
    setError(null);
    setSuccessMessage(null);

    let count = 0;
    try {
      for (const st of courseStudents) {
        const fullName = st.profile.name.fullName || 'Student';
        const email = st.profile.emailAddress || '';
        const username = email ? email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') : `student_${Math.floor(1000 + Math.random() * 9000)}`;
        const tempPin = 'rock' + Math.floor(100 + Math.random() * 900);

        try {
          await addStudentToTeacher(fullName, username, tempPin, teacherId);
          count++;
        } catch (e) {
          // Skip duplicates or errors gracefully
          console.warn("Could not import student:", fullName, e);
        }
      }
      setImportedCount(count);
      setSuccessMessage(`Successfully imported ${count} students into your Jesse Math Rockstar classroom roster!`);
    } catch (err: any) {
      setError(err.message || "Failed during student import.");
    } finally {
      setImportingStudents(false);
    }
  };

  const handlePostAssignment = async () => {
    if (!selectedCourseId || !accessToken) {
      setError("Please select a Google Classroom course first.");
      return;
    }
    setPostingAssignment(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const body = {
        title: assignmentTitle,
        description: assignmentDesc,
        workType: 'ASSIGNMENT',
        state: 'PUBLISHED',
        maxPoints: 100
      };

      const res = await fetch(`https://classroom.googleapis.com/v1/courses/${selectedCourseId}/courseWork`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        throw new Error("Failed to post assignment to Google Classroom.");
      }

      setSuccessMessage("Assignment successfully posted to your Google Classroom stream!");
    } catch (err: any) {
      setError(err.message || "Error posting assignment.");
    } finally {
      setPostingAssignment(false);
    }
  };

  const handleDisconnect = () => {
    setAccessToken(null);
    localStorage.removeItem('gc_access_token');
    setCourses([]);
    setCourseStudents([]);
    setSelectedCourseId('');
    setSuccessMessage("Disconnected from Google Classroom.");
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider">
              <Sparkles size={14} className="text-amber-300" /> Google Classroom Integration
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight font-display">Sync & Assign via Google Classroom</h2>
            <p className="text-blue-100 text-xs sm:text-sm max-w-xl font-medium">
              Seamlessly import your enrolled students into your Jesse Math Rockstar roster and push math challenges directly to your Google Classroom stream.
            </p>
          </div>
          {accessToken ? (
            <button
              onClick={handleDisconnect}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer backdrop-blur-md"
            >
              Disconnect Google
            </button>
          ) : (
            <button
              onClick={handleConnectGoogleClassroom}
              disabled={loading}
              className="px-6 py-3.5 bg-white text-blue-600 hover:bg-blue-50 font-black uppercase tracking-wider text-xs rounded-2xl shadow-lg transition-all flex items-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{loading ? "Connecting..." : "Connect Google Classroom"}</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-3 text-sm font-semibold">
          <AlertCircle size={20} className="text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-sm font-semibold">
          <CheckCircle size={20} className="text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {!accessToken ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-6 shadow-sm">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl mx-auto flex items-center justify-center shadow-inner">
            <BookOpen size={36} />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-lg font-black text-slate-900">Connect Your Educator Account</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Link your Google Classroom account to instantly load your courses, sync student rosters into Jesse Math Rockstar, and broadcast math assignments.
            </p>
          </div>
          <button
            onClick={handleConnectGoogleClassroom}
            disabled={loading}
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-wider text-xs rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2.5"
          >
            <ShieldCheck size={16} /> Connect Google Classroom Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Course Selector */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase text-slate-900 tracking-wider flex items-center gap-2">
                <BookOpen size={16} className="text-blue-600" /> Your Courses
              </h3>
              <button
                onClick={() => accessToken && fetchCourses(accessToken)}
                disabled={loading}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                title="Refresh Courses"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              </button>
            </div>

            {courses.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                No active Google Classroom courses found.
              </div>
            ) : (
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {courses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => handleSelectCourse(course.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1 ${
                      selectedCourseId === course.id
                        ? 'bg-blue-50 border-blue-300 shadow-sm ring-2 ring-blue-100'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-black text-xs text-slate-900 truncate">{course.name}</div>
                    {course.section && <div className="text-[11px] text-slate-500 font-medium">Section: {course.section}</div>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right/Center Column: Course Details, Students & Assignment Posting */}
          <div className="lg:col-span-2 space-y-6">
            {!selectedCourseId ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-sm h-full flex flex-col items-center justify-center min-h-[320px]">
                <Users size={32} className="text-slate-300" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select a course from the left to view students & sync roster</p>
              </div>
            ) : (
              <>
                {/* Students Roster Import Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-black uppercase text-slate-900 tracking-wider flex items-center gap-2">
                        <Users size={16} className="text-emerald-600" /> Enrolled Students ({courseStudents.length})
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium">Import Google Classroom students into your active Jesse Math Rockstar roster.</p>
                    </div>
                    <button
                      onClick={handleImportStudents}
                      disabled={importingStudents || courseStudents.length === 0}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                    >
                      <Check size={14} />
                      <span>{importingStudents ? "Importing Roster..." : "Import Students to Roster"}</span>
                    </button>
                  </div>

                  {courseStudents.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      No students found in this course.
                    </div>
                  ) : (
                    <div className="max-h-[220px] overflow-y-auto space-y-1.5 pr-1">
                      {courseStudents.map((st) => (
                        <div key={st.userId} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {st.profile.photoUrl ? (
                              <img src={st.profile.photoUrl} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-200" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center">
                                {st.profile.name.givenName?.[0] || 'S'}
                              </div>
                            )}
                            <div>
                              <div className="text-xs font-bold text-slate-900">{st.profile.name.fullName}</div>
                              <div className="text-[10px] text-slate-500">{st.profile.emailAddress || 'No email'}</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">Ready</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Broadcast Assignment Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
                  <h3 className="text-sm font-black uppercase text-slate-900 tracking-wider flex items-center gap-2">
                    <Send size={16} className="text-violet-600" /> Push Assignment to Google Classroom
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest block mb-1">Assignment Title</label>
                      <input
                        type="text"
                        value={assignmentTitle}
                        onChange={(e) => setAssignmentTitle(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-violet-500 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest block mb-1">Instructions / Description</label>
                      <textarea
                        rows={2}
                        value={assignmentDesc}
                        onChange={(e) => setAssignmentDesc(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-violet-500 focus:bg-white transition-all resize-none"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={handlePostAssignment}
                        disabled={postingAssignment}
                        className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                      >
                        <Send size={14} />
                        <span>{postingAssignment ? "Publishing..." : "Publish to Google Stream"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
