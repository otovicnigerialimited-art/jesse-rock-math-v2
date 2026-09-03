import React, { useState } from 'react';
import { Copy, Check, Printer } from 'lucide-react';

export default function TermsPage() {
  const [copied, setCopied] = useState(false);

  const handleCopyAll = async () => {
    const fullText = document.getElementById('terms-document-content')?.innerText || '';
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const tempInput = document.createElement('textarea');
      tempInput.value = fullText;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 md:px-8 text-slate-900">
      {/* Top Document Controls */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-300 shadow-sm print:hidden">
        <div className="text-sm font-bold text-slate-700">
          Jesse Math FC — Legal Document View
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyAll}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            {copied ? 'Copied Full Text' : 'Copy Plain Text'}
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer size={14} /> Print Document
          </button>
        </div>
      </div>

      {/* Main Word / Document Style Sheet */}
      <div 
        id="terms-document-content"
        className="max-w-4xl mx-auto bg-white border border-slate-300 shadow-md p-8 sm:p-12 md:p-16 rounded-sm text-left font-serif leading-relaxed text-slate-900"
        style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}
      >
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 mb-2 font-sans">
          JESSE MATH ROCKSTAR
        </h1>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 font-sans">
          TERMS OF SERVICE
        </h2>

        <div className="mb-8 text-sm text-slate-700 font-sans border-b border-slate-200 pb-4">
          <p><strong>Effective Date:</strong> 31 August 2026</p>
          <p><strong>Last Updated:</strong> 31 August 2026</p>
        </div>

        <div className="space-y-6 text-base text-slate-900 leading-relaxed">
          <p>
            Welcome to <strong>Jesse Math FC</strong>.
          </p>

          <p>
            These Terms of Service (“Terms”) explain the rules for using Jesse Math FC (“Jesse Math FC”, “the Service”, “we”, “us”, or “our”).
          </p>

          <p>
            Jesse Math FC is operated by <strong>Jesse Otobo</strong> in the United Kingdom.
          </p>

          <p>
            By accessing or using Jesse Math FC, you agree to follow these Terms. If you do not agree with them, please do not use the Service.
          </p>

          <hr className="my-8 border-slate-300" />

          {/* SECTION 1 */}
          <h3 className="text-xl font-bold text-slate-950 pt-2 font-sans">
            1. ABOUT JESSE MATH ROCKSTAR
          </h3>
          <p>
            Jesse Math FC is an educational mathematics platform created to make learning and practising maths more interactive, useful and enjoyable.
          </p>
          <p>
            Depending on the features available at the time, the Service may include:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 my-3">
            <li>Mathematics lessons and explanations;</li>
            <li>Interactive learning activities;</li>
            <li>Multiplication and arithmetic practice;</li>
            <li>Flashcards and spaced-repetition activities;</li>
            <li>KS2 SATs preparation;</li>
            <li>Mathematics games and challenges;</li>
            <li>Multiplayer mathematics activities;</li>
            <li>Teacher classroom tools;</li>
            <li>Parent progress tools;</li>
            <li>Student progress tracking;</li>
            <li>Educational assignments;</li>
            <li>Leaderboards using appropriate display names;</li>
            <li>Virtual rewards and match coins;</li>
            <li>Avatar and cosmetic customisation; and</li>
            <li>Surveys and feedback tools.</li>
          </ul>
          <p>
            We may add, improve, change or remove features from time to time.
          </p>

          <hr className="my-8 border-slate-300" />

          {/* SECTION 2 */}
          <h3 className="text-xl font-bold text-slate-950 pt-2 font-sans">
            2. EDUCATIONAL PURPOSE
          </h3>
          <p>
            Jesse Math FC is designed to <strong>support education and mathematics practice</strong>.
          </p>
          <p>
            It is not intended to replace:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 my-3">
            <li>a qualified teacher;</li>
            <li>a school;</li>
            <li>formal classroom teaching;</li>
            <li>professional educational assessment; or</li>
            <li>official examination services.</li>
          </ul>
          <p>
            While we work hard to provide useful and accurate educational content, we cannot promise that using Jesse Math FC will automatically improve a user's academic performance.
          </p>
          <p>
            We also cannot guarantee a particular SATs result, examination result, school grade, mathematics ability or academic achievement.
          </p>
          <p>
            If you notice something that appears to be incorrect in our educational content, please let us know so we can investigate and correct it where appropriate.
          </p>

          <hr className="my-8 border-slate-300" />

          {/* SECTION 3 */}
          <h3 className="text-xl font-bold text-slate-950 pt-2 font-sans">
            3. ELIGIBILITY AND CHILDREN
          </h3>
          <p>
            Jesse Math FC is intended for users aged <strong>4 and above</strong>.
          </p>
          <p>
            Because the Service may be used by children, parents, guardians, schools and teachers should make sure that children use the Service in an appropriate and safe way.
          </p>
          <p>
            Children under 13 should use Jesse Math FC with appropriate parent, guardian, school or educational authorisation.
          </p>
          <p>
            Please do not enter unnecessary personal information into the Service.
          </p>
          <p>
            This includes things such as:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 my-3">
            <li>your home address;</li>
            <li>personal telephone number;</li>
            <li>social-media username or handle;</li>
            <li>unnecessary real-world identifying information; or</li>
            <li>any other information that is not needed to use the Service.</li>
          </ul>
          <p>
            Jesse Math FC does not provide open text or voice communication between students.
          </p>
          <p>
            Where social or competitive features are available, we may use display names, avatars, badges and mathematics scores rather than publicly displaying a child's real identity.
          </p>

          <hr className="my-8 border-slate-300" />

          {/* SECTION 4 */}
          <h3 className="text-xl font-bold text-slate-950 pt-2 font-sans">
            4. ACCOUNT TYPES
          </h3>
          <p>
            Jesse Math FC may provide different types of accounts, including:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 my-3">
            <li>Student Accounts;</li>
            <li>Teacher Accounts;</li>
            <li>Parent/Guardian Accounts;</li>
            <li>Guest or Anonymous Accounts; and</li>
            <li>Administrative or Creator Accounts.</li>
          </ul>
          <p>
            Some features may require an account.
          </p>
          <p>
            Guest users may be able to use certain parts of Jesse Math FC without creating a permanent account.
          </p>
          <p>
            Please be aware that guest progress may be stored locally on the device being used. This means that progress could be lost if browser storage is cleared, private browsing is used, the device is changed, or the stored data is otherwise removed.
          </p>

          <hr className="my-8 border-slate-300" />

          {/* SECTION 5 */}
          <h3 className="text-xl font-bold text-slate-950 pt-2 font-sans">
            5. ACCOUNT SECURITY
          </h3>
          <p>
            Please keep your account credentials and access information safe.
          </p>
          <p>
            If you are using classroom access provided by a teacher, follow the instructions given by your teacher or parent/guardian.
          </p>
          <p>
            Teachers may manage student credentials for students within their authorised classrooms.
          </p>
          <p>
            You must not:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 my-3">
            <li>use another person's credentials without permission;</li>
            <li>attempt to access another person's account;</li>
            <li>guess or repeatedly attempt passwords;</li>
            <li>bypass authentication or security systems;</li>
            <li>interfere with authentication systems; or</li>
            <li>knowingly allow someone else to use your account in a way that violates these Terms.</li>
          </ul>
          <p>
            If we reasonably believe that an account has been compromised, abused or used in an unsafe way, we may temporarily restrict or suspend access to protect the account and the Service.
          </p>

          <hr className="my-8 border-slate-300" />

          {/* SECTION 6 */}
          <h3 className="text-xl font-bold text-slate-950 pt-2 font-sans">
            6. TEACHER ACCOUNTS
          </h3>
          <p>
            Teacher Accounts may provide tools for managing educational activities and classrooms.
          </p>
          <p>
            Depending on the features available, teachers may be able to:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 my-3">
            <li>create and manage classrooms;</li>
            <li>create student accounts;</li>
            <li>assign mathematics activities;</li>
            <li>provide students with login information;</li>
            <li>view authorised student progress;</li>
            <li>review mathematics performance;</li>
            <li>export authorised educational reports;</li>
            <li>reset classroom credentials;</li>
            <li>remove students from classrooms; and</li>
            <li>use other classroom-management features provided by Jesse Math FC.</li>
          </ul>
          <p>
            Teachers must only access information they are authorised to access.
          </p>
          <p>
            Teachers must not attempt to access students, classrooms or information belonging to another teacher or school without appropriate authorisation.
          </p>

          <hr className="my-8 border-slate-300" />

          {/* SECTION 7 */}
          <h3 className="text-xl font-bold text-slate-950 pt-2 font-sans">
            7. PARENT/GUARDIAN ACCOUNTS
          </h3>
          <p>
            Parents and guardians may use the Parent Portal to view information relating to their linked child, where the relevant features are available.
          </p>
          <p>
            This may include:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 my-3">
            <li>mathematics scores;</li>
            <li>learning progress;</li>
            <li>accuracy;</li>
            <li>practice time;</li>
            <li>calculation speed;</li>
            <li>areas that may need additional practice;</li>
            <li>incorrect-answer reviews;</li>
            <li>practice reminders; and</li>
            <li>account-management controls.</li>
          </ul>
          <p>
            Parent access is intended to support a child's education.
          </p>
          <p>
            Parents and guardians must not use the Service to access information belonging to unrelated users.
          </p>

          <hr className="my-8 border-slate-300" />

          {/* SECTION 8 */}
          <h3 className="text-xl font-bold text-slate-950 pt-2 font-sans">
            8. VIRTUAL ITEMS AND match coins
          </h3>
          <p>
            Jesse Math FC may include virtual items such as <strong>match coins, avatars, instruments, badges and other digital rewards</strong>.
          </p>
          <p>
            Unless we clearly state otherwise:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 my-3">
            <li>match coins have no real-world monetary value;</li>
            <li>match coins cannot be exchanged for cash;</li>
            <li>match coins cannot be sold or transferred outside Jesse Math FC;</li>
            <li>virtual items do not represent real-world property; and</li>
            <li>virtual items may be changed, removed or discontinued.</li>
          </ul>
          <p>
            At the time these Terms were last updated, Jesse Math FC does not charge users for match coins or ordinary Club Shop items.
          </p>
          <p>
            If paid features are introduced in the future, additional terms will apply where required.
          </p>

          <hr className="my-8 border-slate-300" />

          {/* SECTION 9 */}
          <h3 className="text-xl font-bold text-slate-950 pt-2 font-sans">
            9. ACCEPTABLE USE
          </h3>
          <p>
            We want Jesse Math FC to remain safe, fair and enjoyable for everyone.
          </p>
          <p>
            You must not use the Service to:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 my-3">
            <li>hack or attack Jesse Math FC;</li>
            <li>carry out DDoS attacks;</li>
            <li>perform brute-force attacks;</li>
            <li>abuse or overload APIs;</li>
            <li>scrape or systematically collect Service data;</li>
            <li>upload or distribute malicious software;</li>
            <li>use automated bots to gain an unfair advantage;</li>
            <li>manipulate scores or rankings;</li>
            <li>cheat in competitive activities;</li>
            <li>bypass security controls;</li>
            <li>access another user's information without authorisation;</li>
            <li>steal or take over accounts;</li>
            <li>impersonate another person;</li>
            <li>interfere with the normal operation of the Service;</li>
            <li>upload harmful or malicious material;</li>
            <li>exploit security vulnerabilities without permission; or</li>
            <li>otherwise misuse the Service.</li>
          </ul>
          <p>
            Unauthorised security testing, penetration testing or exploitation of vulnerabilities is not permitted unless Jesse Math FC has expressly authorised it.
          </p>

          <hr className="my-8 border-slate-300" />

          {/* SECTION 10 */}
          <h3 className="text-xl font-bold text-slate-950 pt-2 font-sans">
            10. FAIR PLAY
          </h3>
          <p>
            If you participate in competitive features, please play fairly.
          </p>
          <p>
            Do not use:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 my-3">
            <li>scripts;</li>
            <li>bots;</li>
            <li>automated answer systems;</li>
            <li>injected code;</li>
            <li>exploits; or</li>
            <li>other methods designed to manipulate scores or gain an unfair advantage.</li>
          </ul>
          <p>
            We may investigate activity that appears suspicious or unfair.
          </p>
          <p>
            Depending on the circumstances, we may remove affected scores, temporarily suspend an account or terminate an account.
          </p>

          <hr className="my-8 border-slate-300" />

          {/* SECTION 11 */}
          <h3 className="text-xl font-bold text-slate-950 pt-2 font-sans">
            11. INTELLECTUAL PROPERTY
          </h3>
          <p>
            Unless stated otherwise, Jesse Math FC and its original materials belong to <strong>Jesse Otobo</strong> and/or the applicable rights holder.
          </p>
          <p>
            This may include:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 my-3">
            <li>the Jesse Math FC name;</li>
            <li>branding;</li>
            <li>logos;</li>
            <li>source code;</li>
            <li>website design;</li>
            <li>interface designs;</li>
            <li>educational content;</li>
            <li>mathematics question systems;</li>
            <li>graphics;</li>
            <li>original game systems;</li>
            <li>written materials; and</li>
            <li>other original intellectual property.</li>
          </ul>
          <p>
            Using Jesse Math FC does not transfer ownership of these materials to you.
          </p>
          <p>
            You receive a limited, personal, non-exclusive and non-transferable right to use the Service for its intended educational purpose.
          </p>
          <p>
            You must not copy, reproduce, redistribute, sell, commercially exploit, reverse engineer or create unauthorised derivative works from protected parts of the Service.
          </p>
          <p>
            Commercial use requires prior permission unless we have expressly authorised it.
          </p>

          <hr className="my-8 border-slate-300" />

          {/* SECTION 12 */}
          <h3 className="text-xl font-bold text-slate-950 pt-2 font-sans">
            12. FEEDBACK AND REVIEWS
          </h3>
          <p>
            We welcome feedback because it helps us improve Jesse Math FC.
          </p>
          <p>
            You may submit feedback, reviews, survey responses, ideas or suggestions through available feedback tools.
          </p>
          <p>
            Please do not include confidential, unnecessary or sensitive personal information in feedback submissions.
          </p>
          <p>
            Where legally permitted, you give Jesse Math FC permission to use submitted feedback to operate, improve and research the Service.
          </p>
          <p>
            If feedback is publicly shared, we will handle it consistently with our Privacy Policy, especially where children may be involved.
          </p>

          <hr className="my-8 border-slate-300" />

          {/* SECTION 13 */}
          <h3 className="text-xl font-bold text-slate-950 pt-2 font-sans">
            13. SERVICE AVAILABILITY
          </h3>
          <p>
            We work to keep Jesse Math FC reliable and available, but we cannot promise that the Service will always be online.
          </p>
          <p>
            Temporary interruptions may happen because of:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 my-3">
            <li>maintenance;</li>
            <li>updates;</li>
            <li>technical problems;</li>
            <li>security measures;</li>
            <li>third-party infrastructure problems;</li>
            <li>internet connectivity issues; or</li>
            <li>circumstances outside our reasonable control.</li>
          </ul>
          <p>
            We may also modify, suspend or discontinue individual features when reasonably necessary.
          </p>

          <hr className="my-8 border-slate-300" />

          {/* SECTION 14 */}
          <h3 className="text-xl font-bold text-slate-950 pt-2 font-sans">
            14. THIRD-PARTY SERVICES
          </h3>
          <p>
            Jesse Math FC relies on third-party infrastructure and services, including <strong>Firebase</strong>, for certain functions such as authentication and database functionality.
          </p>
          <p>
            Because these services are operated by third parties, outages, technical failures or other problems may sometimes affect Jesse Math FC.
          </p>
          <p>
            We are not responsible for problems caused by third-party services that are outside our reasonable control.
          </p>

          <hr className="my-8 border-slate-300" />

          {/* SECTION 15 */}
          <h3 className="text-xl font-bold text-slate-950 pt-2 font-sans">
            15. ACCOUNT SUSPENSION AND TERMINATION
          </h3>
          <p>
            We may suspend, restrict or terminate an account if we reasonably believe that a user has:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 my-3">
            <li>seriously violated these Terms;</li>
            <li>attempted to hack or attack the Service;</li>
            <li>manipulated or damaged data;</li>
            <li>repeatedly abused the Service;</li>
            <li>attempted to access information without authorisation;</li>
            <li>used bots or automation to cheat;</li>
            <li>committed a serious security violation; or</li>
            <li>created a significant risk to the Service or other users.</li>
          </ul>
          <p>
            Serious security or abuse incidents may result in immediate suspension or termination.
          </p>
          <p>
            Where appropriate and legally permitted, we will explain the reason for an account action.
          </p>
          <p>
            Users may contact support if they wish to appeal an account action.
          </p>

          <hr className="my-8 border-slate-300" />

          {/* SECTION 16 */}
          <h3 className="text-xl font-bold text-slate-950 pt-2 font-sans">
            16. ACCOUNT AND DATA DELETION
          </h3>
          <p>
            Users may request deletion of their account through available account settings or by contacting support.
          </p>
          <p>
            Parents or guardians may request deletion of information relating to their child where applicable.
          </p>
          <p>
            Teachers may also request deletion of student information where they are authorised to make such a request.
          </p>
          <p>
            Where applicable, personal information may be removed within approximately <strong>30 days</strong>, subject to technical, legal and security requirements.
          </p>
          <p>
            Certain information may need to be retained when required by law or when reasonably necessary for security, fraud prevention or legal purposes.
          </p>

          <hr className="my-8 border-slate-300" />

          {/* SECTION 17 */}
          <h3 className="text-xl font-bold text-slate-950 pt-2 font-sans">
            17. PRIVACY
          </h3>
          <p>
            Your privacy matters to us.
          </p>
          <p>
            Our <strong>Privacy Policy</strong> explains what information we collect, why we collect it, how we use it and how we protect it.
          </p>
          <p>
            The Privacy Policy forms part of these Terms.
          </p>
          <p>
            Jesse Math FC does <strong>not sell or rent users' personal information</strong>.
          </p>

          <hr className="my-8 border-slate-300" />

          {/* SECTION 18 */}
          <h3 className="text-xl font-bold text-slate-950 pt-2 font-sans">
            18. CHILD SAFETY
          </h3>
          <p>
            We take the safety and privacy of children seriously.
          </p>
          <p>
            Jesse Math FC is designed to minimise the collection of unnecessary information from children.
          </p>
          <p>
            The Service does not provide open student-to-student text or voice chat.
          </p>
          <p>
            Children should never enter unnecessary personal or identifying information into the Service.
          </p>
          <p>
            Additional information about children's privacy and safety is provided in our <strong>Children's Privacy & Safety Policy</strong>.
          </p>

          <hr className="my-8 border-slate-300" />

          {/* SECTION 19 */}
          <h3 className="text-xl font-bold text-slate-950 pt-2 font-sans">
            19. SECURITY
          </h3>
          <p>
            We use reasonable security measures designed to help protect Jesse Math FC and user information.
          </p>
          <p>
            These measures may include:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 my-3">
            <li>authentication controls;</li>
            <li>database security rules;</li>
            <li>input validation;</li>
            <li>access controls;</li>
            <li>rate limiting; and</li>
            <li>security monitoring.</li>
          </ul>
          <p>
            However, no internet-based service can promise <strong>100% security</strong>.
          </p>
          <p>
            If you believe you have found a security vulnerability, please report it responsibly rather than attempting to exploit it.
          </p>

          <hr className="my-8 border-slate-300" />

          {/* SECTION 20 */}
          <h3 className="text-xl font-bold text-slate-950 pt-2 font-sans">
            20. LIMITATION OF LIABILITY
          </h3>
          <p>
            To the extent permitted by applicable law, Jesse Math FC is not responsible for losses caused by circumstances such as:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 my-3">
            <li>temporary Service interruptions;</li>
            <li>misuse of the Service;</li>
            <li>problems with a user's device;</li>
            <li>internet connection problems;</li>
            <li>loss of locally stored guest progress;</li>
            <li>third-party service failures;</li>
            <li>incorrect educational content;</li>
            <li>unauthorised activity outside our reasonable control; or</li>
            <li>other circumstances that cannot reasonably be prevented.</li>
          </ul>
          <p>
            Nothing in these Terms excludes or limits liability where the law does not allow us to do so.
          </p>
          <p>
            Nothing in these Terms affects any statutory consumer rights that cannot legally be excluded.
          </p>

          <hr className="my-8 border-slate-300" />

          {/* SECTION 21 */}
          <h3 className="text-xl font-bold text-slate-950 pt-2 font-sans">
            21. CHANGES TO THE SERVICE
          </h3>
          <p>
            Jesse Math FC is a growing Service.
          </p>
          <p>
            We may add, improve, modify or remove features as the platform develops.
          </p>
          <p>
            We may also discontinue individual features or, where necessary, the Service itself.
          </p>
          <p>
            If we make material changes to these Terms, we will provide appropriate notice where required by law.
          </p>

          <hr className="my-8 border-slate-300" />

          {/* SECTION 22 */}
          <h3 className="text-xl font-bold text-slate-950 pt-2 font-sans">
            22. FUTURE PAID FEATURES
          </h3>
          <p>
            At the time these Terms were last updated, Jesse Math FC is provided without paywalls or paid features as described in the current Service.
          </p>
          <p>
            In the future, we may introduce optional paid services.
          </p>
          <p>
            If this happens, separate pricing, payment, renewal and refund terms will apply where required.
          </p>
          <p>
            We will not automatically make future paid features applicable to existing users without appropriate notice and, where required, agreement.
          </p>

          <hr className="my-8 border-slate-300" />

          {/* SECTION 23 */}
          <h3 className="text-xl font-bold text-slate-950 pt-2 font-sans">
            23. GOVERNING LAW
          </h3>
          <p>
            These Terms are governed by the laws applicable in <strong>England and Wales</strong>, subject to any mandatory legal rights or protections that apply to you under the laws of your place of residence.
          </p>

          <hr className="my-8 border-slate-300" />

          {/* SECTION 24 */}
          <h3 className="text-xl font-bold text-slate-950 pt-2 font-sans">
            24. CONTACT US
          </h3>
          <p>
            If you need help, want to make a privacy request, have a complaint, want to report a copyright concern, or need to report a security issue, please contact us.
          </p>
          <p>
            <strong>General Support:</strong><br />
            <a href="mailto:otobokids9@gmail.com" className="text-indigo-600 underline">otobokids9@gmail.com</a>
          </p>
          <p>
            <strong>Security:</strong><br />
            <a href="mailto:otobokids9@gmail.com" className="text-indigo-600 underline">otobokids9@gmail.com</a>
          </p>
          <p>
            For security issues, please use the security contact where possible so the matter can be handled appropriately.
          </p>

          <hr className="my-8 border-slate-300" />

          {/* SECTION 25 */}
          <h3 className="text-xl font-bold text-slate-950 pt-2 font-sans">
            25. ENTIRE AGREEMENT
          </h3>
          <p>
            These Terms, together with our Privacy Policy and any other policies specifically incorporated into them, set out the rules for using Jesse Math FC.
          </p>
          <p>
            If any part of these Terms is found to be unlawful or unenforceable, the remaining provisions will continue to apply to the extent permitted by law.
          </p>

          <hr className="my-10 border-slate-400" />

          {/* Document Footer */}
          <div className="pt-2 text-sm font-sans text-slate-800 space-y-1">
            <h4 className="text-base font-bold text-slate-950">JESSE MATH ROCKSTAR</h4>
            <p><strong>Operated by:</strong> Jesse Otobo</p>
            <p><strong>Country:</strong> United Kingdom</p>
            <p><strong>Effective Date:</strong> 31 August 2026</p>
            <p><strong>Last Updated:</strong> 31 August 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
