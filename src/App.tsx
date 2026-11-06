/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Screen, Student, LeaveRequest } from './types/attendance';
import { INITIAL_STUDENTS, INITIAL_LEAVE_REQUESTS } from './data/mockData';
import { PrototypeNavbar } from './components/navigation/PrototypeNavbar';
import { CollegeDashboard } from './components/college/CollegeDashboard';
import { StudentPortal } from './components/student/StudentPortal';
import { PasswordRecovery } from './components/recovery/PasswordRecovery';
import { GraduationCap, ShieldCheck, KeyRound, UserCheck, LayoutDashboard } from 'lucide-react';

export default function App() {
  // Screen 1 is Initial Screen as specified: 'college-dashboard'
  const [currentScreen, setCurrentScreen] = useState<Screen>('college-dashboard');

  // Shared application state persisted across screens
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('attendease_students_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse cached students', e);
      }
    }
    return INITIAL_STUDENTS;
  });

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem('attendease_leaves_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse cached leaves', e);
      }
    }
    return INITIAL_LEAVE_REQUESTS;
  });

  const [selectedStudentRoll, setSelectedStudentRoll] = useState<string>('21BCE1429');

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('attendease_students_v1', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('attendease_leaves_v1', JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  // Navigate to student portal from college dashboard
  const handleNavigateToStudent = (studentRoll: string) => {
    setSelectedStudentRoll(studentRoll);
    setCurrentScreen('student-portal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddLeaveRequest = (newRequest: LeaveRequest) => {
    setLeaveRequests((prev) => [newRequest, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Prototype Navigation Bar */}
      <PrototypeNavbar
        currentScreen={currentScreen}
        onNavigate={(screen) => {
          setCurrentScreen(screen);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        selectedStudentRoll={selectedStudentRoll}
      />

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Screen 1: AttendEase - College Attendance Dashboard (Initial Screen) */}
        {currentScreen === 'college-dashboard' && (
          <CollegeDashboard
            students={students}
            onUpdateStudents={setStudents}
            leaveRequests={leaveRequests}
            onUpdateLeaveRequests={setLeaveRequests}
            onNavigateToStudent={handleNavigateToStudent}
          />
        )}

        {/* Screen 2: AttendEase - Student Portal Dashboard */}
        {currentScreen === 'student-portal' && (
          <StudentPortal
            students={students}
            currentStudentRoll={selectedStudentRoll}
            onSelectStudentRoll={setSelectedStudentRoll}
            leaveRequests={leaveRequests}
            onAddLeaveRequest={handleAddLeaveRequest}
            onNavigateToRecovery={() => {
              setCurrentScreen('password-recovery');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* Screen 3: AttendEase - Password Recovery */}
        {currentScreen === 'password-recovery' && (
          <PasswordRecovery
            onNavigate={(screen) => {
              setCurrentScreen(screen);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSetUserRoll={(roll) => setSelectedStudentRoll(roll)}
          />
        )}
      </main>

      {/* Institutional Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-slate-800">AttendEase College ERP</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Apex Institute of Technology & Research</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setCurrentScreen('college-dashboard')}
              className={`hover:text-slate-900 transition-colors ${currentScreen === 'college-dashboard' ? 'text-indigo-600 font-semibold' : ''}`}
            >
              1. College Attendance Dashboard
            </button>
            <button
              onClick={() => setCurrentScreen('student-portal')}
              className={`hover:text-slate-900 transition-colors ${currentScreen === 'student-portal' ? 'text-indigo-600 font-semibold' : ''}`}
            >
              2. Student Portal Dashboard
            </button>
            <button
              onClick={() => setCurrentScreen('password-recovery')}
              className={`hover:text-slate-900 transition-colors ${currentScreen === 'password-recovery' ? 'text-indigo-600 font-semibold' : ''}`}
            >
              3. Password Recovery
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
