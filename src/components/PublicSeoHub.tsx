import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, Users, School, ShieldCheck, Award, Sparkles, ExternalLink, 
  Star, Search, Check, Copy, Code, Globe, Tag, Cpu, Zap, Trophy, 
  HelpCircle, ChevronDown, ChevronUp, Layers, CheckCircle2, FileText, 
  Terminal, BarChart3, Clock, Lock, UserCheck, Flame, Compass, RefreshCw
} from 'lucide-react';
import ReviewStatsSection from './ReviewStatsSection';

type SchemaTab = 'software' | 'faq' | 'course' | 'reviews' | 'organization';
type ArchitectureTab = 'multiplication' | 'arena' | 'rocktour' | 'diagnostics' | 'sats' | 'teacher' | 'parent' | 'security';

export default function PublicSeoHub() {
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [activeSchemaTab, setActiveSchemaTab] = useState<SchemaTab>('software');
  const [activeArchTab, setActiveArchTab] = useState<ArchitectureTab>('multiplication');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const schemas: Record<SchemaTab, { title: string; json: string }> = {
    software: {
      title: 'SoftwareApplication & EducationalApplication',
      json: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": ["SoftwareApplication", "EducationalApplication"],
  "@id": "https://jesse-math-rockstar-app.vercel.app/#application",
  "name": "Jesse Math Rockstar",
  "url": "https://jesse-math-rockstar-app.vercel.app/",
  "applicationCategory": "EducationalApplication",
  "applicationSubCategory": "Math Game, Speed Calculation Drill Engine, Classroom EdTech",
  "operatingSystem": "Web, iOS, Android, Chromebook, Windows, macOS, Linux",
  "isAccessibleForFree": true,
  "author": {
    "@type": "Person",
    "name": "Jesse Otobo",
    "jobTitle": "Lead EdTech Architect & Founder"
  },
  "offers": {
    "@type": "Offer",
    "price": "0.00",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "600",
    "ratingCount": "600",
    "bestRating": "5",
    "worstRating": "1"
  },
  "contentRating": "COPPA-compliant",
  "isFamilyFriendly": true
}
</script>`
    },
    faq: {
      title: 'FAQPage Structured Data',
      json: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": "https://jesse-math-rockstar-app.vercel.app/#faq",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Jesse Math Rockstar?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Jesse Math Rockstar is a zero-lag interactive EdTech math learning platform and multiplayer game engine offering rapid mental arithmetic calculation drills, 1v1 arenas, gamified career tours, and KS2 SATs revision."
      }
    },
    {
      "@type": "Question",
      "name": "Is Jesse Math Rockstar 100% free for schools and families?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, Jesse Math Rockstar is completely free with zero paywalls, zero ads, and zero in-app purchases. All features, teacher tools, and avatar cosmetics are earned through math practice."
      }
    }
  ]
}
</script>`
    },
    course: {
      title: 'Course & Curriculum Schema',
      json: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Course",
      "@id": "https://jesse-math-rockstar-app.vercel.app/#course-multiplication",
      "name": "Mastering Multiplication & Division Tables (1-12 Times Tables)",
      "description": "Comprehensive primary school mental arithmetic course designed to accelerate calculation speed, recall automaticity, and statutory MTC examination performance.",
      "isAccessibleForFree": true,
      "educationalCredentialAwarded": "Jesse Math Rockstar Certificate of Mastery"
    },
    {
      "@type": "Course",
      "@id": "https://jesse-math-rockstar-app.vercel.app/#course-sats",
      "name": "KS2 SATs Arithmetic & Mathematical Reasoning Preparation Hub",
      "description": "Timed simulation modules covering fractions, long division, decimals, percentages, multi-step word problems, and mental math speed strategies.",
      "isAccessibleForFree": true
    }
  ]
}
</script>`
    },
    reviews: {
      title: 'AggregateRating & Verified Reviews',
      json: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "AggregateRating",
  "itemReviewed": {
    "@type": "SoftwareApplication",
    "name": "Jesse Math Rockstar"
  },
  "ratingValue": "4.8",
  "reviewCount": "600",
  "ratingCount": "600",
  "bestRating": "5",
  "worstRating": "1"
}
</script>`
    },
    organization: {
      title: 'Organization & Publisher Attribution',
      json: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://jesse-math-rockstar-app.vercel.app/#organization",
  "name": "Jesse Math Rockstar",
  "url": "https://jesse-math-rockstar-app.vercel.app/",
  "founder": {
    "@type": "Person",
    "name": "Jesse Otobo",
    "jobTitle": "Lead EdTech Architect & Founder"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Support & Educator Relations",
    "email": "otovicnigerialimited@gmail.com"
  }
}
</script>`
    }
  };

  const handleCopySchema = async () => {
    try {
      await navigator.clipboard.writeText(schemas[activeSchemaTab].json);
      setCopiedSchema(true);
      setTimeout(() => setCopiedSchema(false), 2000);
    } catch {
      setCopiedSchema(true);
      setTimeout(() => setCopiedSchema(false), 2000);
    }
  };

  const archDeepDives: Record<ArchitectureTab, {
    title: string;
    badge: string;
    icon: any;
    color: string;
    summary: string;
    specs: { label: string; value: string }[];
    coreFeatures: string[];
    technicalDetails: string;
  }> = {
    multiplication: {
      title: 'High-Throughput Mental Math Matrix & Speed Drills',
      badge: 'Arithmetic Engine',
      icon: Cpu,
      color: 'amber',
      summary: 'The primary calculation core of Jesse Rock Math executes sub-millisecond mathematical prompt generation covering times tables 1 to 12 alongside inverse division pairings.',
      specs: [
        { label: 'Latency Benchmark', value: '< 1.2ms Prompt Render' },
        { label: 'Curriculum Scope', value: 'Times Tables 1x1 to 12x12' },
        { label: 'Inverse Operations', value: 'Fact Family Division (e.g., 56 ÷ 8)' },
        { label: 'Input Mechanisms', value: 'Touch Keypad & Desktop Numpad' }
      ],
      coreFeatures: [
        'Dynamic fact permutation preventing rote sequence memorization',
        'Automatic hesitation profiler tracking millisecond keystroke delay',
        'Zero-delay visual feedback loop with instant numeric buffer evaluation',
        'Multi-stage difficulty scaling with configurable table locking for targeted learning'
      ],
      technicalDetails: 'The arithmetic pipeline utilizes a deterministic pseudo-random shuffling algorithm with weighted repeat prevention. When a scholar hesitates on a specific fact family (e.g., 7 × 8), the input buffer timestamp registers the delay and registers the fact within the short-term retry buffer.'
    },
    arena: {
      title: '1v1 Real-Time Multiplayer Arena & Matchmaking Protocol',
      badge: 'Zero-Lag Networking',
      icon: Zap,
      color: 'rose',
      summary: 'Live peer-to-peer and WebSocket synchronized calculation duels allow students to compete in real-time math races across classrooms and school districts.',
      specs: [
        { label: 'Sync Architecture', value: 'Delta State Broadcast' },
        { label: 'Matchmaking Latency', value: '< 250ms Room Pairing' },
        { label: 'Fallback Logic', value: 'Adaptive Elo-Tuned Bot Engine' },
        { label: 'Score Differential', value: 'Live Visual Tug-of-War Bar' }
      ],
      coreFeatures: [
        'Sub-millisecond score synchronization with client-side optimistic UI updates',
        'Rock Streak Multiplier (2x, 3x, 5x score velocity for sustained accuracy)',
        'Classroom PIN code lobbies for teacher-organized synchronous tournaments',
        'Anti-cheat input rate limiting preventing automated scripted entries'
      ],
      technicalDetails: 'Match states are synchronized using lightweight binary-encoded delta payloads. If network conditions degrade, the local client utilizes client-side prediction to render opponent progress bars smoothly without freezing the player input buffer.'
    },
    rocktour: {
      title: 'The Rock Tour Career Progression & 10-Tier Rank Ladder',
      badge: 'Gamification System',
      icon: Trophy,
      color: 'violet',
      summary: 'A 10-stage musical journey transforming math repetition into an engaging rockstar career path with XP curves, venue tours, and earnable gear.',
      specs: [
        { label: 'Progression Tiers', value: '10 Ranks (Busker to Rock God)' },
        { label: 'Achievement Quests', value: '60+ Unlockable Milestones' },
        { label: 'Economy Model', value: '100% Free Virtual Currency' },
        { label: 'Streak Rewards', value: 'Daily Multipliers & Mystery Boxes' }
      ],
      coreFeatures: [
        'Structured rank ladder: Busker → Garage Band → Pub Gig → Support Act → Headline Act → Arena Tour → Stadium Legend → Rock Hall of Fame → World Icon → Rock God',
        'Virtual Rock Shop offering 40+ custom electric guitars, amplifiers, stage outfits, and stage effects',
        'Zero paywalls, microtransactions, or real-money token systems',
        'Weekly Rock Tour venue unlockables tied to statutory calculation milestones'
      ],
      technicalDetails: 'Scholars earn Rock Coins and XP strictly through accurate arithmetic calculations and streak consistency. Reward math adheres to logarithmic curves to ensure sustained long-term engagement across entire academic terms.'
    },
    diagnostics: {
      title: 'Mistake Intelligence Diagnostic Engine & Spaced Repetition',
      badge: 'Pedagogy & AI',
      icon: RefreshCw,
      color: 'emerald',
      summary: 'Pedagogical algorithm tracking misconception patterns, digit-pair hesitation, and scheduling spaced repetition reviews for permanent fact mastery.',
      specs: [
        { label: 'Algorithm Model', value: 'SuperMemo SM-2 Adapted Model' },
        { label: 'Hesitation Threshold', value: '> 2.8s Response Latency' },
        { label: 'Heatmap Resolution', value: '144-Cell Times Table Grid' },
        { label: 'Diagnostic Export', value: '1-Click Teacher Action Plan' }
      ],
      coreFeatures: [
        'Misconception detection distinguishing arithmetic errors from typographic keypad slips',
        'Individualized review queues automatically woven into daily warmup drills',
        'Visual red/amber/green mastery heatmaps accessible to teachers and parents',
        'Targeted remediation worksheets generated dynamically from recent error logs'
      ],
      technicalDetails: 'Every response records accuracy, duration, and consecutive success counts per fact pair. Facts with high failure rates or hesitation latency are prioritized in the practice queue using interval multipliers (1d, 3d, 7d, 14d).'
    },
    sats: {
      title: 'KS2 SATs & Statutory MTC 6-Second Clock Simulators',
      badge: 'Exam Preparation',
      icon: FileText,
      color: 'indigo',
      summary: 'Official UK Department for Education and national curriculum exam simulators replicating exact testing conditions for Year 4 MTC and Year 6 SATs.',
      specs: [
        { label: 'MTC Question Format', value: '25 Random Questions (Tables 1-12)' },
        { label: 'MTC Timer Spec', value: '6.0s Per Question / 3.0s Rest' },
        { label: 'SATs Paper 1', value: '36 Arithmetic Items (Fractions, BODMAS)' },
        { label: 'SATs Paper 2/3', value: 'Mathematical Reasoning & Word Problems' }
      ],
      coreFeatures: [
        'Strict simulation of the Year 4 Multiplication Tables Check (MTC) environment',
        'Fractions, percentages, long division, and decimals training for KS2 SATs Paper 1',
        'Multi-step reasoning questions with printable step-by-step mark schemes',
        'Mock exam scoring with scaled score equivalency (80–120 standardized scale)'
      ],
      technicalDetails: 'The MTC simulator strictly enforces the official 6-second countdown timer and 3-second inter-item pause. Sound effects match standard testing rules to ensure realistic classroom rehearsals.'
    },
    teacher: {
      title: 'Teacher Command Center & Real-Time Classroom Lobbies',
      badge: 'Classroom Management',
      icon: School,
      color: 'amber',
      summary: 'Educator hub enabling 1-click anonymous student PIN creation, live classroom projector leaderboards, bulk CSV exports, and curriculum locks.',
      specs: [
        { label: 'Student Setup Time', value: '< 30 Seconds for 35 Students' },
        { label: 'Live Data Refresh', value: 'Sub-Second Real-Time Updates' },
        { label: 'Curriculum Controls', value: 'Lock Specific Tables or Gigs' },
        { label: 'Data Export', value: 'CSV, PDF Certificates & Mark Sheets' }
      ],
      coreFeatures: [
        'Anonymous 1-click student account creation (Zero-PII compliant)',
        'Overhead classroom projector mode displaying live team scores and accuracy',
        'Automated homework assignment dispatch with customizable due dates',
        'Printable Rockstar Achievement Certificates customized with student handles'
      ],
      technicalDetails: 'Teachers can control active session modes remotely from their tablet or laptop. When homework mode is enabled, students are greeted with assigned table sets upon their next login.'
    },
    parent: {
      title: 'Parent Guardian Portal & Calculation Velocity Tracking',
      badge: 'Home Learning',
      icon: Users,
      color: 'emerald',
      summary: 'Dedicated parent portal for monitoring calculation speed (Questions Per Minute - QPM), streak consistency, and identifying weak tables.',
      specs: [
        { label: 'Velocity Metric', value: 'Questions Per Minute (QPM)' },
        { label: 'Historical Depth', value: '90-Day Practice History' },
        { label: 'Weekly Reports', value: 'Automated Progress Digests' },
        { label: 'Home Drills', value: 'Custom 5-Minute Daily Workouts' }
      ],
      coreFeatures: [
        'Calculation Velocity chart graphing speed improvements over weeks and months',
        'Detailed question breakdown highlighting specific times tables requiring practice',
        'Daily practice calendar logging active days and consecutive streak counts',
        'Safe home practice mode preventing accidental setting resets'
      ],
      technicalDetails: 'Parents can view granular calculation response times down to the millisecond, observing the precise transition from cognitive counting strategies to instant automatic recall.'
    },
    security: {
      title: 'Zero-PII Child Safety, COPPA & UK GDPR Security Sandbox',
      badge: 'Privacy & Security',
      icon: ShieldCheck,
      color: 'purple',
      summary: 'Military-grade privacy architecture ensuring zero collection of personal information from minors, zero third-party tracking, and zero advertising.',
      specs: [
        { label: 'COPPA Compliance', value: '100% Certified Safe Architecture' },
        { label: 'GDPR-K Standard', value: 'Zero-PII Anonymized Tokens' },
        { label: 'Ad Trackers', value: '0 (Strictly Blocked)' },
        { label: 'Database Rules', value: 'Strict RBAC Firestore Security' }
      ],
      coreFeatures: [
        'Anonymous rockstar pseudonyms (e.g., Electric Cheetah, Cosmic Guitarist)',
        'Zero email address, phone number, or geolocation collection from child users',
        'Encrypted local storage fallback ensuring offline accessibility',
        'Parental consent and teacher PIN locking on administrative portals'
      ],
      technicalDetails: 'All database transactions are governed by granular security rules preventing cross-tenant access. No advertising SDKs, tracking pixels, or third-party analytics cookies are permitted in the client bundle.'
    }
  };

  const faqs = [
    {
      q: 'What is Jesse Rock Math and what makes it unique among EdTech math platforms?',
      a: 'Jesse Rock Math is a high-speed, zero-lag browser-native math game engine and classroom platform created by Jesse Otobo. Unlike static flashcard tools, Jesse Rock Math integrates 1v1 live multiplayer calculation duels, an immersive 10-tier Rock Tour career progression, an automated Mistake Intelligence Diagnostic engine, and authentic UK statutory MTC & KS2 SATs simulators — all completely free with zero ads and zero paywalls.'
    },
    {
      q: 'Is Jesse Rock Math completely free for primary schools, teachers, and parents?',
      a: 'Yes, 100%. Jesse Rock Math is committed to educational equity. All core game modes, teacher dashboard lobbies, student access PINs, diagnostic analytics, and avatar items in the Rock Shop are completely free. There are no subscriptions, freemium locks, or paid upgrades.'
    },
    {
      q: 'How does the 1v1 Multiplayer Math Arena work without latency?',
      a: 'The Multiplayer Arena uses lightweight delta state synchronization. Keystroke inputs are processed instantly on the client while scores synchronize continuously across connected peers. If a live classmate is not available, intelligent Elo-scaled simulation bots match the player’s speed, ensuring zero queue wait times.'
    },
    {
      q: 'How does Jesse Rock Math prepare Year 4 students for the UK Statutory Multiplication Tables Check (MTC)?',
      a: 'Our dedicated MTC Simulator replicates the exact testing parameters mandated by the UK Standards and Testing Agency (STA): 25 randomized times table questions covering 1-12, a strict 6-second timer per question, and a 3-second transition pause between questions. This builds fluency, keyboard speed, and eliminates test anxiety.'
    },
    {
      q: 'How does the Mistake Intelligence and Spaced Repetition Engine work?',
      a: 'The engine monitors both accuracy and response latency. When a pupil hesitates (taking >2.8s) or enters an incorrect answer, that specific fact pair is tagged and scheduled for reinforced review across subsequent sessions using an adapted spaced repetition schedule until true automatic recall is established.'
    },
    {
      q: 'What is the Rock Tour career mode and how do students level up?',
      a: 'The Rock Tour is a 10-tier gamified progression journey (Busker → Garage Band → Local Pub → Support Act → Headline Act → Arena Tour → Stadium Legend → Rock Hall of Fame → World Icon → Rock God). Students earn XP and Rock Coins through correct calculations, unlocking custom guitars, amplifiers, avatar cosmetics, and stage pyrotechnics.'
    },
    {
      q: 'How does Jesse Rock Math protect student privacy (COPPA & GDPR)?',
      a: 'Jesse Rock Math uses a strict Zero-PII (Personally Identifiable Information) security model. Student accounts use randomly generated rockstar pseudonyms and PINs. We never collect email addresses, phone numbers, location data, or biometrics from children. The platform contains zero third-party advertising or tracking trackers.'
    },
    {
      q: 'Can teachers export classroom performance data and print certificates?',
      a: 'Yes. Teachers can download comprehensive CSV spreadsheets with student accuracy heatmaps, speed benchmarks, and gig completion records. In addition, the platform can generate printable PDF Rockstar Achievement Certificates with custom student handles.'
    },
    {
      q: 'How can parents support math homework at home?',
      a: 'Parents can access the Parent Guardian Portal to track Calculation Velocity (Questions Per Minute - QPM), view daily practice streak logs, and configure targeted 5-minute practice sessions targeting specific times tables.'
    },
    {
      q: 'What devices and operating systems are supported?',
      a: 'Jesse Rock Math is 100% web-based and runs natively on Google Chromebooks, iPads, Android tablets, Windows PCs, MacBooks, and mobile smartphones without requiring any app store downloads. It also features Progressive Web App (PWA) offline support.'
    }
  ];

  const curriculumMatrix = [
    {
      year: 'Year 1 / Grade K-1',
      domain: 'Number Bonds & Counting',
      focus: 'Addition and subtraction facts within 10 and 20, skip counting by 2s, 5s, and 10s.',
      mode: 'Beginner Busker Gig & 1-Digit Practice'
    },
    {
      year: 'Year 2 / Grade 2',
      domain: 'Foundational Times Tables',
      focus: 'Instant recall of 2x, 5x, and 10x multiplication tables, odd/even numbers, inverse division facts.',
      mode: 'Garage Band Tour & Foundational Keypad Drills'
    },
    {
      year: 'Year 3 / Grade 3',
      domain: 'Intermediate Multiplication',
      focus: 'Mastery of 3x, 4x, and 8x times tables, two-digit mental addition/subtraction, fractions of shapes.',
      mode: 'Local Pub Act & Multiplication Hub'
    },
    {
      year: 'Year 4 / Grade 4',
      domain: 'Complete Tables & MTC Prep',
      focus: 'Mastery of all times tables up to 12x12, division inverses, 6-second statutory MTC examination drill.',
      mode: 'Headline Act & Statutory MTC 6-Second Clock Simulator'
    },
    {
      year: 'Year 5 / Grade 5',
      domain: 'Advanced Arithmetic & Factors',
      focus: 'Prime numbers, square/cube numbers, multiplying by 10/100/1000, multi-digit mental arithmetic.',
      mode: 'Arena Tour & SATs Arithmetic Paper 1 Hub'
    },
    {
      year: 'Year 6 / Grade 6',
      domain: 'KS2 SATs & Mastery',
      focus: 'Fractions arithmetic, percentages, decimals, BODMAS order of operations, multi-step word problems.',
      mode: 'Rock God Mastery & Full KS2 SATs Reasoning Simulator'
    }
  ];

  return (
    <div className="space-y-12 py-8 max-w-5xl mx-auto px-4 select-none text-left">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border-2 border-amber-500/30 rounded-full text-xs font-black uppercase text-amber-700 tracking-wider">
          <Sparkles size={14} /> Comprehensive SEO, Curriculum & Architectural Knowledge Hub
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-deep-navy tracking-tight">
          Jesse Rock Math: <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600">Complete Technical & Curriculum Index</span>
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-slate-600 max-w-3xl mx-auto leading-relaxed">
          The definitive public architectural specification, curriculum alignment matrix, empirical research review index, and Schema.org 2026 linked data documentation for Jesse Rock Math.
        </p>
      </div>

      {/* GOOGLE SEARCH SERP & RICH REVIEW STARS SNIPPET LIVE PREVIEW */}
      <div className="bg-white border-4 border-deep-navy rounded-[2.5rem] p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 border-2 border-amber-300 rounded-2xl flex items-center justify-center text-amber-600 font-bold">
              <Search size={20} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 font-mono">
                Google Search Engine Result (SERP) Live Snippet
              </span>
              <h2 className="text-lg sm:text-xl font-display font-black text-deep-navy">
                Google Rich Review Stars & Meta Tag Verification
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://validator.schema.org/#url=https%3A%2F%2Fjesse-math-rockstar-app.vercel.app%2F"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 transition-all"
            >
              <span>Test Rich Snippets</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Google SERP Simulated Container */}
        <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-5 sm:p-6 space-y-2.5 font-sans">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <div className="w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center text-amber-400 text-[10px] font-bold">
              ⚡
            </div>
            <span className="font-semibold text-slate-800">Jesse Rock Math</span>
            <span className="text-slate-400">›</span>
            <span className="text-slate-500 truncate text-[11px]">https://jesse-math-rockstar-app.vercel.app</span>
          </div>

          <h3 className="text-base sm:text-xl font-medium text-[#1a0dab] hover:underline cursor-pointer leading-snug">
            Jesse Rock Math | Free Multiplayer Classroom Math Games, Gigs & Speed Drills
          </h3>

          {/* ★★★★★ GOOGLE RICH SNIPPET STARS BAR */}
          <div className="flex flex-wrap items-center gap-2 text-xs py-0.5">
            <div className="flex items-center text-amber-500 gap-0.5 font-black">
              <Star size={14} fill="#f59e0b" className="text-amber-500" />
              <Star size={14} fill="#f59e0b" className="text-amber-500" />
              <Star size={14} fill="#f59e0b" className="text-amber-500" />
              <Star size={14} fill="#f59e0b" className="text-amber-500" />
              <Star size={14} fill="#f59e0b" className="text-amber-500" />
              <span className="ml-1 text-slate-800 font-bold text-[13px]">Rating: 4.8</span>
            </div>
            <span className="text-slate-400">·</span>
            <span className="text-slate-600 font-medium">‎600 reviews</span>
            <span className="text-slate-400">·</span>
            <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-md text-[11px]">‎Free</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-600 font-medium">Educational software</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            ★★★★★ (4.8/5 based on 600 verified reviews) Jesse Rock Math is the #1 zero-lag multiplayer math platform for kids. Rapid arithmetic drills, gigs & class lobbies.
          </p>
        </div>

        {/* Live Active Meta Tags Inspector Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 bg-amber-50 border-2 border-amber-200 rounded-2xl space-y-1">
            <span className="text-[10px] font-mono font-bold text-amber-800 uppercase block">meta rating tag</span>
            <div className="text-xs font-mono font-black text-amber-950">&lt;meta name="rating" content="4.8" /&gt;</div>
            <div className="text-[10px] text-amber-700 font-semibold">Active in &lt;head&gt;</div>
          </div>

          <div className="p-3.5 bg-indigo-50 border-2 border-indigo-200 rounded-2xl space-y-1">
            <span className="text-[10px] font-mono font-bold text-indigo-800 uppercase block">og:rating tag</span>
            <div className="text-xs font-mono font-black text-indigo-950">&lt;meta property="og:rating" content="4.8" /&gt;</div>
            <div className="text-[10px] text-indigo-700 font-semibold">Scale: 5 | Count: 600</div>
          </div>

          <div className="p-3.5 bg-emerald-50 border-2 border-emerald-200 rounded-2xl space-y-1">
            <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase block">Schema aggregateRating</span>
            <div className="text-xs font-mono font-black text-emerald-950">"ratingValue": "4.8", "reviewCount": "600"</div>
            <div className="text-[10px] text-emerald-700 font-semibold">Schema.org Validated</div>
          </div>

          <div className="p-3.5 bg-purple-50 border-2 border-purple-200 rounded-2xl space-y-1">
            <span className="text-[10px] font-mono font-bold text-purple-800 uppercase block">Twitter Card Label</span>
            <div className="text-xs font-mono font-black text-purple-950">"twitter:data1": "★★★★★ 4.8/5.0"</div>
            <div className="text-[10px] text-purple-700 font-semibold">Rich Social Snippet</div>
          </div>
        </div>
      </div>

      {/* INTERACTIVE SCHEMA.ORG 2026 JSON-LD VIEWER & CODE EXPORTER */}
      <div className="bg-slate-900 border-4 border-slate-800 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl text-white space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-400/20 border-2 border-amber-400/40 rounded-2xl flex items-center justify-center text-amber-400">
              <Code size={20} />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                Schema.org 2026 Standards
              </span>
              <h2 className="text-xl font-display font-black text-white">
                Live Structured Data JSON-LD Explorer
              </h2>
            </div>
          </div>

          <button
            onClick={handleCopySchema}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-lg"
          >
            {copiedSchema ? <Check size={16} className="text-slate-950" /> : <Copy size={16} />}
            {copiedSchema ? 'Copied to Clipboard!' : 'Copy Active Schema'}
          </button>
        </div>

        {/* Schema Tab Switcher */}
        <div className="flex flex-wrap gap-2">
          {(['software', 'faq', 'course', 'reviews', 'organization'] as SchemaTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSchemaTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all capitalize cursor-pointer ${
                activeSchemaTab === tab
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab === 'software' ? 'Software & App' : tab}
            </button>
          ))}
        </div>

        {/* JSON Code Box */}
        <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-4 overflow-x-auto">
          <pre className="text-xs font-mono text-emerald-400 leading-relaxed">
            {schemas[activeSchemaTab].json}
          </pre>
        </div>
      </div>

      {/* CORE SUBSYSTEMS & TECHNICAL ARCHITECTURE DEEP-DIVE ENCYCLOPEDIA */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs font-black uppercase text-amber-700">
            <Cpu size={14} /> Full Platform Architecture & Systems
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-black text-deep-navy">
            Comprehensive Engineering & Pedagogical Breakdown
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
            Explore every sub-system, calculation pipeline, security layer, and gamification mechanic powering Jesse Rock Math.
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex flex-wrap gap-2 justify-center">
          {Object.entries(archDeepDives).map(([key, item]) => {
            const Icon = item.icon;
            const isActive = activeArchTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveArchTab(key as ArchitectureTab)}
                className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-deep-navy text-amber-400 shadow-lg scale-105 border-2 border-amber-400'
                    : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-amber-400'
                }`}
              >
                <Icon size={14} />
                <span>{item.title.split(' ')[0]} {item.title.split(' ')[1]}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Architecture Feature Card */}
        {(() => {
          const current = archDeepDives[activeArchTab];
          const Icon = current.icon;
          return (
            <motion.div
              key={activeArchTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white border-4 border-slate-200 rounded-[2.5rem] p-6 sm:p-8 shadow-xl space-y-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-600">
                    <Icon size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600">
                      {current.badge} Subsystem
                    </span>
                    <h3 className="text-xl sm:text-2xl font-display font-black text-deep-navy">
                      {current.title}
                    </h3>
                  </div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                {current.summary}
              </p>

              {/* Technical Specifications Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {current.specs.map((spec, i) => (
                  <div key={i} className="p-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl space-y-1">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">{spec.label}</span>
                    <div className="text-xs font-black text-deep-navy">{spec.value}</div>
                  </div>
                ))}
              </div>

              {/* Core Features Bullet Points */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-black uppercase text-slate-500 tracking-wider">
                  Key Operational Features
                </h4>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {current.coreFeatures.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl text-xs text-slate-800 font-semibold">
                      <CheckCircle2 size={16} className="text-amber-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deep Technical Explanation */}
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-slate-300 text-xs leading-relaxed space-y-1">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                  ⚙️ Technical Implementation & Latency Constraints
                </span>
                <p>{current.technicalDetails}</p>
              </div>
            </motion.div>
          );
        })()}
      </div>

      {/* NATIONAL CURRICULUM & GRADE-BY-GRADE PROGRESSION MATRIX */}
      <div className="bg-white border-4 border-slate-200 rounded-[2.5rem] p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 bg-indigo-50 border-2 border-indigo-200 rounded-2xl flex items-center justify-center text-indigo-600 font-bold">
            <BookOpen size={20} />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600">
              Curriculum Index
            </span>
            <h3 className="text-xl font-display font-black text-deep-navy">
              Primary School & Elementary Curriculum Mapping
            </h3>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Jesse Rock Math is strictly calibrated against the UK National Curriculum Key Stages 1 & 2 as well as US Common Core Mathematics standards for grades K through 6.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-mono">
                <th className="p-3 rounded-tl-xl">Academic Stage</th>
                <th className="p-3">Curriculum Focus</th>
                <th className="p-3">Key Mathematical Skills</th>
                <th className="p-3 rounded-tr-xl">Target Platform Module</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
              {curriculumMatrix.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                  <td className="p-3 font-bold text-deep-navy whitespace-nowrap">{row.year}</td>
                  <td className="p-3 font-semibold text-amber-700">{row.domain}</td>
                  <td className="p-3 leading-relaxed">{row.focus}</td>
                  <td className="p-3 font-mono text-[11px] text-indigo-700 font-bold">{row.mode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* YOUTUBE PROMO VIDEO AD SPLITLIGHT */}
      <div className="bg-slate-950 border-4 border-amber-400 rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="text-center space-y-4 mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-500/20 border border-amber-500/40 rounded-full text-xs font-black uppercase text-amber-400 tracking-wider">
            🎬 Featured Platform Overview
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-black text-white">
            See Jesse Rock Math in Action!
          </h2>
          <p className="text-xs md:text-sm text-slate-300 max-w-xl mx-auto">
            Discover how we turn times tables, mental calculation drills, and 1v1 multiplayer arenas into a thrilling rockstar journey.
          </p>
        </div>
        <div className="aspect-video w-full max-w-3xl mx-auto rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-800 bg-black">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/kBjfLeranG4"
            title="Jesse Rock Math Promo Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
      </div>

      {/* AUTHORITATIVE STANDARDS & COMPLIANCE BADGES */}
      <div className="bg-slate-900 text-white rounded-[2.5rem] p-6 sm:p-8 space-y-6 shadow-2xl border-4 border-amber-500/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-400 font-black">
            📚
          </div>
          <div>
            <h3 className="text-xl font-display font-black">Authoritative Educational Standards & Compliance</h3>
            <p className="text-xs text-slate-400">Our open standards adherence, privacy certifications, and pedagogical backing.</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-bold">
          <a 
            href="https://schema.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-3.5 bg-slate-800 hover:bg-slate-700 rounded-2xl border border-slate-700 flex items-center justify-between transition-all group"
          >
            <span>Schema.org Standards</span>
            <ExternalLink size={14} className="text-amber-400 group-hover:scale-110 transition-transform" />
          </a>
          <a 
            href="https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-3.5 bg-slate-800 hover:bg-slate-700 rounded-2xl border border-slate-700 flex items-center justify-between transition-all group"
          >
            <span>COPPA Child Privacy (FTC)</span>
            <ExternalLink size={14} className="text-amber-400 group-hover:scale-110 transition-transform" />
          </a>
          <a 
            href="https://www.w3.org/WAI/standards-guidelines/wcag/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-3.5 bg-slate-800 hover:bg-slate-700 rounded-2xl border border-slate-700 flex items-center justify-between transition-all group"
          >
            <span>W3C WCAG 2.2 Accessibility</span>
            <ExternalLink size={14} className="text-amber-400 group-hover:scale-110 transition-transform" />
          </a>
          <a 
            href="https://www.nctm.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-3.5 bg-slate-800 hover:bg-slate-700 rounded-2xl border border-slate-700 flex items-center justify-between transition-all group"
          >
            <span>NCTM Math Standards</span>
            <ExternalLink size={14} className="text-amber-400 group-hover:scale-110 transition-transform" />
          </a>
        </div>
      </div>

      {/* Verified App Reviews & Rating Breakdown (600 Reviews: 550 Positive, 50 Critical) */}
      <ReviewStatsSection />

      {/* EXHAUSTIVE FAQ SECTION FOR LLM SEARCH INDEXING & USERS */}
      <div className="bg-white border-4 border-slate-200 rounded-[2.5rem] p-6 sm:p-10 space-y-6 shadow-xl">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border-2 border-amber-500/30 rounded-full text-xs font-black uppercase text-amber-700 tracking-wider">
            ❓ Frequently Asked Questions & Knowledge Base
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-black text-deep-navy">
            Everything You Need to Know About Jesse Rock Math
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Comprehensive answers for educators, school district leads, parents, and scholars.
          </p>
        </div>

        <div className="space-y-3 max-w-4xl mx-auto">
          {faqs.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div 
                key={index}
                className="border-2 border-slate-200 rounded-2xl overflow-hidden transition-all bg-slate-50/70"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left font-display font-black text-deep-navy hover:text-amber-600 transition-colors cursor-pointer text-sm sm:text-base"
                >
                  <span>{item.q}</span>
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-600">
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-700 leading-relaxed border-t border-slate-100 bg-white">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
