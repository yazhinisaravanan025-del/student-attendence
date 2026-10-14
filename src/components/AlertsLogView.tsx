import React from 'react';
import { Mail, Smartphone, Clock, Check, BellRing, Copy, Trash2 } from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';

export const AlertsLogView: React.FC = () => {
  const { sentAlerts } = useAttendance();

  const handleCopyAlert = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Parent Notices Journal</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log of AI-generated email and SMS attendance notifications sent to parents
          </p>
        </div>
      </div>

      {sentAlerts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <BellRing className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No parent notices recorded yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            When you mark a student absent or late during Roll Call, click &ldquo;Draft Parent Alert&rdquo; to generate and log an AI notice.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sentAlerts.map((alert, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-bold text-[11px] uppercase px-2 py-0.5 rounded-md ${
                      alert.status === 'absent'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {alert.status} Notice
                  </span>
                  <span className="font-bold text-slate-900 text-sm">{alert.studentName}</span>
                  <span className="text-xs text-slate-400">• To: {alert.parentName}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Logged at {alert.sentAt} on {alert.date}</span>
                </div>
              </div>

              {/* Subject & Email text */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-600" />
                    Subject: {alert.subject}
                  </span>
                  <button
                    onClick={() => handleCopyAlert(alert.emailBody)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                </div>
                <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed font-sans">
                  {alert.emailBody}
                </p>
              </div>

              {/* SMS Text */}
              {alert.smsBody && (
                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-center justify-between gap-2 text-xs text-emerald-950">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>SMS Sent:</strong> &ldquo;{alert.smsBody}&rdquo;</span>
                  </div>
                  <button
                    onClick={() => handleCopyAlert(alert.smsBody)}
                    className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer shrink-0"
                  >
                    Copy SMS
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
