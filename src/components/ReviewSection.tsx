import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Star, 
  Sparkles, 
  UserCheck, 
  HeartHandshake, 
  CheckCircle2, 
  MessageSquare, 
  Award,
  Info,
  Loader2,
  Send,
  HelpCircle
} from 'lucide-react';
import { 
  ReviewItem, 
  subscribeToReviews, 
  submitUserReview, 
  updateStructuredDataLDJSON 
} from '../lib/reviewsDb';

interface ReviewSectionProps {
  userRole?: 'student' | 'kid' | 'individual' | 'teacher' | 'parent' | 'guest' | string;
  userId?: string;
  username?: string;
  stats?: {
    level: number;
    streak: number;
    correctAnswers: number;
    totalSolved: number;
    xp?: number;
  };
}

export default function ReviewSection({
  userRole = 'student',
  userId = '',
  username = 'Guest',
  stats
}: ReviewSectionProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [showVerifiedTooltip, setShowVerifiedTooltip] = useState(false);

  // Form State
  const [reviewerName, setReviewerName] = useState(username !== 'Guest' ? username : '');
  const [roleType, setRoleType] = useState<string>(
    userRole === 'teacher' ? 'Teacher / Educator' :
    userRole === 'parent' ? 'Parent / Guardian' :
    userRole === 'individual' ? 'Independent Math Player' : 'Student Player'
  );
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Filter state
  const [activeFilter, setActiveFilter] = useState<'all' | 'verified' | '5star'>('all');

  const normalizedRole = (userRole || 'student').toLowerCase();
  const isGuestStudentOrIndividual = ['guest', 'student', 'kid', 'individual'].includes(normalizedRole);

  // Real-time Firestore subscription
  useEffect(() => {
    const unsubscribe = subscribeToReviews((fetchedReviews) => {
      setReviews(fetchedReviews);
      setLoading(false);
      updateStructuredDataLDJSON(fetchedReviews);
    });

    return () => unsubscribe();
  }, []);

  // Sync default username if changed
  useEffect(() => {
    if (username && username !== 'Guest' && !reviewerName) {
      setReviewerName(username);
    }
  }, [username]);

  // Real Aggregate Computations directly from DB reviews
  const totalReviews = reviews.length;
  const ratingCount = totalReviews;
  const reviewCount = reviews.filter(r => r.reviewText && r.reviewText.trim().length > 0).length;

  const sumRating = reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
  const realAverageRating = totalReviews > 0 ? (sumRating / totalReviews).toFixed(1) : "5.0";

  // Distribution calculations
  const count5 = reviews.filter(r => Math.round(r.rating) === 5).length;
  const count4 = reviews.filter(r => Math.round(r.rating) === 4).length;
  const count3 = reviews.filter(r => Math.round(r.rating) === 3).length;
  const count2 = reviews.filter(r => Math.round(r.rating) === 2).length;
  const count1 = reviews.filter(r => Math.round(r.rating) === 1).length;

  const pct5 = totalReviews > 0 ? Math.round((count5 / totalReviews) * 100) : 100;
  const pct4 = totalReviews > 0 ? Math.round((count4 / totalReviews) * 100) : 0;
  const pct3 = totalReviews > 0 ? Math.round((count3 / totalReviews) * 100) : 0;
  const pct2 = totalReviews > 0 ? Math.round((count2 / totalReviews) * 100) : 0;
  const pct1 = totalReviews > 0 ? Math.round((count1 / totalReviews) * 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!reviewerName.trim()) {
      setFormError('Please enter your name or display nickname.');
      return;
    }

    if (!reviewText.trim() || reviewText.trim().length < 5) {
      setFormError('Please write a review with at least 5 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await submitUserReview(
        {
          userId: userId || `user_${Date.now()}`,
          displayName: reviewerName.trim(),
          rating,
          reviewText: reviewText.trim(),
          role: roleType
        },
        stats
      );

      setSubmitting(false);
      setSubmittedSuccess(true);
      setReviewText('');
    } catch (err) {
      console.error('Failed to submit review:', err);
      setFormError('Failed to save review. Please check your network connection.');
      setSubmitting(false);
    }
  };

  // Filtered reviews list
  const filteredReviews = reviews.filter(r => {
    if (activeFilter === 'verified') return r.verifiedPlayer;
    if (activeFilter === '5star') return Math.round(r.rating) === 5;
    return true;
  });

  return (
    <section className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 sm:p-8 mt-12 shadow-2xl relative overflow-hidden">
      {/* Background glow overlay */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider rounded-full inline-flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-amber-400" /> Genuine User Feedback
              </span>
              <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold rounded-full inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Real Platform Reviews
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white flex items-center gap-2">
              User Reviews & Ratings <Sparkles className="w-6 h-6 text-yellow-400" />
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
              Read authentic feedback from real players, parents, teachers, and school administrators using Jesse Math Rockstar.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 shrink-0 shadow-lg">
            <div className="text-center">
              <div className="text-3xl font-black text-amber-400 font-display tracking-tight flex items-center justify-center gap-1">
                {realAverageRating} <span className="text-lg text-amber-400">★</span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Average Rating</p>
            </div>
            <div className="h-10 w-px bg-slate-800" />
            <div className="text-center">
              <div className="text-2xl font-black text-white font-display">
                {totalReviews}
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Total Ratings</p>
            </div>
          </div>
        </div>

        {/* Real Rating Breakdown & Aggregate Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-950/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-inner">
          {/* Column 1: Overall Average */}
          <div className="flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-slate-800">
            <div className="text-5xl font-black text-white font-display tracking-tight mb-2">
              {realAverageRating}
            </div>
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className={`w-5 h-5 ${star <= Math.round(Number(realAverageRating)) ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} 
                />
              ))}
            </div>
            <p className="text-xs font-bold text-slate-300">
              Based on <strong className="text-white">{ratingCount}</strong> genuine rating{ratingCount === 1 ? '' : 's'} and <strong className="text-white">{reviewCount}</strong> review{reviewCount === 1 ? '' : 's'}
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-2">
              Calculated dynamically from real database records.
            </p>
          </div>

          {/* Column 2: Star Rating Distribution Bar */}
          <div className="space-y-2 p-2 justify-center flex flex-col">
            {[
              { label: '5 Stars', pct: pct5, count: count5 },
              { label: '4 Stars', pct: pct4, count: count4 },
              { label: '3 Stars', pct: pct3, count: count3 },
              { label: '2 Stars', pct: pct2, count: count2 },
              { label: '1 Star', pct: pct1, count: count1 }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs">
                <span className="w-12 text-slate-400 font-bold shrink-0 text-right">{item.label}</span>
                <div className="flex-1 h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-400 transition-all duration-500 rounded-full"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
                <span className="w-10 text-slate-400 font-semibold text-right">{item.pct}%</span>
              </div>
            ))}
          </div>

          {/* Column 3: Verification Standard Notice */}
          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800/80 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">
                <UserCheck className="w-4 h-4" /> “✓ Verified Player” Badge
              </div>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                Reviews displaying the <span className="inline-flex items-center px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[11px] font-black border border-emerald-500/30">✓ Verified Player</span> badge are confirmed by Jesse Math Rockstar after validating recorded math gameplay activity in our database.
              </p>
            </div>
            <div className="text-[10px] text-slate-500 font-medium border-t border-slate-800 pt-2 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Verified Player status indicates confirmed math practice on the app. Google does not endorse or verify individual platform reviews.</span>
            </div>
          </div>
        </div>

        {/* REVIEW SUBMISSION FORM - Only visible to Teachers, Parents, and Administrators */}
        {!isGuestStudentOrIndividual && (
          <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5 flex-wrap gap-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-400" /> Leave a Genuine Review & Rating
              </h3>
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" /> Share your experience with the community
              </span>
            </div>

            {submittedSuccess ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 text-center animate-in fade-in duration-300 space-y-3">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                  <HeartHandshake className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-bold text-white">Thank You for Your Review!</h4>
                <p className="text-xs text-emerald-400 font-medium max-w-md mx-auto">
                  Your feedback has been saved to the database. Verified Player status was determined based on your recorded math activity.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmittedSuccess(false)}
                  className="mt-2 text-xs font-bold text-slate-300 hover:text-white underline cursor-pointer"
                >
                  Submit another review or rating
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {formError && (
                  <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold p-3 rounded-xl">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Your Name / Display Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      required
                      placeholder="e.g. Alex M. or Mrs. Jenkins"
                      maxLength={100}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:ring-2 focus:ring-amber-400 text-sm"
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Role / Category
                    </label>
                    <select
                      value={roleType}
                      onChange={(e) => setRoleType(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-amber-400 text-sm"
                    >
                      <option value="Student Player">Student Player</option>
                      <option value="Teacher / Educator">Teacher / Educator</option>
                      <option value="Parent / Guardian">Parent / Guardian</option>
                      <option value="School Administrator">School Administrator</option>
                      <option value="Individual Math Player">Individual Math Player</option>
                    </select>
                  </div>

                  {/* Star Rating Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Rating (1 to 5 Stars)
                    </label>
                    <div className="flex items-center gap-1.5 pt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setRating(s)}
                          className="p-1 hover:scale-110 transition-transform cursor-pointer"
                          title={`${s} Star${s > 1 ? 's' : ''}`}
                        >
                          <Star 
                            className={`w-7 h-7 ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} 
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-amber-400 ml-2">{rating}/5</span>
                    </div>
                  </div>
                </div>

                {/* Review Text */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Your Written Review / Feedback <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    required
                    rows={3}
                    maxLength={2000}
                    placeholder="Share how Jesse Math Rockstar helped you or your students practice math..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-amber-400 text-sm resize-none"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Verified Player status will be assigned automatically based on recorded math practice history.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Verifying & Saving...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Submit Review
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* PUBLIC REVIEWS LIST */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Public Reviews ({filteredReviews.length})
            </h3>

            {/* Filter buttons */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium mr-1">Filter:</span>
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${activeFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                All ({reviews.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('verified')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${activeFilter === 'verified' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                Verified Only ({reviews.filter(r => r.verifiedPlayer).length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('5star')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${activeFilter === '5star' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                5★ Only ({count5})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-amber-400" /> Loading real reviews from database...
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
              <MessageSquare className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-base font-bold text-white">No reviews found for this filter</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Be the first player, educator, or parent to submit a review for Jesse Math Rockstar!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReviews.map((rev) => {
                const dateFormatted = rev.createdAt 
                  ? new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : 'Recent';

                return (
                  <div 
                    key={rev.id || `${rev.userId}-${rev.createdAt}`}
                    className="bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 p-5 rounded-2xl flex flex-col justify-between space-y-3 transition-colors shadow-md"
                  >
                    <div>
                      {/* Top Row: Author Name, Role, Verified Badge */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-sm text-white">{rev.displayName}</h4>
                            {rev.role && (
                              <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 font-semibold rounded-md border border-slate-700">
                                {rev.role}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 font-medium mt-0.5">{dateFormatted}</p>
                        </div>

                        {rev.verifiedPlayer && (
                          <div 
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-black rounded-full shrink-0 shadow-sm"
                            title="Jesse Math Rockstar verified this reviewer played math challenges"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> ✓ Verified Player
                          </div>
                        )}
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-1 my-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star 
                            key={s} 
                            className={`w-4 h-4 ${s <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-800'}`} 
                          />
                        ))}
                        <span className="text-xs font-bold text-amber-400 ml-1">{rev.rating}/5</span>
                      </div>

                      {/* Review Text */}
                      <p className="text-xs text-slate-300 font-normal leading-relaxed whitespace-pre-line">
                        "{rev.reviewText}"
                      </p>
                    </div>

                    {/* Bottom row info */}
                    <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                      <span>{rev.verifiedPlayer ? 'Confirmed Gameplay' : 'Registered Reviewer'}</span>
                      <span className="text-slate-600">Jesse Math Rockstar</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Structured Data dynamically exported as Google SoftwareApplication Schema JSON-LD.</span>
          </div>
          <span className="text-slate-500">Google Rich Results Compliant</span>
        </div>

      </div>
    </section>
  );
}
