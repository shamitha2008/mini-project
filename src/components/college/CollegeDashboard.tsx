import React, { useState } from 'react';
import { 
  Student, 
  LeaveRequest, 
  ClassSession, 
  AttendanceStatus 
} from '../../types/attendance';
import { CURRENT_FACULTY } from '../../data/mockData';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Download, 
  Search, 
  Send, 
  Calendar, 
  Sparkles,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  Building2,
  BookOpen
} from 'lucide-react';

interface CollegeDashboardProps {
  students: Student[];
  onUpdateStudents: (updated: Student[]) => void;
  leaveRequests: LeaveRequest[];
  onUpdateLeaveRequests: (updated: LeaveRequest[]) => void;
  onNavigateToStudent: (studentRoll: string) => void;
}

export const CollegeDashboard: React.FC<CollegeDashboardProps> = ({
  students,
  onUpdateStudents,
  leaveRequests,
  onUpdateLeaveRequests,
  onNavigateToStudent,
}) => {
  // Navigation tabs within dashboard
  const [activeTab, setActiveTab] = useState<'overview' | 'mark' | 'defaulters' | 'leaves' | 'reports'>('overview');

  // Mark Attendance State
  const [selectedCourse, setSelectedCourse] = useState('CS301');
  const [selectedPeriod, setSelectedPeriod] = useState('Period 2 (10:00 AM - 11:00 AM)');
  const [selectedDate, setSelectedDate] = useState('2026-11-05');
  const [attendanceSheet, setAttendanceSheet] = useState<Record<string, AttendanceStatus>>(() => {
    // Default initial attendance state
    const initial: Record<string, AttendanceStatus> = {};
    students.forEach((s) => {
      // Default based on student's current status for realistic feel
      if (s.status === 'critical') {
        initial[s.id] = 'absent';
      } else {
        initial[s.id] = 'present';
      }
    });
    return initial;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterThreshold, setFilterThreshold] = useState<'all' | 'critical' | 'warning' | 'safe'>('all');
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [lastSubmittedTime, setLastSubmittedTime] = useState<string | null>(null);

  // Defaulter Warning Notice Modal
  const [noticeStudent, setNoticeStudent] = useState<Student | null>(null);
  const [noticeSentToast, setNoticeSentToast] = useState(false);

  // Leave Document Preview Modal
  const [previewLeave, setPreviewLeave] = useState<LeaveRequest | null>(null);

  // Today's classes sessions
  const [sessions, setSessions] = useState<ClassSession[]>([
    {
      id: 'ses-1',
      courseCode: 'CS301',
      courseName: 'Data Structures & Algorithms',
      section: '5th Sem · Sec A',
      period: 2,
      timeSlot: '10:00 AM – 11:00 AM',
      room: 'LT-302',
      date: 'Today',
      faculty: CURRENT_FACULTY.name,
      isMarked: false,
      presentCount: 0,
      totalStudents: students.length,
    },
    {
      id: 'ses-2',
      courseCode: 'CS303',
      courseName: 'Operating Systems & Kernels',
      section: '5th Sem · Sec A',
      period: 3,
      timeSlot: '11:30 AM – 12:30 PM',
      room: 'LT-105',
      date: 'Today',
      faculty: 'Prof. K. Ramanathan',
      isMarked: true,
      markedAt: '12:35 PM by Prof. K. Ramanathan',
      presentCount: 16,
      totalStudents: students.length,
    },
    {
      id: 'ses-3',
      courseCode: 'CS306P',
      courseName: 'Advanced Web & Cloud Lab',
      section: '5th Sem · Sec A Batch 1',
      period: 5,
      timeSlot: '02:00 PM – 04:30 PM',
      room: 'Lab 4, Block B',
      date: 'Today',
      faculty: CURRENT_FACULTY.name,
      isMarked: false,
      presentCount: 0,
      totalStudents: students.length,
    },
  ]);

  // Derived Metrics
  const totalStudents = students.length;
  const criticalCount = students.filter((s) => s.overallPercentage < 75).length;
  const warningCount = students.filter((s) => s.overallPercentage >= 75 && s.overallPercentage < 80).length;
  const safeCount = students.filter((s) => s.overallPercentage >= 80).length;
  
  const aggregatePercentage = (
    students.reduce((acc, curr) => acc + curr.overallPercentage, 0) / totalStudents
  ).toFixed(1);

  const pendingLeaves = leaveRequests.filter((l) => l.status === 'pending');

  // Attendance Sheet Calculations
  const presentCountInSheet = Object.values(attendanceSheet).filter((v) => v === 'present').length;
  const absentCountInSheet = Object.values(attendanceSheet).filter((v) => v === 'absent').length;
  const lateCountInSheet = Object.values(attendanceSheet).filter((v) => v === 'late').length;
  const excusedCountInSheet = Object.values(attendanceSheet).filter((v) => v === 'excused').length;
  const sheetPercentage = ((presentCountInSheet / totalStudents) * 100).toFixed(1);

  // Bulk Actions for Attendance
  const handleMarkAll = (status: AttendanceStatus) => {
    const next: Record<string, AttendanceStatus> = {};
    students.forEach((s) => {
      next[s.id] = status;
    });
    setAttendanceSheet(next);
  };

  const handleToggleStudent = (studentId: string, status: AttendanceStatus) => {
    setAttendanceSheet((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSubmitAttendance = () => {
    // Update students count
    const updated = students.map((s) => {
      const mark = attendanceSheet[s.id];
      const newTotal = s.totalClasses + 1;
      const newAttended = mark === 'present' || mark === 'late' || mark === 'excused' 
        ? s.attendedClasses + 1 
        : s.attendedClasses;
      const newPct = Number(((newAttended / newTotal) * 100).toFixed(1));
      let newStatus: 'safe' | 'warning' | 'critical' = 'safe';
      if (newPct < 75) newStatus = 'critical';
      else if (newPct < 80) newStatus = 'warning';

      return {
        ...s,
        totalClasses: newTotal,
        attendedClasses: newAttended,
        overallPercentage: newPct,
        status: newStatus,
      };
    });

    onUpdateStudents(updated);

    // Update sessions
    setSessions((prev) =>
      prev.map((ses) =>
        ses.courseCode === selectedCourse
          ? {
              ...ses,
              isMarked: true,
              markedAt: `Just now by ${CURRENT_FACULTY.name}`,
              presentCount: presentCountInSheet,
            }
          : ses
      )
    );

    setLastSubmittedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setSubmissionSuccess(true);
    setTimeout(() => setSubmissionSuccess(false), 5000);
  };

  // Leave Actions
  const handleLeaveDecision = (id: string, decision: 'approved' | 'rejected', remark: string) => {
    const updated = leaveRequests.map((l) =>
      l.id === id ? { ...l, status: decision, remarks: remark } : l
    );
    onUpdateLeaveRequests(updated);
    setPreviewLeave(null);
  };

  // Filtered Students for tables
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterThreshold === 'all') return true;
    return s.status === filterThreshold;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Faculty Hero & Department Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Department of Computer Science & Engineering</span>
              <span aria-hidden="true">·</span>
              <span>Semester V</span>
              <span aria-hidden="true">·</span>
              <span>Academic Year 2026–27</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              College Attendance Dashboard
            </h1>
            <p className="text-sm text-slate-600">
              Logged in as <strong className="text-slate-800">{CURRENT_FACULTY.name}</strong> ({CURRENT_FACULTY.designation}) · Office: {CURRENT_FACULTY.office}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('mark')}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2 shadow-xs"
            >
              <Calendar className="w-4 h-4" />
              <span>Mark Today's Attendance</span>
            </button>
            <button
              onClick={() => setActiveTab('defaulters')}
              className="px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Defaulters List ({criticalCount})</span>
            </button>
          </div>
        </div>

        {/* Tab Sub-Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview & Live Roster' },
            { id: 'mark', label: 'Daily Attendance Console', badge: 'Active' },
            { id: 'defaulters', label: `Defaulters Radar (<75%)`, count: criticalCount },
            { id: 'leaves', label: 'Leave & Medical Approvals', count: pendingLeaves.length },
            { id: 'reports', label: 'Reports & Export' },
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
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'
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

      {/* SUCCESS TOAST BANNER */}
      {submissionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Attendance Successfully Logged to University Registrar</p>
              <p className="text-xs text-emerald-700">
                Session {selectedCourse} ({selectedPeriod}) recorded at {lastSubmittedTime}. Roll records and percentages updated for {totalStudents} students.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSubmissionSuccess(false)}
            className="text-xs text-emerald-800 hover:text-emerald-950 font-medium px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: OVERVIEW & LIVE ROSTER */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Institutional KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Batch Attendance Rate</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-bold font-mono text-slate-900 tracking-tight tabular-nums">
                  {aggregatePercentage}%
                </span>
                <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                  +1.4% vs last week
                </span>
              </div>
              <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-1.5 rounded-full"
                  style={{ width: `${aggregatePercentage}%` }}
                ></div>
              </div>
              <span className="text-[11px] text-slate-400 mt-2 block">
                University exam qualifying threshold: 75.0%
              </span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Today's Class Sessions</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-bold font-mono text-slate-900 tracking-tight tabular-nums">
                  3 / 3
                </span>
                <span className="text-xs text-indigo-600 font-medium">
                  {sessions.filter((s) => s.isMarked).length} Recorded
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-3">
                CS301 & CS306P under your supervision today.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Critical Defaulters (&lt;75%)</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-bold font-mono text-rose-600 tracking-tight tabular-nums">
                  {criticalCount}
                </span>
                <button
                  onClick={() => setActiveTab('defaulters')}
                  className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-0.5"
                >
                  View Defaulters <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Students debarred from Semester End Examinations if unchanged.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Pending Leave & OD Claims</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-bold font-mono text-slate-900 tracking-tight tabular-nums">
                  {pendingLeaves.length}
                </span>
                <button
                  onClick={() => setActiveTab('leaves')}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-0.5"
                >
                  Review Desk <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-3">
                1 medical cert, 1 sports OD pending verification.
              </p>
            </div>
          </div>

          {/* Today's Schedule & Quick Attendance Status */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Today's Scheduled Sessions</h2>
                <p className="text-xs text-slate-500">Section A timetable for Thursday, November 5, 2026</p>
              </div>
              <span className="text-xs text-slate-500">Live Period Status</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {sessions.map((ses) => (
                <div
                  key={ses.id}
                  className={`p-4 rounded-xl border transition-all ${
                    ses.isMarked
                      ? 'bg-slate-50/70 border-slate-200'
                      : 'bg-indigo-50/40 border-indigo-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-semibold text-indigo-700">{ses.courseCode}</span>
                      <h3 className="text-sm font-semibold text-slate-900 mt-0.5">{ses.courseName}</h3>
                      <p className="text-xs text-slate-500 mt-1">{ses.timeSlot} · {ses.room}</p>
                    </div>
                    {ses.isMarked ? (
                      <span className="px-2 py-0.5 text-[11px] font-semibold text-emerald-700 bg-emerald-100 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Submitted</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[11px] font-semibold text-amber-700 bg-amber-100 rounded-md flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Pending</span>
                      </span>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="text-slate-600">
                      {ses.isMarked
                        ? `Present: ${ses.presentCount} / ${ses.totalStudents}`
                        : `Faculty: ${ses.faculty}`}
                    </span>
                    {!ses.isMarked && (
                      <button
                        onClick={() => {
                          setSelectedCourse(ses.courseCode);
                          setSelectedPeriod(`Period ${ses.period} (${ses.timeSlot})`);
                          setActiveTab('mark');
                        }}
                        className="font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        Take Attendance &rarr;
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Student Cohort Master Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Cohort Attendance Roster</h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span>Total Enrolled: {totalStudents}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-700 font-medium">Safe (&ge;80%): {safeCount}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-amber-700 font-medium">Warning (75-80%): {warningCount}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-rose-700 font-medium">Critical (&lt;75%): {criticalCount}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by name or roll number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 w-56 sm:w-64"
                  />
                </div>
                <select
                  value={filterThreshold}
                  onChange={(e) => setFilterThreshold(e.target.value as any)}
                  className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700"
                >
                  <option value="all">All Statuses</option>
                  <option value="critical">Critical (&lt;75%)</option>
                  <option value="warning">Warning (75-79%)</option>
                  <option value="safe">Safe (&ge;80%)</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-3 px-4">Roll Number</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4 text-right">Attended / Total</th>
                    <th className="py-3 px-4 text-right">Percentage</th>
                    <th className="py-3 px-4 text-center">Eligibility Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">
                        {st.rollNo}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[11px]">
                            {st.avatarInitials}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900">{st.name}</span>
                            <span className="block text-[11px] text-slate-500">{st.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                        {st.attendedClasses} / {st.totalClasses}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                        <span
                          className={
                            st.status === 'critical'
                              ? 'text-rose-600'
                              : st.status === 'warning'
                              ? 'text-amber-600'
                              : 'text-emerald-700'
                          }
                        >
                          {st.overallPercentage.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {st.status === 'critical' ? (
                          <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            Debarred (&lt;75%)
                          </span>
                        ) : st.status === 'warning' ? (
                          <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Warning Zone
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Exam Eligible
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onNavigateToStudent(st.rollNo)}
                            className="px-2.5 py-1 text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded font-medium transition-colors"
                            title="Open Student Portal"
                          >
                            View as Student
                          </button>
                          {st.status === 'critical' && (
                            <button
                              onClick={() => setNoticeStudent(st)}
                              className="px-2 py-1 text-xs text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 rounded font-medium transition-colors"
                              title="Draft Parent Warning Notice"
                            >
                              Issue Notice
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MARK DAILY ATTENDANCE CONSOLE */}
      {activeTab === 'mark' && (
        <div className="space-y-6">
          {/* Attendance Session Controls */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject / Course
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-medium text-slate-900"
                >
                  <option value="CS301">CS301 - Data Structures & Algorithms</option>
                  <option value="CS303">CS303 - Operating Systems & Kernels</option>
                  <option value="CS306P">CS306P - Advanced Web & Cloud Lab</option>
                  <option value="CS302">CS302 - Computer Networks</option>
                  <option value="CS304">CS304 - Database Management Systems</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Period & Time Slot
                </label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-medium text-slate-900"
                >
                  <option value="Period 2 (10:00 AM - 11:00 AM)">Period 2 (10:00 AM – 11:00 AM)</option>
                  <option value="Period 3 (11:30 AM - 12:30 PM)">Period 3 (11:30 AM – 12:30 PM)</option>
                  <option value="Period 5 (02:00 PM - 04:30 PM)">Period 5 (02:00 PM – 04:30 PM)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Attendance Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Section & Hall
                </label>
                <div className="px-3 py-2 text-xs bg-slate-100 text-slate-700 rounded-lg font-medium">
                  5th Sem · Sec A · Lecture Theatre 302
                </div>
              </div>
            </div>

            {/* Live Count Summary & Quick Mark Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-5 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3 text-xs">
                <span className="font-semibold text-slate-900">Current Session Tallies:</span>
                <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Present: {presentCountInSheet}
                </span>
                <span className="text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  Absent: {absentCountInSheet}
                </span>
                <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Late: {lateCountInSheet}
                </span>
                <span className="text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  Excused / OD: {excusedCountInSheet}
                </span>
                <span className="text-slate-500 font-mono">({sheetPercentage}% Present)</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMarkAll('present')}
                  className="px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors"
                >
                  Mark All Present
                </button>
                <button
                  onClick={() => handleMarkAll('absent')}
                  className="px-3 py-1.5 text-xs font-medium text-rose-800 bg-rose-100 hover:bg-rose-200 rounded-lg transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={handleSubmitAttendance}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit & Commit</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Attendance Roster */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Student Roll Call</h3>
                <p className="text-[11px] text-slate-500">
                  Click status buttons to toggle attendance for each student in {selectedCourse}.
                </p>
              </div>
              <span className="text-xs text-slate-500">18 Candidates in Batch</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-2.5 px-4">Roll No</th>
                    <th className="py-2.5 px-4">Student Name</th>
                    <th className="py-2.5 px-4 text-center">Semester Overall %</th>
                    <th className="py-2.5 px-4 text-center">Attendance Status for Selected Period</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((st) => {
                    const currentStatus = attendanceSheet[st.id] || 'present';
                    return (
                      <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-slate-900">
                          {st.rollNo}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{st.name}</div>
                          <div className="text-[11px] text-slate-500">{st.email}</div>
                        </td>
                        <td className="py-3 px-4 text-center font-mono tabular-nums font-semibold">
                          <span
                            className={
                              st.overallPercentage < 75
                                ? 'text-rose-600'
                                : st.overallPercentage < 80
                                ? 'text-amber-600'
                                : 'text-emerald-700'
                            }
                          >
                            {st.overallPercentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleToggleStudent(st.id, 'present')}
                              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                                currentStatus === 'present'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleStudent(st.id, 'absent')}
                              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                                currentStatus === 'absent'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              Absent
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleStudent(st.id, 'late')}
                              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                                currentStatus === 'late'
                                  ? 'bg-amber-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              Late
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleStudent(st.id, 'excused')}
                              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                                currentStatus === 'excused'
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              Excused / OD
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Logged under digital audit signature: {CURRENT_FACULTY.employeeId}
              </span>
              <button
                onClick={handleSubmitAttendance}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save & Submit Attendance</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DEFAULTER & AT-RISK RADAR (<75% THRESHOLD) */}
      {activeTab === 'defaulters' && (
        <div className="space-y-6">
          <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-rose-950">
                  University 75% Attendance Compliance Rule (Clause 4.1.b)
                </h3>
                <p className="text-xs text-rose-800 leading-relaxed">
                  Students below 75% aggregate attendance are disqualified from appearing in Semester End Examinations unless granted medical or condonation approval by the Academic Council.
                  Currently, <strong>{criticalCount} candidates</strong> are in the critical debarment zone.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Critical Defaulters List</h3>
                <p className="text-xs text-slate-500">Candidates requiring immediate counseling and parent notification</p>
              </div>
              <button
                onClick={() => {
                  alert('Defaulter list report generated and downloaded as CSV.');
                }}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Export Defaulter List (CSV)</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-3 px-4">Roll No</th>
                    <th className="py-3 px-4">Student & Contact</th>
                    <th className="py-3 px-4 text-right">Attended / Total</th>
                    <th className="py-3 px-4 text-right">Current %</th>
                    <th className="py-3 px-4 text-right">Shortfall to 75%</th>
                    <th className="py-3 px-4">Guardian Contact</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students
                    .filter((s) => s.overallPercentage < 75)
                    .map((st) => {
                      // Shortfall calculation:
                      // (Attended + x) / (Total + x) >= 0.75
                      // Attended + x >= 0.75*Total + 0.75*x
                      // 0.25*x >= 0.75*Total - Attended
                      // x = (0.75*Total - Attended) / 0.25
                      const target = 0.75;
                      const needed = Math.max(
                        0,
                        Math.ceil((target * st.totalClasses - st.attendedClasses) / (1 - target))
                      );

                      return (
                        <tr key={st.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {st.rollNo}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-900">{st.name}</span>
                            <span className="block text-[11px] text-slate-500">{st.phone}</span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                            {st.attendedClasses} / {st.totalClasses}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-rose-600">
                            {st.overallPercentage.toFixed(1)}%
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums">
                            <span className="text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              +{needed} classes
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            <span>{st.guardianName}</span>
                            <span className="block text-[11px] text-slate-500 font-mono">{st.guardianPhone}</span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setNoticeStudent(st)}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
                            >
                              Send Notice
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LEAVE & MEDICAL APPROVAL DESK */}
      {activeTab === 'leaves' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Student Leave & On-Duty (OD) Claims</h3>
                <p className="text-xs text-slate-500">
                  Verify medical certificates, institutional hackathon representation, and sports NOCs.
                </p>
              </div>
              <span className="text-xs font-medium text-slate-500">
                {leaveRequests.length} Total Applications
              </span>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {leaveRequests.map((leave) => (
                <div key={leave.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-900">{leave.studentName}</span>
                      <span className="font-mono text-slate-500">({leave.rollNo})</span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="capitalize px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {leave.type.replace('_', ' ')}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="text-slate-500">{leave.submittedAt}</span>
                    </div>

                    <p className="text-xs text-slate-700">
                      <strong>Dates:</strong> {leave.fromDate} to {leave.toDate} ({leave.daysCount} days)
                    </p>
                    <p className="text-xs text-slate-600 italic">"{leave.reason}"</p>

                    {leave.documentName && (
                      <div className="flex items-center gap-1.5 text-[11px] text-indigo-600 font-medium">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Attached: {leave.documentName}</span>
                      </div>
                    )}

                    {leave.remarks && (
                      <p className="text-[11px] text-slate-500 mt-1">
                        <strong>Faculty Note:</strong> {leave.remarks}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {leave.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => setPreviewLeave(leave)}
                          className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          Review Slip
                        </button>
                        <button
                          onClick={() => handleLeaveDecision(leave.id, 'approved', 'Approved by Dept Head')}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleLeaveDecision(leave.id, 'rejected', 'Inadequate documentation')}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    ) : leave.status === 'approved' ? (
                      <span className="px-3 py-1 text-xs font-semibold text-emerald-800 bg-emerald-100 rounded-lg flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approved</span>
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
          </div>
        </div>
      )}

      {/* TAB 5: REPORTS & EXPORT */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-base font-bold text-slate-900">Attendance Register & Accreditation Reports</h3>
            <p className="text-xs text-slate-500 mt-1">
              Generate standardized NBA / NAAC compliance attendance reports, monthly rolls, and semester grade sheet records.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors">
                <FileText className="w-6 h-6 text-indigo-600 mb-2" />
                <h4 className="text-sm font-semibold text-slate-900">Monthly Attendance Register</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Full day-by-day P/A matrix for all 18 enrolled students for October–November 2026.
                </p>
                <button
                  onClick={() => alert('Monthly Register downloaded as CSV/Excel.')}
                  className="mt-4 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Register</span>
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors">
                <ShieldAlert className="w-6 h-6 text-rose-600 mb-2" />
                <h4 className="text-sm font-semibold text-slate-900">Debarred Students Dossier</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Official dean submission list with parent contact, shortfall hours, and warning dispatch timestamps.
                </p>
                <button
                  onClick={() => alert('Debarred dossier downloaded.')}
                  className="mt-4 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Generate Dossier</span>
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors">
                <Building2 className="w-6 h-6 text-emerald-600 mb-2" />
                <h4 className="text-sm font-semibold text-slate-900">NAAC / NIRF Audit Log</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Tamper-evident timestamped digital record of faculty submissions and condonations.
                </p>
                <button
                  onClick={() => alert('Audit report downloaded.')}
                  className="mt-4 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Audit PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: NOTICE DISPATCH MODAL */}
      {noticeStudent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-slate-900">Official Attendance Warning</h3>
              </div>
              <button
                onClick={() => setNoticeStudent(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 mt-4 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p><strong>Student:</strong> {noticeStudent.name} ({noticeStudent.rollNo})</p>
                <p><strong>Current Aggregate:</strong> <span className="text-rose-600 font-bold font-mono">{noticeStudent.overallPercentage}%</span></p>
                <p><strong>Guardian:</strong> {noticeStudent.guardianName} ({noticeStudent.guardianPhone})</p>
              </div>

              <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-lg text-rose-900 space-y-2">
                <p className="font-semibold">Notice Draft (SMS & Email):</p>
                <p className="italic text-[11px] leading-relaxed">
                  "Dear Parent/Guardian of {noticeStudent.name}, this is to notify that the student's attendance ({noticeStudent.overallPercentage}%) has fallen below the mandatory 75% university requirement. Failure to compensate during subsequent instruction days will lead to examination debarment. Please schedule a meeting with Faculty In-charge {CURRENT_FACULTY.name}."
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6 pt-3 border-t border-slate-100">
              <button
                onClick={() => setNoticeStudent(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setNoticeSentToast(true);
                  setNoticeStudent(null);
                  setTimeout(() => setNoticeSentToast(false), 4000);
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmit Official Warning</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: LEAVE SLIP PREVIEW MODAL */}
      {previewLeave && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Leave Document Verification</h3>
              <button
                onClick={() => setPreviewLeave(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 mt-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p><strong>Candidate:</strong> {previewLeave.studentName} ({previewLeave.rollNo})</p>
                <p><strong>Category:</strong> {previewLeave.type.toUpperCase()}</p>
                <p><strong>Duration:</strong> {previewLeave.fromDate} to {previewLeave.toDate} ({previewLeave.daysCount} days)</p>
              </div>

              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-lg">
                <div className="flex items-center gap-2 text-indigo-700 font-semibold mb-1">
                  <FileText className="w-4 h-4" />
                  <span>{previewLeave.documentName}</span>
                </div>
                <p className="text-slate-600 text-[11px] mt-2">
                  Document Verified: Issued by Registered Medical Practitioner / College Sports Cell. Seal & registration number detected.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6 pt-3 border-t border-slate-100">
              <button
                onClick={() => handleLeaveDecision(previewLeave.id, 'rejected', 'Inconclusive documentation')}
                className="px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50 rounded-lg"
              >
                Reject Claim
              </button>
              <button
                onClick={() => handleLeaveDecision(previewLeave.id, 'approved', 'Medical slip verified')}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
              >
                Approve & Credit Attendance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTICE TRANSMITTED TOAST */}
      {noticeSentToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-slate-900 text-white shadow-xl text-xs flex items-center gap-2 animate-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Automated warning transmitted to parent SMS & registered student email!</span>
        </div>
      )}
    </div>
  );
};
