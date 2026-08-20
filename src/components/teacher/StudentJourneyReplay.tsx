import React, { useState, useEffect } from 'react';
import { History, Play, Calendar, TrendingUp, AlertTriangle, CheckCircle, Award, BookOpen, Clock, Filter, X } from 'lucide-react';
import { StudentJourneyEvent, fetchStudentJourney } from '../../lib/advancedSchoolDb';
import { SchoolStudent } from '../../lib/schoolDb';

interface StudentJourneyReplayProps {
  student: SchoolStudent | null;
  onClose: () => void;
}

export default function StudentJourneyReplay({ student, onClose }: StudentJourneyReplayProps) {
  const [journeyEvents, setJourneyEvents] = useState<StudentJourneyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'all' | '7days' | '30days'>('all');

  useEffect(() => {
    if (!student) return;
    setLoading(true);

    fetchStudentJourney(student.id).then(events => {
      setJourneyEvents(events || []);
      setLoading(false);
    }).catch(err => {
      console.error("Failed to load student journey:", err);
      setJourneyEvents([]);
      setLoading(false);
    });
  }, [student]);

  if (!student) return null;

  const filteredEvents = journeyEvents.filter(ev => {
    if (dateRange === '7days') return Date.now() - ev.timestamp <= 7 * 24 * 3600 * 1000;
    if (dateRange === '30days') return Date.now() - ev.timestamp <= 30 * 24 * 3600 * 1000;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-2xl w-full text-white shadow-2xl relative max-h-[85vh] flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer">
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-3 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-2xl">
            <History size={24} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">STUDENT LEARNING JOURNEY REPLAY</span>
            <h3 className="text-xl font-display font-bold text-white">
              {student.real_first_name || student.username} <span className="text-slate-400">(@{student.username})</span>
            </h3>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center justify-between gap-2 py-3">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Filter size={14} className="text-amber-400" /> Filter Timeframe:
          </span>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setDateRange('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${dateRange === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              All Time
            </button>
            <button
              onClick={() => setDateRange('30days')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${dateRange === '30days' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setDateRange('7days')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${dateRange === '7days' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Last 7 Days
            </button>
          </div>
        </div>

        {/* Timeline body */}
        <div className="overflow-y-auto flex-1 pr-2 space-y-4 pt-2">
          {loading ? (
            <p className="text-center py-12 text-slate-400 text-xs">Loading learning journey timeline...</p>
          ) : filteredEvents.length === 0 ? (
            <p className="text-center py-12 text-slate-500 text-xs">No activity events recorded in selected range.</p>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {filteredEvents.map((ev, idx) => (
                <div key={ev.id || idx} className="relative group">
                  {/* Circle marker */}
                  <div className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] ${
                    ev.event_type === 'skill_mastered' ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold' :
                    ev.event_type === 'mistake_made' ? 'bg-rose-500 border-rose-400 text-white' :
                    ev.event_type === 'accuracy_boost' ? 'bg-amber-400 border-amber-300 text-slate-950 font-bold' :
                    'bg-slate-800 border-slate-600 text-slate-300'
                  }`}>
                    {idx + 1}
                  </div>

                  <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">{ev.topic} — {ev.skill}</span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock size={12} /> {new Date(ev.timestamp).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      {ev.event_type === 'skill_mastered' && <Award size={16} className="text-amber-400" />}
                      {ev.event_type === 'mistake_made' && <AlertTriangle size={16} className="text-rose-400" />}
                      {ev.event_type === 'accuracy_boost' && <TrendingUp size={16} className="text-emerald-400" />}
                      {ev.title}
                    </h4>

                    <p className="text-xs text-slate-300">{ev.description}</p>

                    {ev.old_accuracy !== undefined && ev.new_accuracy !== undefined && (
                      <div className="pt-2 flex items-center gap-3 text-xs font-bold">
                        <span className="text-rose-400 line-through">Previous: {ev.old_accuracy}%</span>
                        <span className="text-emerald-400">Current: {ev.new_accuracy}% (+{ev.new_accuracy - ev.old_accuracy}%)</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
