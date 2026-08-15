import React, { useState } from 'react';

export default function ReviewSection() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [rating, setRating] = useState("5");
  const [userName, setUserName] = useState("");
  const [reviewText, setReviewText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const currentDate = new Date().toISOString().split('T')[0];

    const schemaData = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Jesse Math Rockstar",
      "operatingSystem": "Web, Android, iOS, Windows, macOS",
      "applicationCategory": "EducationalApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "review": {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": userName
        },
        "datePublished": currentDate,
        "reviewBody": reviewText,
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": rating,
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
        <h3 className="text-2xl sm:text-3xl font-display font-black text-white mb-2 tracking-tight">Leave a Review</h3>
        <p className="text-slate-400 text-sm mb-6">Your feedback helps us improve and shows others why Jesse Math Rockstar is a 5-star educational experience.</p>
        
        {isSubmitted ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Thank you!</h4>
            <p className="text-emerald-400 font-medium">Your review has been submitted for Google indexing.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="userName" className="block text-sm font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Your Name</label>
              <input
                type="text"
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                placeholder="e.g. Alex Smith"
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>
            
            <div>
              <label htmlFor="userRating" className="block text-sm font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Rating (1-5 Stars)</label>
              <select
                id="userRating"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                required
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none"
                
              >
                <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                <option value="4">⭐⭐⭐⭐ (4)</option>
                <option value="3">⭐⭐⭐ (3)</option>
                <option value="2">⭐⭐ (2)</option>
                <option value="1">⭐ (1)</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="reviewText" className="block text-sm font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Your Review</label>
              <textarea
                id="reviewText"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                required
                placeholder="Great educational app!"
                rows={4}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all resize-none"
              ></textarea>
            </div>
            
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-900/50 border border-emerald-400/20 transition-all active:scale-95"
            >
              Submit Review
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
