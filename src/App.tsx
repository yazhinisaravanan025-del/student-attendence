import React, { useState } from 'react';
import { AttendanceProvider, useAttendance } from './context/AttendanceContext';
import { Header } from './components/Header';
import { AttendanceRollCall } from './components/AttendanceRollCall';
import { StudentRosterView } from './components/StudentRosterView';
import { AnalyticsView } from './components/AnalyticsView';
import { AlertsLogView } from './components/AlertsLogView';
import { ParentAlertModal } from './components/ParentAlertModal';
import { AiSummaryModal } from './components/AiSummaryModal';
import { GuideModal } from './components/GuideModal';
import { Student, AttendanceStatus } from './types/attendance';
import { Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';

function AttendanceApp() {
  const [currentTab, setCurrentTab] = useState<'rollcall' | 'roster' | 'analytics' | 'alerts'>('rollcall');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isAiSummaryOpen, setIsAiSummaryOpen] = useState(false);
  const [alertModalState, setAlertModalState] = useState<{
    isOpen: boolean;
    student: Student | null;
    status: AttendanceStatus;
  }>({
    isOpen: false,
    student: null,
    status: 'absent',
  });

  const handleOpenDraftAlert = (student: Student, status: AttendanceStatus) => {
    setAlertModalState({
      isOpen: true,
      student,
      status,
    });
  };

  const handleCloseDraftAlert = () => {
    setAlertModalState({
      isOpen: false,
      student: null,
      status: 'absent',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Application Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenAiSummary={() => setIsAiSummaryOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'rollcall' && (
          <AttendanceRollCall
            onDraftAlert={handleOpenDraftAlert}
            onOpenAiSummary={() => setIsAiSummaryOpen(true)}
          />
        )}

        {currentTab === 'roster' && <StudentRosterView />}

        {currentTab === 'analytics' && <AnalyticsView />}

        {currentTab === 'alerts' && <AlertsLogView />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">AttendEase</span>
            <span>•</span>
            <span>Intuitive Classroom Attendance Management System</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
            >
              UI/UX Rationale & Code Walkthrough
            </button>
            <span>•</span>
            <span>Powered by Gemini 3.8 Flash</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ParentAlertModal
        isOpen={alertModalState.isOpen}
        onClose={handleCloseDraftAlert}
        student={alertModalState.student}
        status={alertModalState.status}
      />

      <AiSummaryModal
        isOpen={isAiSummaryOpen}
        onClose={() => setIsAiSummaryOpen(false)}
      />

      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AttendanceProvider>
      <AttendanceApp />
    </AttendanceProvider>
  );
}
