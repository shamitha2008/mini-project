import React, { useState } from 'react';
import { Screen } from '../../types/attendance';
import { 
  GraduationCap, 
  LayoutDashboard, 
  UserCheck, 
  KeyRound, 
  Bell, 
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X
} from 'lucide-react';

interface PrototypeNavbarProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  selectedStudentRoll?: string;
}

export const PrototypeNavbar: React.FC<PrototypeNavbarProps> = ({
  currentScreen,
  onNavigate,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const navItems: { id: Screen; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'college-dashboard',
      label: 'College Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'student-portal',
      label: 'Student Portal',
      icon: <UserCheck className="w-4 h-4" />,
      badge: 'Interactive',
    },
    {
      id: 'password-recovery',
      label: 'Password Recovery',
      icon: <KeyRound className="w-4 h-4" />,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Prototype Navigation Banner */}
      <div className="bg-slate-900 text-slate-200 px-4 py-1.5 text-xs font-medium flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
          <span className="text-slate-300">AttendEase Prototype Mode</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400 hidden sm:inline">Apex Institute of Technology Attendance System</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px] hidden md:inline">Quick Jump:</span>
          <button
            onClick={() => onNavigate('college-dashboard')}
            className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
              currentScreen === 'college-dashboard' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            1. College Dashboard
          </button>
          <button
            onClick={() => onNavigate('student-portal')}
            className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
              currentScreen === 'student-portal' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            2. Student Portal
          </button>
          <button
            onClick={() => onNavigate('password-recovery')}
            className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
              currentScreen === 'password-recovery' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            3. Password Recovery
          </button>
        </div>
      </div>

      {/* Main Top Bar Contract: Brand - Nav Links - Primary Action */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <button
          onClick={() => onNavigate('college-dashboard')}
          className="flex items-center gap-2.5 text-left group shrink-0 focus:outline-none"
        >
          <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm shadow-indigo-200 group-hover:bg-indigo-700 transition-colors">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
              AttendEase
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs text-slate-500 font-normal">
              College ERP
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="hidden md:inline-block text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.2 bg-indigo-100 text-indigo-700 rounded">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions & Profile */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Notification Popover Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors relative"
              title="Recent Notifications"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-semibold text-slate-900">Campus Attendance Alerts</span>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3 mt-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/60 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-900">Defaulter Threshold Warning</p>
                      <p className="text-amber-700 mt-0.5">5 students in CSE Section A have fallen below 75% cutoff this week.</p>
                      <span className="text-[10px] text-amber-600 mt-1 inline-block">10 mins ago</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/60 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-emerald-900">CS303 Attendance Synced</p>
                      <p className="text-emerald-700 mt-0.5">Prof. K. Ramanathan submitted Period 3 records (16 Present, 2 Absent).</p>
                      <span className="text-[10px] text-emerald-600 mt-1 inline-block">1 hour ago</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 text-center">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      onNavigate('college-dashboard');
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    View All Attendance Logs
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Help Guide */}
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="System Guide"
            aria-label="View system guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Role Quick Switch Button */}
          {currentScreen === 'college-dashboard' ? (
            <button
              onClick={() => onNavigate('student-portal')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <span>Student View</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => onNavigate('college-dashboard')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors whitespace-nowrap"
            >
              <span>Faculty Admin</span>
              <ShieldCheck className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Guide Drawer / Modal if opened */}
      {showHelp && (
        <div className="bg-indigo-950 text-white px-4 py-3 border-b border-indigo-900 text-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-indigo-200">AttendEase Spec Navigation:</span>
              <span className="text-slate-300">
                1. <strong>College Attendance Dashboard</strong> (mark attendance, low attendance defaulters, analytics) · 
                2. <strong>Student Portal Dashboard</strong> (track subjects, calculate bunk buffers, test what-if scenarios) · 
                3. <strong>Password Recovery</strong> (campus 2FA OTP reset workflow)
              </span>
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="text-indigo-300 hover:text-white shrink-0 font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
