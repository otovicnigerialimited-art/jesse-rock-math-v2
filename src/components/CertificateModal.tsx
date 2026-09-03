import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Printer, Award, Music, Star, ShieldCheck, FileText, CheckCircle2, Sparkles, Flame, Trophy } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  totalSolved: number;
  correctAnswers: number;
}

export default function CertificateModal({ isOpen, onClose, username, totalSolved, correctAnswers }: CertificateModalProps) {
  const certRef = useRef<HTMLDivElement>(null);
  const accuracy = totalSolved > 0 ? Math.round((correctAnswers / totalSolved) * 100) : 100;
  const certId = React.useMemo(() => `JMR-${Math.floor(100000 + Math.random() * 900000)}`, []);

  const handleDownloadPNG = async () => {
    if (!certRef.current) return;
    try {
      const canvas = await html2canvas(certRef.current, { scale: 3, useCORS: true });
      const link = document.createElement('a');
      link.download = `Jesse_Math_Striker_Certificate_${username || 'Scholar'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error("Failed to generate certificate image", err);
    }
  };

  const handleDownloadPDF = async () => {
    if (!certRef.current) return;
    try {
      const canvas = await html2canvas(certRef.current, { scale: 3, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Jesse_Math_Striker_Certificate_${username || 'Scholar'}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF", err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto bg-slate-950/85 backdrop-blur-md">
          {/* Custom style injection for high resolution and clean paper-based printing */}
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              body * {
                visibility: hidden !important;
              }
              #print-certificate-target, #print-certificate-target * {
                visibility: visible !important;
              }
              #print-certificate-target {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                height: auto !important;
                aspect-ratio: 1.414 !important;
                border: 14px double #b45309 !important; /* Gold border */
                box-shadow: none !important;
                margin: 0 !important;
                padding: 40px !important;
                background-color: #ffffff !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}} />

          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.92, y: 15 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.92, y: 15 }} 
            className="relative z-10 w-full max-w-5xl flex flex-col items-center gap-5 my-6"
          >
            {/* The Certificate Target */}
            <div 
              ref={certRef}
              id="print-certificate-target"
              className="w-full aspect-[1.414] bg-white rounded-3xl shadow-2xl overflow-hidden relative text-deep-navy border-[16px] border-double border-amber-600 p-6 sm:p-12 md:p-14 flex flex-col items-center justify-between text-center select-none"
              style={{ 
                backgroundImage: 'radial-gradient(circle at center, #ffffff 40%, #fffdfa 80%, #fef3c7 100%)',
                boxShadow: '0 25px 60px -15px rgba(217, 119, 6, 0.25)' 
              }}
            >
              {/* Security Watermark Background Pattern */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center font-display font-black text-9xl tracking-widest text-amber-900 select-none uppercase">
                MATH CHAMPION
              </div>

              {/* Ornate corner frames and gold foil flourish graphics */}
              <div className="absolute inset-2 sm:inset-3 border-2 border-amber-500/20 rounded-xl pointer-events-none" />
              <div className="absolute inset-4 sm:inset-5 border border-amber-600/30 rounded-lg pointer-events-none" />
              
              <div className="absolute top-0 left-0 w-24 h-24 sm:w-32 sm:h-32 border-t-8 border-l-8 border-amber-600/70 m-3 sm:m-6 rounded-tl-xl pointer-events-none" />
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 border-t-8 border-r-8 border-amber-600/70 m-3 sm:m-6 rounded-tr-xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 border-b-8 border-l-8 border-amber-600/70 m-3 sm:m-6 rounded-bl-xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-24 h-24 sm:w-32 sm:h-32 border-b-8 border-r-8 border-amber-600/70 m-3 sm:m-6 rounded-br-xl pointer-events-none" />

              {/* Top Crest / Academic Header */}
              <div className="flex flex-col items-center gap-1.5 z-10 mt-1">
                <div className="flex items-center gap-2 px-5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border border-amber-500/30 text-amber-800 font-display font-black text-xs sm:text-sm uppercase tracking-[0.3em]">
                  <Trophy size={16} className="text-amber-600 fill-amber-500" />
                  <span>JESSE MATH FC ACADEMY</span>
                  <Sparkles size={16} className="text-amber-600" />
                </div>
                <p className="text-[9px] sm:text-[10px] text-amber-900/70 font-mono font-bold uppercase tracking-[0.25em]">
                  OFFICIAL INTERNATIONAL CREDENTIAL OF EXCELLENCE • ID: {certId}
                </p>
              </div>

              {/* Certificate Main Title */}
              <div className="space-y-1.5 z-10 my-2">
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-800 via-yellow-700 to-amber-900 uppercase tracking-widest leading-none drop-shadow-sm">
                  CERTIFICATE OF MASTERY
                </h1>
                <p className="text-[11px] sm:text-xs text-amber-900 font-serif font-black uppercase tracking-[0.35em] border-b-2 border-amber-500/30 pb-2 max-w-lg mx-auto">
                  GRAND MASTER MATHEMATICAL DIPLOMA
                </p>
              </div>

              {/* Recipient Presentation Block */}
              <div className="space-y-2 max-w-3xl z-10 w-full">
                <p className="text-xs sm:text-base text-slate-700 font-serif italic font-bold">
                  This prestiges honor and national recognition is officially conferred upon
                </p>
                
                {/* Recipient Name in Display Typography */}
                <div className="relative py-1 px-4 my-2">
                  <h2 className="text-3xl sm:text-5xl md:text-6xl font-display font-black text-slate-950 border-b-4 border-double border-amber-600/80 pb-3 max-w-2xl mx-auto tracking-wide drop-shadow-sm">
                    {username || "Young Math Striker"}
                  </h2>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 font-serif leading-relaxed font-semibold max-w-2xl mx-auto">
                  For demonstrating exceptional analytical precision, computational velocity, and unwavering dedication in completing over <strong className="text-amber-900 font-black">{totalSolved} advanced math challenges</strong> with an outstanding precision rating.
                </p>
              </div>

              {/* Middle Section: Highlights Grid & Official Gold Seal */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center w-full max-w-3xl my-3 z-10">
                {/* Left Highlight */}
                <div className="bg-amber-50/80 rounded-2xl border-2 border-amber-300/60 p-3 shadow-sm text-center">
                  <p className="text-[9px] uppercase tracking-widest font-black text-amber-700">Accuracy Rating</p>
                  <p className="text-2xl sm:text-3xl font-display font-black text-amber-900 mt-0.5">{accuracy}%</p>
                  <p className="text-[9px] text-amber-800 font-bold mt-0.5">High Speed Precision</p>
                </div>

                {/* Center Official Embossed Gold Seal */}
                <div className="flex justify-center my-1 sm:my-0">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-24 h-24 bg-amber-500/20 rounded-full border border-amber-500/40 animate-spin-slow pointer-events-none" />
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 via-amber-500 to-amber-700 border-4 border-double border-amber-100 flex flex-col items-center justify-center text-white shadow-2xl relative p-1">
                      <ShieldCheck size={24} className="text-white drop-shadow-md mb-0.5" />
                      <span className="text-[8px] font-black uppercase tracking-wider text-amber-100">AUTHENTIC</span>
                      <span className="text-[7px] font-mono font-bold text-white/90">OFFICIAL SEAL</span>
                    </div>
                  </div>
                </div>

                {/* Right Highlight */}
                <div className="bg-amber-50/80 rounded-2xl border-2 border-amber-300/60 p-3 shadow-sm text-center">
                  <p className="text-[9px] uppercase tracking-widest font-black text-amber-700">Questions Solved</p>
                  <p className="text-2xl sm:text-3xl font-display font-black text-amber-900 mt-0.5">{totalSolved}+</p>
                  <p className="text-[9px] text-amber-800 font-bold mt-0.5">Verified Calculation Drills</p>
                </div>
              </div>

              {/* Footer: Board Signatures & Seal Verification */}
              <div className="flex justify-between items-end w-full max-w-3xl border-t-2 border-double border-amber-600/40 pt-4 sm:pt-6 z-10">
                {/* Founder Signature */}
                <div className="flex flex-col items-center text-center">
                  <span className="text-2xl sm:text-3xl text-slate-950 font-bold tracking-tight" style={{ fontFamily: "'Brush Script MT', cursive, serif" }}>Jesse Otobo</span>
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-600 font-black border-t-2 border-slate-300 pt-1">Jesse Otobo (11-Yr-Old Founder & Chief Engineer)</span>
                </div>

                {/* Verification Badge */}
                <div className="hidden sm:flex flex-col items-center text-center">
                  <span className="text-xs font-mono font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">VERIFIED BOARD APPROVAL ✓</span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 font-black border-t border-slate-300 pt-1 mt-1">Jesse Math FC Academic Board</span>
                </div>

                {/* Date Conferred */}
                <div className="flex flex-col items-center text-center">
                  <span className="text-xs sm:text-base font-mono font-black text-slate-900">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-600 font-black border-t-2 border-slate-300 pt-1">Date Conferred</span>
                </div>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="flex flex-wrap items-center justify-center gap-3 no-print mt-1">
              <button 
                onClick={handleDownloadPDF}
                className="px-6 py-3 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-black rounded-2xl uppercase tracking-widest text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-red-500/20 transition-all hover:scale-105 cursor-pointer active:scale-95"
              >
                <FileText size={18} className="stroke-[2.5px]" />
                Download Printable PDF
              </button>

              <button 
                onClick={handleDownloadPNG}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-2xl uppercase tracking-widest text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-amber-500/30 transition-all hover:scale-105 cursor-pointer active:scale-95"
              >
                <Download size={18} className="stroke-[2.5px]" />
                Save High-Res PNG Image
              </button>
              
              <button 
                onClick={handlePrint}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700 rounded-2xl font-black uppercase tracking-widest text-xs sm:text-sm flex items-center gap-2 shadow-xl transition-all hover:scale-105 cursor-pointer active:scale-95"
              >
                <Printer size={18} className="stroke-[2.5px]" />
                Print Certificate
              </button>

              <button 
                onClick={onClose}
                className="px-5 py-3 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-2xl transition-all font-bold uppercase text-xs tracking-wider border border-slate-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}


