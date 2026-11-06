import React, { useState, useMemo } from 'react';
import { 
  Student, 
  Course, 
  LeaveRequest, 
  TimetableEntry,
  AttendanceHistoryEntry 
} from '../../types/attendance';
import { 
  STUDENT_COURSES_MAP, 
  ROHAN_TIMETABLE, 
  RECENT_ATTENDANCE_LOGS 
} from '../../data/mockData';
import { 
  Calculator, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileText, 
  ChevronRight, 
  BookOpen, 
  ArrowRight, 
  Send, 
  Sparkles,
  Info,
  CalendarCheck,
  User,
  ShieldCheck,
  Sliders
} from 'lucide-react';

interface StudentPortalProps {
  students: Student[];
  currentStudentRoll: string;
  onSelectStudentRoll: (roll: string) => void;
  leaveRequests: LeaveRequest[];
  onAddLeaveRequest: (req: LeaveRequest) => void;
  onNavigateToRecovery: () => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  students,
  currentStudentRoll,
  onSelectStudentRoll,
  leaveRequests,
  onAddLeaveRequest,
  onNavigateToRecovery,
}) => {
  // Active student object
  const currentStudent = useMemo(() => {
    return students.find((s) => s.rollNo === currentStudentRoll) || students[5]; // Rohan Verma default
  }, [students, currentStudentRoll]);

  // Courses for this student
  const courses = useMemo(() => {
    return STUDENT_COURSES_MAP[currentStudent.id] || STUDENT_COURSES_MAP['s-106'];
  }, [currentStudent]);

  // Tab State inside Student Portal
  const [activeTab, setActiveTab] = useState<'overview' | 'calculator' | 'timetable' | 'leaves'>('overview');

  // Interactive Target / Bunk Calculator State
  const [selectedCourseForCalc, setSelectedCourseForCalc] = useState<string>('overall');
  const [calcMode, setCalcMode] = useState<'attend_needed' | 'can_skip'>('can_skip');
  const [targetPercentage, setTargetPercentage] = useState<number>(75);

  // Subject History Modal
  const [viewHistoryCourse, setViewHistoryCourse] = useState<Course | null>(null);

  // Apply Leave Modal State
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);
  const [leaveType, setLeaveType] = useState<'medical' | 'on_duty' | 'casual' | 'sports'>('medical');
  const [leaveFrom, setLeaveFrom] = useState('2026-11-09');
  const [leaveTo, setLeaveTo] = useState('2026-11-10');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveSuccessToast, setLeaveSuccessToast] = useState(false);

  // Derive attendance values for calculator
  const activeAttended = useMemo(() => {
    if (selectedCourseForCalc === 'overall') {
      return currentStudent.attendedClasses;
    }
    const c = courses.find((item) => item.code === selectedCourseForCalc);
    return c ? c.attended : currentStudent.attendedClasses;
  }, [selectedCourseForCalc, currentStudent, courses]);

  const activeTotal = useMemo(() => {
    if (selectedCourseForCalc === 'overall') {
      return currentStudent.totalClasses;
    }
    const c = courses.find((item) => item.code === selectedCourseForCalc);
    return c ? c.totalHeld : currentStudent.totalClasses;
  }, [selectedCourseForCalc, currentStudent, courses]);

  const currentPercent = activeTotal > 0 ? (activeAttended / activeTotal) * 100 : 0;

  // Mathematical Calculation for Calculator
  // 1. If user wants to know how many they can miss:
  // (Attended) / (Total + x) >= Target% / 100
  // Attended >= (Target/100) * (Total + x)
  // Attended / (Target/100) >= Total + x
  // x = Math.floor(Attended / (Target/100) - Total)
  const canSkipClasses = useMemo(() => {
    const targetDecimal = targetPercentage / 100;
    if (currentPercent < targetPercentage) return 0;
    const maxTotal = activeAttended / targetDecimal;
    const skippable = Math.floor(maxTotal - activeTotal);
    return Math.max(0, skippable);
  }, [activeAttended, activeTotal, targetPercentage, currentPercent]);

  // 2. If user is below target or wants to know how many consecutive classes to attend:
  // (Attended + x) / (Total + x) >= Target% / 100
  // Attended + x >= (Target/100)*Total + (Target/100)*x
  // x * (1 - Target/100) >= (Target/100)*Total - Attended
  // x = Math.ceil( ((Target/100)*Total - Attended) / (1 - Target/100) )
  const attendNeeded = useMemo(() => {
    const targetDecimal = targetPercentage / 100;
    if (targetDecimal >= 1) return 999;
    if (currentPercent >= targetPercentage) return 0;
    const numerator = targetDecimal * activeTotal - activeAttended;
    const denominator = 1 - targetDecimal;
    return Math.max(0, Math.ceil(numerator / denominator));
  }, [activeAttended, activeTotal, targetPercentage, currentPercent]);

  // Student specific leave requests
  const studentLeaves = leaveRequests.filter(
    (l) => l.studentId === currentStudent.id || l.rollNo === currentStudent.rollNo
  );

  // Submit Leave Handler
  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason.trim()) return;

    const fromD = new Date(leaveFrom);
    const toD = new Date(leaveTo);
    const diffTime = Math.abs(toD.getTime() - fromD.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const newReq: LeaveRequest = {
      id: `lv-${Date.now()}`,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      rollNo: currentStudent.rollNo,
      department: 'CSE',
      type: leaveType,
      fromDate: leaveFrom,
      toDate: leaveTo,
      daysCount: diffDays,
      reason: leaveReason,
      documentName: `${leaveType}_supporting_doc_${currentStudent.rollNo}.pdf`,
      status: 'pending',
      submittedAt: 'Just now',
    };

    onAddLeaveRequest(newReq);
    setShowLeaveModal(false);
    setLeaveReason('');
    setLeaveSuccessToast(true);
    setTimeout(() => setLeaveSuccessToast(false), 5000);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Student Profile & Context Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-sm shadow-indigo-200">
              {currentStudent.avatarInitials}
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span>{currentStudent.department}</span>
                <span aria-hidden="true">·</span>
                <span>Semester {currentStudent.semester}</span>
                <span aria-hidden="true">·</span>
                <span>{currentStudent.section}</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
                {currentStudent.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-1">
                <span>Roll No: <strong className="font-mono text-slate-800">{currentStudent.rollNo}</strong></span>
                <span aria-hidden="true">·</span>
                <span>Advisor: Prof. Arvind Sharma</span>
                <span aria-hidden="true">·</span>
                <button
                  onClick={onNavigateToRecovery}
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Manage Password / Security
                </button>
              </div>
            </div>
          </div>

          {/* Preset Student Switcher for Prototype Evaluation */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="text-xs">
              <span className="font-semibold text-slate-700 block">Switch Student Profile:</span>
              <span className="text-[11px] text-slate-500">Test different attendance scenarios</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onSelectStudentRoll('21BCE1429')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  currentStudent.rollNo === '21BCE1429'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Rohan (78.3% Safe)
              </button>
              <button
                onClick={() => onSelectStudentRoll('21BCE1404')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  currentStudent.rollNo === '21BCE1404'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Aryan (69.4% Defaulter)
              </button>
              <button
                onClick={() => onSelectStudentRoll('21BCE1462')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  currentStudent.rollNo === '21BCE1462'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Sneha (92.8% Honor)
              </button>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100 overflow-x-auto">
          {[
            { id: 'overview', label: 'Attendance Breakdown' },
            { id: 'calculator', label: 'Bunk & Target Calculator', icon: <Calculator className="w-3.5 h-3.5" /> },
            { id: 'timetable', label: 'Weekly Timetable & Classes', icon: <Calendar className="w-3.5 h-3.5" /> },
            { id: 'leaves', label: 'Leave & Medical Claims', count: studentLeaves.length },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* LEAVE SUBMISSION TOAST */}
      {leaveSuccessToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Leave / OD Application Transmitted</p>
              <p className="text-xs text-emerald-700">
                Your request has been routed to Prof. Arvind Sharma and the CSE Attendance Committee. Check status in the Claims tab.
              </p>
            </div>
          </div>
          <button
            onClick={() => setLeaveSuccessToast(false)}
            className="text-xs text-emerald-800 hover:text-emerald-950 font-medium px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: OVERVIEW & ATTENDANCE BREAKDOWN */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Main Status & Metric Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Overall Percentage Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 relative overflow-hidden">
              <span className="text-xs text-slate-500 font-medium">Cumulative Attendance</span>
              <div className="flex items-baseline gap-3 mt-2">
                <span
                  className={`text-4xl font-bold font-mono tracking-tight tabular-nums ${
                    currentStudent.overallPercentage < 75
                      ? 'text-rose-600'
                      : currentStudent.overallPercentage < 80
                      ? 'text-amber-600'
                      : 'text-emerald-700'
                  }`}
                >
                  {currentStudent.overallPercentage.toFixed(1)}%
                </span>
                <span className="text-xs text-slate-500 font-mono tabular-nums">
                  ({currentStudent.attendedClasses} / {currentStudent.totalClasses} classes)
                </span>
              </div>

              <div className="mt-4 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    currentStudent.overallPercentage < 75
                      ? 'bg-rose-500'
                      : currentStudent.overallPercentage < 80
                      ? 'bg-amber-500'
                      : 'bg-emerald-600'
                  }`}
                  style={{ width: `${Math.min(100, currentStudent.overallPercentage)}%` }}
                ></div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Threshold: 75.0%</span>
                <span>Buffer Target: 80.0%</span>
              </div>
            </div>

            {/* Exam Eligibility Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Semester Exam Eligibility</span>
              <div className="mt-2">
                {currentStudent.overallPercentage >= 75 ? (
                  <div className="flex items-start gap-2.5 text-emerald-800">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-base font-bold text-emerald-900">Eligible to Appear</h4>
                      <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                        Meets the mandatory university regulation (Clause 4.1). Hall ticket will be generated automatically.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2.5 text-rose-800">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-base font-bold text-rose-900">Debarment Alert</h4>
                      <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                        Currently { (75 - currentStudent.overallPercentage).toFixed(1) }% below cutoff. Submit medical proofs or attend upcoming makeup classes.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">End-Term Exams: Dec 14, 2026</span>
              </div>
            </div>

            {/* Smart Buffer / Skip Margin Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Attendance Safety Buffer</span>
              <div className="mt-2">
                {currentStudent.overallPercentage >= 75 ? (
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold font-mono text-indigo-700 tracking-tight tabular-nums">
                        {canSkipClasses}
                      </span>
                      <span className="text-xs text-slate-600">classes can be safely missed</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      You will remain above 75.0% if you miss up to {canSkipClasses} classes across all courses.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold font-mono text-rose-600 tracking-tight tabular-nums">
                        +{attendNeeded}
                      </span>
                      <span className="text-xs text-rose-800">consecutive classes needed</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Attend the next {attendNeeded} classes continuously with zero absence to regain 75% exam qualification.
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setActiveTab('calculator')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  Open Simulator &rarr;
                </button>
              </div>
            </div>
          </div>

          {/* Course-Wise Detailed Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Enrolled Subject Breakdown</h3>
                <p className="text-xs text-slate-500">Attendance percentages calculated from faculty registry records</p>
              </div>
              <button
                onClick={() => setShowLeaveModal(true)}
                className="px-3.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Apply for Leave / OD</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4">Faculty In-Charge</th>
                    <th className="py-3 px-4 text-center">Conducted</th>
                    <th className="py-3 px-4 text-center">Attended</th>
                    <th className="py-3 px-4 text-center">Absent</th>
                    <th className="py-3 px-4 text-right">Percentage</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">History</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {courses.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{c.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {c.code} · {c.credits} Credits · {c.room}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        <span>{c.facultyName}</span>
                        <span className="block text-[11px] text-slate-500">{c.scheduleTime}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-800">
                        {c.totalHeld}
                      </td>
                      <td className="py-3 px-4 text-center font-mono tabular-nums font-semibold text-emerald-700">
                        {c.attended}
                      </td>
                      <td className="py-3 px-4 text-center font-mono tabular-nums text-rose-600">
                        {c.absent}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                        <span
                          className={
                            c.percentage < 75
                              ? 'text-rose-600'
                              : c.percentage < 80
                              ? 'text-amber-600'
                              : 'text-emerald-700'
                          }
                        >
                          {c.percentage.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {c.percentage < 75 ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            Critical
                          </span>
                        ) : c.percentage < 80 ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Warning
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Good
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setViewHistoryCourse(c)}
                          className="px-2.5 py-1 text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded font-medium transition-colors"
                        >
                          View Logs
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE BUNK & TARGET CALCULATOR */}
      {activeTab === 'calculator' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <Calculator className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900">Attendance Target & Bunk Simulator</h3>
                <p className="text-xs text-slate-500">
                  Plan your attendance safely without risk of debarment or penalty.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
              {/* Left Column: Controls */}
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Subject Scope
                  </label>
                  <select
                    value={selectedCourseForCalc}
                    onChange={(e) => setSelectedCourseForCalc(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-medium text-slate-900"
                  >
                    <option value="overall">Cumulative (All Subjects Combined)</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.code}>
                        {c.code} - {c.name} ({c.percentage.toFixed(1)}%)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    What would you like to calculate?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCalcMode('can_skip')}
                      className={`p-3 rounded-lg border text-xs font-semibold text-left transition-all ${
                        calcMode === 'can_skip'
                          ? 'bg-indigo-50 border-indigo-400 text-indigo-900'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="block font-bold">How many can I skip?</span>
                      <span className="text-[11px] font-normal text-slate-500 mt-1 block">
                        Find your maximum safe leave allowance
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalcMode('attend_needed')}
                      className={`p-3 rounded-lg border text-xs font-semibold text-left transition-all ${
                        calcMode === 'attend_needed'
                          ? 'bg-indigo-50 border-indigo-400 text-indigo-900'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="block font-bold">How many must I attend?</span>
                      <span className="text-[11px] font-normal text-slate-500 mt-1 block">
                        Find classes needed to reach a higher target
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Target Percentage Goal: <span className="font-mono text-indigo-600 font-bold">{targetPercentage}%</span>
                    </label>
                    <span className="text-[11px] text-slate-400">Drag slider or pick preset</span>
                  </div>

                  <input
                    type="range"
                    min="65"
                    max="95"
                    step="1"
                    value={targetPercentage}
                    onChange={(e) => setTargetPercentage(Number(e.target.value))}
                    className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />

                  <div className="flex items-center gap-2 mt-3">
                    {[
                      { val: 75, label: '75% (Min Exam Cutoff)' },
                      { val: 80, label: '80% (Safe Buffer)' },
                      { val: 85, label: '85% (Scholarship)' },
                      { val: 90, label: '90% (Honor Roll)' },
                    ].map((preset) => (
                      <button
                        key={preset.val}
                        onClick={() => setTargetPercentage(preset.val)}
                        className={`px-2 py-1 text-[11px] font-medium rounded transition-colors ${
                          targetPercentage === preset.val
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
                  <p>
                    <strong>Current Baseline:</strong> {activeAttended} attended out of {activeTotal} conducted ({currentPercent.toFixed(1)}%).
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Calculated using standard university formula with zero rounding inflation.
                  </p>
                </div>
              </div>

              {/* Right Column: Simulation Result Display */}
              <div className="bg-slate-900 text-white rounded-xl p-6 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                    Live Simulation Result
                  </span>

                  {calcMode === 'can_skip' ? (
                    <div className="mt-4">
                      {currentPercent >= targetPercentage ? (
                        <>
                          <div className="text-5xl font-extrabold font-mono tracking-tight text-emerald-400 tabular-nums">
                            {canSkipClasses}
                          </div>
                          <p className="text-base font-semibold text-slate-200 mt-2">
                            Classes you can safely miss
                          </p>
                          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                            If you skip the next <strong>{canSkipClasses}</strong> consecutive classes, your attendance will settle at{' '}
                            <strong>
                              {((activeAttended / (activeTotal + canSkipClasses)) * 100).toFixed(1)}%
                            </strong>
                            , keeping you strictly above your {targetPercentage}% goal.
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="text-5xl font-extrabold font-mono tracking-tight text-rose-400 tabular-nums">
                            0
                          </div>
                          <p className="text-base font-semibold text-slate-200 mt-2">
                            Cannot skip any classes
                          </p>
                          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                            Your current attendance ({currentPercent.toFixed(1)}%) is currently below your target of {targetPercentage}%. You have zero buffer to miss classes.
                          </p>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="mt-4">
                      {currentPercent >= targetPercentage ? (
                        <>
                          <div className="text-5xl font-extrabold font-mono tracking-tight text-emerald-400 tabular-nums">
                            Goal Met!
                          </div>
                          <p className="text-base font-semibold text-slate-200 mt-2">
                            Already above {targetPercentage}%
                          </p>
                          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                            Your current attendance is {currentPercent.toFixed(1)}%, which exceeds your target of {targetPercentage}%.
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="text-5xl font-extrabold font-mono tracking-tight text-amber-400 tabular-nums">
                            +{attendNeeded}
                          </div>
                          <p className="text-base font-semibold text-slate-200 mt-2">
                            Consecutive classes needed
                          </p>
                          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                            You must attend the next <strong>{attendNeeded}</strong> classes in a row with zero absence to elevate your attendance to{' '}
                            <strong>
                              {(((activeAttended + attendNeeded) / (activeTotal + attendNeeded)) * 100).toFixed(1)}%
                            </strong>
                            , surpassing your {targetPercentage}% target.
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400">
                  <span>
                    Formula: (Attended + x) / (Total + x) &ge; {targetPercentage / 100}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WEEKLY TIMETABLE */}
      {activeTab === 'timetable' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Weekly Lecture & Lab Schedule</h3>
                <p className="text-xs text-slate-500">Section A timetable with automated check-in registry</p>
              </div>
              <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2.5 py-1 rounded-md">
                Semester V
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {ROHAN_TIMETABLE.map((entry, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors bg-white"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-700">{entry.day} · Period {entry.period}</span>
                    {entry.status === 'attended' ? (
                      <span className="px-2 py-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-100 rounded">
                        Attended
                      </span>
                    ) : entry.status === 'completed' ? (
                      <span className="px-2 py-0.5 text-[10px] font-semibold text-slate-700 bg-slate-100 rounded">
                        Conducted
                      </span>
                    ) : entry.status === 'missed' ? (
                      <span className="px-2 py-0.5 text-[10px] font-semibold text-rose-700 bg-rose-100 rounded">
                        Absent
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-semibold text-amber-700 bg-amber-100 rounded">
                        Upcoming
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mt-2">{entry.courseName}</h4>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{entry.courseCode} · {entry.room}</p>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{entry.timeSlot}</span>
                    </span>
                    <span className="text-[11px] text-slate-500">{entry.faculty.split(' ')[1]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LEAVE & MEDICAL CLAIMS */}
      {activeTab === 'leaves' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Your Leave & On-Duty Applications</h3>
                <p className="text-xs text-slate-500">
                  Approved leaves are officially credited as excused attendance in faculty records.
                </p>
              </div>
              <button
                onClick={() => setShowLeaveModal(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <FileText className="w-4 h-4" />
                <span>New Leave / OD Application</span>
              </button>
            </div>

            {studentLeaves.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-medium text-slate-700">No leave applications on file</p>
                <p className="mt-1">Apply for medical excuse or hackathon On-Duty using the button above.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 mt-4">
                {studentLeaves.map((req) => (
                  <div key={req.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="capitalize font-bold text-slate-900">
                          {req.type.replace('_', ' ')} Leave
                        </span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="text-slate-500 font-mono">
                          {req.fromDate} to {req.toDate} ({req.daysCount} days)
                        </span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="text-slate-400 text-[11px]">{req.submittedAt}</span>
                      </div>
                      <p className="text-xs text-slate-700">"{req.reason}"</p>
                      {req.documentName && (
                        <p className="text-[11px] text-indigo-600 font-medium">
                          Attached proof: {req.documentName}
                        </p>
                      )}
                      {req.remarks && (
                        <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-200 mt-1">
                          <strong>Dept Remarks:</strong> {req.remarks}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0">
                      {req.status === 'approved' ? (
                        <span className="px-3 py-1 text-xs font-semibold text-emerald-800 bg-emerald-100 rounded-lg flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approved & Credited</span>
                        </span>
                      ) : req.status === 'pending' ? (
                        <span className="px-3 py-1 text-xs font-semibold text-amber-800 bg-amber-100 rounded-lg flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Under Faculty Review</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs font-semibold text-rose-800 bg-rose-100 rounded-lg flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Rejected</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: APPLY FOR LEAVE MODAL */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Submit Leave / On-Duty Request</h3>
              </div>
              <button
                onClick={() => setShowLeaveModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Leave Category
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-medium text-slate-900"
                >
                  <option value="medical">Medical Illness (Doctor's Note Attached)</option>
                  <option value="on_duty">On-Duty / Hackathon / Conference</option>
                  <option value="sports">University Sports / Athletic Event</option>
                  <option value="casual">Casual / Emergency Family Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={leaveFrom}
                    onChange={(e) => setLeaveFrom(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={leaveTo}
                    onChange={(e) => setLeaveTo(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reason & Description
                </label>
                <textarea
                  rows={3}
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="Detail the cause of absence and attach supporting medical prescription or invitation letter..."
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-medium text-slate-900"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-center">
                <FileText className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <span className="text-[11px] text-slate-600 block">
                  Simulated File Attached: <strong>{leaveType}_doc_{currentStudent.rollNo}.pdf</strong>
                </span>
                <span className="text-[10px] text-slate-400">Accepted formats: PDF, JPG up to 5MB</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit to Faculty In-charge</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: COURSE ATTENDANCE HISTORY LOGS */}
      {viewHistoryCourse && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">{viewHistoryCourse.name}</h3>
                <p className="text-xs text-slate-500">
                  {viewHistoryCourse.code} · {viewHistoryCourse.facultyName}
                </p>
              </div>
              <button
                onClick={() => setViewHistoryCourse(null)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                &times;
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg mt-3 flex items-center justify-between text-xs">
              <span>Overall in this subject:</span>
              <span className="font-mono font-bold text-indigo-700">
                {viewHistoryCourse.attended} / {viewHistoryCourse.totalHeld} classes ({viewHistoryCourse.percentage.toFixed(1)}%)
              </span>
            </div>

            <div className="mt-4 space-y-2 max-h-72 overflow-y-auto pr-1 text-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Recent Class Sessions:
              </span>
              {RECENT_ATTENDANCE_LOGS.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-lg border border-slate-200 bg-white flex items-start justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-900">{log.date} · {log.period}</div>
                    <p className="text-[11px] text-slate-600">{log.topic}</p>
                    <span className="text-[10px] text-slate-400">Marked by {log.facultyName}</span>
                  </div>
                  <div>
                    {log.status === 'present' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Present
                      </span>
                    ) : log.status === 'absent' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                        Absent
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                        Excused
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-right">
              <button
                onClick={() => setViewHistoryCourse(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
