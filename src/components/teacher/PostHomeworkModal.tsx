import React, { useState } from 'react';
import { X, Send, BookOpen, AlertCircle } from 'lucide-react';
import { postHomework } from '../../lib/homeworkDb';

interface PostHomeworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherId: string;
  classCode: string;
}

export default function PostHomeworkModal({ isOpen, onClose, teacherId, classCode }: PostHomeworkModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [type, setType] = useState('arena');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !dueDate) {
      setError('Please fill out all fields.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await postHomework({
        title: title.trim(),
        description: description.trim(),
        dueDate,
        type,
        teacherId,
        classCode
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setTitle('');
        setDescription('');
        setDueDate('');
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to post homework');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-emerald-50">
          <h2 className="text-lg font-bold text-emerald-800 flex items-center gap-2">
            <BookOpen size={18} />
            Post Homework
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-emerald-100 rounded-full text-emerald-700 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-4">
                <Send size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Assignment Posted!</h3>
              <p className="text-slate-500 text-sm">Your students will receive a push notification instantly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Assignment Title</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Weekend SATs Prep"
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Description / Instructions</label>
                <textarea 
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Tell your students exactly what to do..."
                  rows={3}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Activity Type</label>
                  <select 
                    value={type}
                    onChange={e => setType(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none"
                  >
                    <option value="arena">Math Pitch</option>
                    <option value="sats">SATs Prep</option>
                    <option value="quiz">Speed Quiz</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Due Date</label>
                  <input 
                    type="date" 
                    required
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold uppercase tracking-wider text-sm transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="animate-pulse">Posting...</span>
                ) : (
                  <>
                    <Send size={16} />
                    Send to Students
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
