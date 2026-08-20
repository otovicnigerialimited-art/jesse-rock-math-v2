import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, Printer, Download, X, UserPlus, Sparkles } from 'lucide-react';
import { addStudentToTeacher } from '../../lib/schoolDb';

interface BulkStudentImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherId: string;
  onRefreshRoster: () => void;
}

export default function BulkStudentImportModal({ isOpen, onClose, teacherId, onRefreshRoster }: BulkStudentImportModalProps) {
  const [csvText, setCsvText] = useState(
    "Alex, Smith, Year 5A, Year 5\n" +
    "Sarah, Johnson, Year 5A, Year 5\n" +
    "Daniel, Williams, Year 5A, Year 5\n" +
    "Mia, Brown, Year 5A, Year 5\n" +
    "Tom, Taylor, Year 5A, Year 5\n" +
    "Josh, Davies, Year 5A, Year 5\n" +
    "Emma, Wilson, Year 5A, Year 5\n" +
    "Leo, Evans, Year 5A, Year 5\n" +
    "Chloe, Thomas, Year 5A, Year 5\n" +
    "Oliver, Roberts, Year 5A, Year 5\n" +
    "Leo, Evans, Year 5A, Year 5" // Duplicate item for test
  );

  const [importSummary, setImportSummary] = useState<{
    total: number;
    created: number;
    duplicates: number;
    generatedAccounts: Array<{ name: string; username: string; tempPass: string; className: string }>;
  } | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleProcessImport = async () => {
    setIsProcessing(true);
    const lines = csvText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    let createdCount = 0;
    let duplicateCount = 0;
    const generated: Array<{ name: string; username: string; tempPass: string; className: string }> = [];
    const seenNames = new Set<string>();

    for (const line of lines) {
      const parts = line.split(',').map(p => p.trim());
      const firstName = parts[0] || 'Student';
      const lastName = parts[1] || '';
      const className = parts[2] || 'Year 5A';

      const fullName = `${firstName} ${lastName}`.trim();
      const cleanNameKey = fullName.toLowerCase();

      if (seenNames.has(cleanNameKey)) {
        duplicateCount++;
        continue;
      }
      seenNames.add(cleanNameKey);

      const baseUser = (firstName.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(1000 + Math.random() * 9000));
      const tempPass = 'rock' + Math.floor(100 + Math.random() * 900);

      try {
        const res = await addStudentToTeacher(firstName, baseUser, tempPass, teacherId);
        if (res.success) {
          createdCount++;
          generated.push({ name: fullName, username: baseUser, tempPass, className });
        } else {
          duplicateCount++;
        }
      } catch (err) {
        duplicateCount++;
      }
    }

    setImportSummary({
      total: lines.length,
      created: createdCount,
      duplicates: duplicateCount,
      generatedAccounts: generated
    });

    setIsProcessing(false);
    onRefreshRoster();
  };

  const handlePrintCredentials = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-2xl w-full text-white shadow-2xl relative max-h-[90vh] flex flex-col space-y-4">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-2xl">
            <UserPlus size={24} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">AUTOMATED ROSTER PROVISIONING</span>
            <h3 className="text-xl font-display font-bold">BULK STUDENT IMPORT</h3>
          </div>
        </div>

        {!importSummary ? (
          <div className="space-y-4 text-xs">
            <p className="text-slate-300 leading-relaxed">
              Paste or upload CSV roster data formatted as: <code className="bg-slate-950 px-2 py-0.5 rounded text-amber-400 font-mono">First Name, Last Name, Class, Year/Grade</code>
            </p>

            <textarea
              rows={8}
              value={csvText}
              onChange={e => setCsvText(e.target.value)}
              className="w-full p-3 font-mono bg-slate-950 border border-slate-700 rounded-2xl text-slate-200 focus:outline-none focus:border-amber-400"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={onClose} className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 font-bold rounded-xl text-slate-300">
                Cancel
              </button>
              <button
                onClick={handleProcessImport}
                disabled={isProcessing}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
              >
                {isProcessing ? 'Validating & Registering...' : 'IMPORT & PROVISION ACCOUNTS →'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-xs overflow-y-auto flex-1 pr-1">
            {/* Summary Badge Banner */}
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={24} className="text-emerald-400" />
                <div>
                  <h4 className="font-bold text-white text-sm">Bulk Import Execution Complete</h4>
                  <p className="text-slate-300">{importSummary.created} accounts successfully generated</p>
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono font-bold">
                <span className="px-2.5 py-1 bg-slate-800 text-white rounded-lg">{importSummary.total} Total</span>
                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg">{importSummary.created} Created</span>
                {importSummary.duplicates > 0 && (
                  <span className="px-2.5 py-1 bg-rose-500/20 text-rose-400 rounded-lg">{importSummary.duplicates} Duplicates Skipped</span>
                )}
              </div>
            </div>

            {/* Generated Roster Credentials Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-slate-200">Generated Temporary Credentials Sheet</h5>
                <button
                  onClick={handlePrintCredentials}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer size={14} /> Print Credentials
                </button>
              </div>

              <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/50">
                      <th className="p-2.5">Student Name</th>
                      <th className="p-2.5">Class</th>
                      <th className="p-2.5">Generated Username</th>
                      <th className="p-2.5">Temporary Password</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importSummary.generatedAccounts.map((acc, idx) => (
                      <tr key={idx} className="border-b border-slate-800/40 font-mono">
                        <td className="p-2.5 font-bold font-sans text-white">{acc.name}</td>
                        <td className="p-2.5 text-slate-300">{acc.className}</td>
                        <td className="p-2.5 text-amber-400">@{acc.username}</td>
                        <td className="p-2.5 text-emerald-400">{acc.tempPass}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button onClick={onClose} className="px-6 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl uppercase">
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
