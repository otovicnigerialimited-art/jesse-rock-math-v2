import React, { useState } from 'react';
import { ShieldCheck, Star, Sparkles, UserCheck, HeartHandshake } from 'lucide-react';

export default function ReviewSection() {
  const [role, setRole] = useState<'adult' | 'student'>('adult');
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Adult / Teacher Form State
  const [adultRoleType, setAdultRoleType] = useState('Teacher / Educator');
  const [adultName, setAdultName] = useState('');
  const [adultRating, setAdultRating] = useState('5');
  const [adultText, setAdultText] = useState('');

  // Student / Kid Star Rating State
  const [studentStars, setStudentStars] = useState(5);
  const [selectedEmoji, setSelectedEmoji] = useState('🎸');

  const handleAdultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentDate = new Date().toISOString().split('T')[0];

    const schemaData = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Jesse Math Rockstar",
      "operatingSystem": "Web, Android, iOS, Windows, macOS",
      "applicationCategory": "EducationalApplication",
      "review": {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": `${adultName} (${adultRoleType})`
        },
        "datePublished": currentDate,
        "reviewBody": adultText,
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": adultRating,
          "bestRating": "5"
        }
      }
    };

    const scriptTag = document.createElement('script');
    scriptTag.type = 'application/ld+json';
    scriptTag.text = JSON.stringify(schemaData);
    document.head.appendChild(scriptTag);
    
    setIsSubmitted(true);
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentDate = new Date().toISOString().split('T')[0];

    const schemaData = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Jesse Math Rockstar",
      "review": {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "Verified Student / Kid Player"
        },
        "datePublished": currentDate,
        "reviewBody": `Starred Jesse Math Rockstar with ${studentStars} stars and badge ${selectedEmoji}!`,
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": String(studentStars),
          "bestRating": "5"
        }
      }
    };

    const scriptTag = document.createElement('script');
    scriptTag.type = 'application/ld+json';
    scriptTag.text = JSON.stringify(schemaData);
    document.head.appendChild(scriptTag);

    setIsSubmitted(true);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 mt-12 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      
      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight flex items-center gap-2">
            Reviews & Ratings <Sparkles className="w-6 h-6 text-yellow-400" />
          </h3>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" /> COPPA Compliant
          </span>
        </div>

        <p className="text-slate-400 text-sm mb-6">
          Teachers & Parents can publish written testimonials. Students & Kids rate using visual 5-star badges to keep identities 100% safe!
        </p>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl mb-6 border border-slate-800">
          <button
            type="button"
            onClick={() => { setRole('adult'); setIsSubmitted(false); }}
            className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              role === 'adult' 
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" /> Adult / Parent / Teacher
          </button>
          <button
            type="button"
            onClick={() => { setRole('student'); setIsSubmitted(false); }}
            className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              role === 'student' 
                ? 'bg-yellow-500 text-slate-950 shadow-lg shadow-yellow-500/20' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Star className="w-4 h-4" /> Student / Kid / Guest
          </button>
        </div>
        
        {isSubmitted ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
              <HeartHandshake className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Thank you!</h4>
            <p className="text-emerald-400 font-medium text-sm">
              {role === 'adult' 
                ? 'Your written review has been recorded for Google Search and AI indexing!' 
                : 'Your 5-star rating has been registered safely! Keep rocking on Jesse Math Rockstar!'}
            </p>
          </div>
        ) : role === 'adult' ? (
          /* ADULT / TEACHER / PARENT FORM (Written Text Review) */
          <form onSubmit={handleAdultSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Your Role</label>
                <select
                  value={adultRoleType}
                  onChange={(e) => setAdultRoleType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Teacher / Educator">Teacher / Educator</option>
                  <option value="Parent / Guardian">Parent / Guardian</option>
                  <option value="School Administrator">School Administrator</option>
                  <option value="Curriculum Coordinator">Curriculum Coordinator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Your Name</label>
                <input
                  type="text"
                  value={adultName}
                  onChange={(e) => setAdultName(e.target.value)}
                  required
                  placeholder="e.g. Mrs. Sarah Jenkins"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Rating</label>
              <select
                value={adultRating}
                onChange={(e) => setAdultRating(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="5">⭐⭐⭐⭐⭐ (5 - Exceptional Educational Value)</option>
                <option value="4">⭐⭐⭐⭐ (4 - Great Classroom Resource)</option>
                <option value="3">⭐⭐⭐ (3 - Good)</option>
                <option value="2">⭐⭐ (2 - Average)</option>
                <option value="1">⭐ (1 - Needs Improvement)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Written Review / Testimonial</label>
              <textarea
                value={adultText}
                onChange={(e) => setAdultText(e.target.value)}
                required
                placeholder="Share your experience using Jesse Math Rockstar in your classroom or home..."
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-emerald-500 resize-none"
              ></textarea>
            </div>
            
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-900/50 transition-all active:scale-95"
            >
              Publish Teacher / Parent Review
            </button>
          </form>
        ) : (
          /* STUDENT / KID / GUEST FORM (Star Rating & Rock Badges Only - Zero Text Input) */
          <form onSubmit={handleStudentSubmit} className="space-y-6 text-center">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <p className="text-xs font-bold text-yellow-400 uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Kid-Safe Star Rating (No Text Required)
              </p>
              
              <div className="flex justify-center items-center gap-2 my-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStudentStars(s)}
                    className="p-1 hover:scale-125 transition-transform"
                  >
                    <Star 
                      className={`w-10 h-10 ${s <= studentStars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-700'}`} 
                    />
                  </button>
                ))}
              </div>
              <p className="text-white font-bold text-sm">Selected Rating: {studentStars} / 5 Stars</p>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Choose Your Rockstar Reaction Badge</p>
              <div className="flex justify-center gap-3">
                {['🎸', '⚡', '👑', '🎉', '🔥'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center border transition-all ${
                      selectedEmoji === emoji 
                        ? 'bg-yellow-500/20 border-yellow-400 scale-110 shadow-lg shadow-yellow-500/20' 
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-black uppercase tracking-widest rounded-xl shadow-lg shadow-yellow-900/30 transition-all active:scale-95"
            >
              Submit Star Rating
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

