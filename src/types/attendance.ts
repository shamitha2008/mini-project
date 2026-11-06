export type Screen = 'college-dashboard' | 'student-portal' | 'password-recovery';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  email: string;
  department: string;
  semester: number;
  section: string;
  phone: string;
  guardianName: string;
  guardianPhone: string;
  totalClasses: number;
  attendedClasses: number;
  overallPercentage: number;
  status: 'safe' | 'warning' | 'critical';
  avatarInitials: string;
  gender: 'M' | 'F';
}

export interface Course {
  id: string;
  code: string;
  name: string;
  facultyName: string;
  facultyEmail: string;
  credits: number;
  room: string;
  totalHeld: number;
  attended: number;
  absent: number;
  excused: number;
  percentage: number;
  status: 'safe' | 'warning' | 'critical';
  scheduleTime: string;
}

export interface ClassSession {
  id: string;
  courseCode: string;
  courseName: string;
  section: string;
  period: number;
  timeSlot: string;
  room: string;
  date: string;
  faculty: string;
  isMarked: boolean;
  markedAt?: string;
  presentCount: number;
  totalStudents: number;
}

export interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
  note?: string;
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  department: string;
  type: 'medical' | 'on_duty' | 'casual' | 'sports';
  fromDate: string;
  toDate: string;
  daysCount: number;
  reason: string;
  documentName?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  remarks?: string;
}

export interface TimetableEntry {
  day: string;
  period: number;
  timeSlot: string;
  courseCode: string;
  courseName: string;
  room: string;
  faculty: string;
  status: 'attended' | 'upcoming' | 'completed' | 'missed';
}

export interface AttendanceHistoryEntry {
  id: string;
  date: string;
  period: string;
  courseCode: string;
  courseName: string;
  status: AttendanceStatus;
  facultyName: string;
  topic: string;
}
