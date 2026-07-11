import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Printer, Award, Music, Star, ShieldCheck, FileText } from 'lucide-react';
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
  const accuracy = totalSolved > 0 ? Math.round((correctAnswers / totalSolved) * 100) : 0;

  const handleDownloadPNG = async () => {
    if (!certRef.current) return;
    try {
      const canvas = await html2canvas(certRef.current, { scale: 3, useCORS: true });
      const link = document.createElement('a');
      link.download = `Jesse_Rock_Math_Legendary_${username || 'Scholar'}.png`;
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
      
      // A4 landscape: 297mm x 210mm
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Jesse_Rock_Math_Certificate_${username || 'Scholar'}.pdf`);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-950/80 backdrop-blur-sm">
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
                border: 12px double #b45309 !important; /* Gold border */
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
            initial={{ opacity: 0, scale: 0.9, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.9, y: 20 }} 
            className="relative z-10 w-full max-w-4xl flex flex-col items-center gap-6 p-2 sm:p-4 my-8"
          >
            {/* The Certificate Target */}
            <div 
              ref={certRef}
              id="print-certificate-target"
              className="w-full aspect-[1.414] bg-white rounded-2xl shadow-2xl overflow-hidden relative text-deep-navy border-[14px] border-double border-amber-600 p-6 sm:p-14 flex flex-col items-center justify-between text-center select-none"
              style={{ 
                backgroundImage: 'radial-gradient(circle at center, #ffffff 50%, #fefcf6 100%)',
                boxShadow: '0 25px 50px -12px rgba(251, 191, 36, 0.15)' 
              }}
            >
              {/* Ornate corner frames and background graphics */}
              <div className="absolute inset-2 border-2 border-amber-500/10 rounded-lg pointer-events-none" />
              <div className="absolute top-0 left-0 w-28 h-28 border-t-4 border-l-4 border-amber-500/50 m-4 sm:m-8 rounded-tl-lg pointer-events-none" />
              <div className="absolute top-0 right-0 w-28 h-28 border-t-4 border-r-4 border-amber-500/50 m-4 sm:m-8 rounded-tr-lg pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-28 h-28 border-b-4 border-l-4 border-amber-500/50 m-4 sm:m-8 rounded-bl-lg pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-28 h-28 border-b-4 border-r-4 border-amber-500/50 m-4 sm:m-8 rounded-br-lg pointer-events-none" />
              
              {/* Header: App Brand Name with Icons */}
              <div className="flex items-center gap-2 text-amber-600 font-display font-black text-xs sm:text-sm uppercase tracking-[0.25em] mb-1">
                <Music size={14} className="animate-pulse" />
                <span>Jesse Rock Math</span>
                <Star size={14} className="fill-amber-500 text-amber-500" />
              </div>
              
              {/* Certificate Title */}
              <div className="space-y-1">
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-black text-amber-700 uppercase tracking-widest leading-none">
                  LEGENDARY TIER
                </h1>
                <p className="text-[10px] sm:text-[11px] text-slate-500 uppercase tracking-[0.3em] font-bold">
                  HONORARY MATHEMATICAL CREDENTIAL
                </p>
              </div>

              {/* Recipient description */}
              <div className="space-y-2 max-w-2xl my-2">
                <p className="text-xs sm:text-lg text-slate-700 font-serif italic font-bold">
                  This is to certify that
                </p>
                
                {/* Username Display */}
                <div className="relative py-2 px-6">
                  <h2 className="text-2xl sm:text-4xl md:text-5xl font-display font-black text-slate-900 border-b-4 border-double border-amber-600 pb-2 max-w-xl mx-auto tracking-wide">
                    {username || "Young Math Rockstar"}
                  </h2>
                </div>
              </div>

              {/* Achievement description */}
              <div className="space-y-3 max-w-xl">
                <p className="text-[11px] sm:text-sm text-slate-700 font-serif leading-relaxed font-semibold">
                  has achieved the status of <strong className="text-amber-800">Legendary Math Rockstar</strong> by successfully solving over <strong className="text-amber-800 text-xs sm:text-base">200 Math Questions</strong> in the Play Arena. This recipient has demonstrated extraordinary calculation speed, consistent logical precision, and elite-tier mathematical focus.
                </p>

                {/* Stats Block */}
                <div className="grid grid-cols-2 gap-4 py-3 bg-amber-50/50 rounded-2xl border-2 border-amber-200/50 max-w-sm mx-auto">
                  <div>
                    <p className="text-[8px] uppercase tracking-wider font-black text-amber-600">Accuracy</p>
                    <p className="text-xl font-display font-black text-amber-700">{accuracy}%</p>
                  </div>
                  <div className="border-l border-amber-200">
                    <p className="text-[8px] uppercase tracking-wider font-black text-amber-600">Questions Answered</p>
                    <p className="text-xl font-display font-black text-amber-700">{totalSolved}</p>
                  </div>
                </div>
                
                {/* The Seal / Badge Graphic */}
                <div className="flex justify-center my-1 sm:my-3 scale-90 sm:scale-100">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-20 h-20 bg-amber-500/10 rounded-full border border-amber-500/30 animate-spin-slow pointer-events-none" />
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-amber-600 border-4 border-double border-amber-100 flex flex-col items-center justify-center text-white shadow-xl relative">
                      <ShieldCheck size={20} className="text-white drop-shadow-md mb-0.5" />
                      <span className="text-[7px] font-black uppercase tracking-wider text-amber-100">VERIFIED</span>
                      <span className="text-[6px] font-mono text-white/90">#200_SOLVED</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Credentials Signatures Block */}
              <div className="flex justify-between w-full max-w-2xl mt-4 border-t-2 border-double border-amber-600/30 pt-4 sm:pt-6">
                {/* Developer / Founder */}
                <div className="flex flex-col items-center">
                  <span className="text-lg sm:text-2xl text-slate-950 font-semibold" style={{ fontFamily: "'Brush Script MT', cursive, serif" }}>Jesse Otobo</span>
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-500 font-black border-t border-slate-300 pt-1">Sign in by Jesse Math Rock Star</span>
                </div>

                {/* Operations / Dad */}
                <div className="flex flex-col items-center">
                  <span className="text-sm sm:text-lg font-mono font-black text-slate-800">APPROVED ✓</span>
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-500 font-black border-t border-slate-300 pt-1">Academic Board</span>
                </div>

                {/* Date */}
                <div className="flex flex-col items-center">
                  <span className="text-xs sm:text-base font-mono font-bold text-slate-900">{new Date().toLocaleDateString()}</span>
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-500 font-black border-t border-slate-300 pt-1">Date of Achievement</span>
                </div>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="flex flex-col sm:flex-row items-center gap-4 no-print mt-2">
              <button 
                onClick={handleDownloadPDF}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black rounded-xl uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-red-500/20 transition-all hover:scale-105"
              >
                <FileText size={18} className="stroke-[2.5px]" />
                Download Printable PDF
              </button>

              <button 
                onClick={handleDownloadPNG}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-amber-950 font-black rounded-xl uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-amber-500/30 transition-all hover:scale-105"
              >
                <Download size={18} className="stroke-[2.5px]" />
                Save PNG Image
              </button>
              
              <button 
                onClick={handlePrint}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-xl uppercase tracking-widest flex items-center gap-2 shadow-xl transition-all hover:scale-105"
              >
                <Printer size={18} className="stroke-[2.5px]" />
                Print Certificate
              </button>

              <button 
                onClick={onClose}
                className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all font-bold uppercase text-xs tracking-wider border border-white/10"
              >
                Close Window
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

