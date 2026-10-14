import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Send,
  Copy,
  Check,
  Mail,
  Smartphone,
  Info,
  Clock,
  HeartHandshake,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { Student, AttendanceStatus } from '../types/attendance';
import { useAttendance } from '../context/AttendanceContext';

interface ParentAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  status: AttendanceStatus;
}

export const ParentAlertModal: React.FC<ParentAlertModalProps> = ({
  isOpen,
  onClose,
  student,
  status,
}) => {
  const { selectedDate, classes, selectedClassId, getCurrentRecord, getStudentStats, logSentAlert } =
    useAttendance();

  const [tone, setTone] = useState<'caring' | 'formal' | 'urgent'>('caring');
  const [isLoading, setIsLoading] = useState(false);
  const [subject, setSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [smsBody, setSmsBody] = useState('');
  const [followUpTip, setFollowUpTip] = useState('');
  const [copiedType, setCopiedType] = useState<'email' | 'sms' | null>(null);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const record = student ? getCurrentRecord(student.id, selectedDate) : undefined;
  const stats = student ? getStudentStats(student.id) : undefined;

  // Auto generate on modal open when student is selected
  useEffect(() => {
    if (isOpen && student) {
      setSentSuccess(false);
      setErrorMessage(null);
      generateAlert(tone);
    }
  }, [isOpen, student]);

  if (!isOpen || !student) return null;

  const generateAlert = async (selectedTone: 'caring' | 'formal' | 'urgent') => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/ai/generate-parent-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: student.name,
          rollNo: student.rollNo,
          parentName: student.parentName,
          date: selectedDate,
          status,
          reason: record?.note,
          consecutiveDaysAbsent: stats?.consecutiveAbsences || 1,
          teacherName: currentClass.teacherName,
          className: currentClass.name,
          tone: selectedTone,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate alert from server');
      }

      const data = await response.json();
      setSubject(data.subject || `Attendance Notice: ${student.name}`);
      setEmailBody(data.emailBody || '');
      setSmsBody(data.smsBody || '');
      setFollowUpTip(data.followUpTip || '');
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Could not connect to AI service. Loaded standard draft template.');
      // Safe fallback
      setSubject(`Attendance Notice: ${student.name} marked ${status} on ${selectedDate}`);
      setEmailBody(
        `Dear ${student.parentName},\n\nWe missed ${student.name} in class today (${selectedDate}). Please let us know if they need any homework assistance or when to expect their return.\n\nWarm regards,\n${currentClass.teacherName}\n${currentClass.name}`
      );
      setSmsBody(
        `Oakridge Elementary: ${student.name} was marked ${status} on ${selectedDate}. Please contact school if you need support.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, type: 'email' | 'sms') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleSendNotification = () => {
    logSentAlert({
      studentId: student.id,
      studentName: student.name,
      parentName: student.parentName,
      parentEmail: student.parentEmail,
      parentPhone: student.parentPhone,
      date: selectedDate,
      status,
      reason: record?.note,
      subject,
      emailBody,
      smsBody,
      followUpTip,
      sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    setSentSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">AI Parent Alert Assistant</h2>
              <p className="text-xs text-indigo-100">
                Drafting communication for {student.name} • {student.parentName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Error Banner if any */}
          {errorMessage && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Student Status Summary Box */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span
                className={`font-bold uppercase px-2.5 py-1 rounded-md text-[11px] ${
                  status === 'absent' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                }`}
              >
                Marked {status}
              </span>
              <span className="text-slate-600">
                Date: <strong className="text-slate-900">{selectedDate}</strong>
              </span>
              {record?.note && (
                <span className="text-slate-600">
                  Note: <strong className="text-slate-900">&ldquo;{record.note}&rdquo;</strong>
                </span>
              )}
            </div>
            <div className="text-slate-500">
              Recipient: <span className="font-semibold text-slate-800">{student.parentEmail}</span>
            </div>
          </div>

          {/* Tone Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Select Message Tone (Gemini Prompt Guidance):
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setTone('caring');
                  generateAlert('caring');
                }}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  tone === 'caring'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900 ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <HeartHandshake className="w-4 h-4 text-emerald-600" />
                <span>Empathetic & Caring</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTone('formal');
                  generateAlert('formal');
                }}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  tone === 'formal'
                    ? 'bg-indigo-50 border-indigo-400 text-indigo-900 ring-2 ring-indigo-500/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Official & Formal</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTone('urgent');
                  generateAlert('urgent');
                }}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  tone === 'urgent'
                    ? 'bg-rose-50 border-rose-400 text-rose-900 ring-2 ring-rose-500/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Urgent Attendance Warning</span>
              </button>
            </div>
          </div>

          {/* Loading Indicator */}
          {isLoading ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-600">
                Gemini 3.8 Flash is drafting tailored notice for {student.parentName}...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Email Draft Area */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Email Subject & Body:</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleCopy(`Subject: ${subject}\n\n${emailBody}`, 'email')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    {copiedType === 'email' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Email</span>
                      </>
                    )}
                  </button>
                </div>

                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Subject line..."
                />

                <textarea
                  rows={6}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full text-xs leading-relaxed p-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Email text..."
                />
              </div>

              {/* SMS Text Version */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Mobile SMS Text Alert:</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({smsBody.length}/160 chars)
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleCopy(smsBody, 'sms')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-800 cursor-pointer"
                  >
                    {copiedType === 'sms' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy SMS</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={smsBody}
                    onChange={(e) => setSmsBody(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-emerald-50/40 border border-emerald-200 rounded-lg text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Gemini Follow-up Tip */}
              {followUpTip && (
                <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-start gap-2.5 text-xs text-indigo-900">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Gemini Teacher Insight:</span> {followUpTip}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Simulated dispatch sends notice to logged notifications journal.
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isLoading || sentSuccess}
              onClick={handleSendNotification}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                sentSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/30'
              }`}
            >
              {sentSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Logged & Sent!</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Record & Send Alert</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
