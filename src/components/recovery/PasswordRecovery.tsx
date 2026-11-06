import React, { useState, useEffect } from 'react';
import { Screen } from '../../types/attendance';
import { 
  KeyRound, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowLeft, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Sparkles,
  AlertCircle,
  GraduationCap,
  Building2,
  Check
} from 'lucide-react';

interface PasswordRecoveryProps {
  onNavigate: (screen: Screen) => void;
  onSetUserRoll?: (roll: string) => void;
}

export const PasswordRecovery: React.FC<PasswordRecoveryProps> = ({
  onNavigate,
  onSetUserRoll,
}) => {
  // Wizard steps: 1: Identity, 2: OTP, 3: New Password, 4: Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Identity
  const [role, setRole] = useState<'student' | 'faculty'>('student');
  const [identifier, setIdentifier] = useState('21BCE1429');
  const [email, setEmail] = useState('rohan.verma@apexuniversity.edu');
  const [identityError, setIdentityError] = useState('');

  // Step 2: OTP
  const [otp, setOtp] = useState(['7', '4', '9', '2', '0', '1']);
  const [timer, setTimer] = useState(60);
  const [otpError, setOtpError] = useState('');

  // Step 3: Password Reset
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // OTP Countdown timer
  useEffect(() => {
    if (step === 2 && timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  // Handle Identity Submit
  const handleIdentitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIdentityError('');
    if (!identifier.trim()) {
      setIdentityError('Please provide your registered Roll Number or Employee ID.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setIdentityError('Please provide a valid university email address.');
      return;
    }
    setStep(2);
    setTimer(60);
  };

  // Handle OTP Input Change
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[value.length - 1];
    }
    const nextOtp = [...otp];
    nextOtp[index] = value;
    setOtp(nextOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      setOtpError('Please enter all 6 digits of the verification code.');
      return;
    }
    setStep(3);
  };

  // Password Strength Rules
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

  const passedCount = [hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecial].filter(Boolean).length;

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (passedCount < 4) {
      setPasswordError('Password does not meet university IT security standards.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setStep(4);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6">
      {/* Back button */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => onNavigate('college-dashboard')}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to College Dashboard</span>
        </button>

        <span className="text-xs text-slate-400">
          Campus Directory Identity Service · Apex IT
        </span>
      </div>

      {/* Main Container Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header Header Strip */}
        <div className="bg-slate-900 text-white p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">AttendEase Account Recovery</h2>
              <p className="text-xs text-slate-400">
                Self-service password reset for faculty members and enrolled students
              </p>
            </div>
          </div>

          {/* Stepper Wizard Indicator */}
          <div className="grid grid-cols-4 gap-2 mt-6 pt-4 border-t border-slate-800 text-center">
            {[
              { num: 1, label: 'Identity' },
              { num: 2, label: '2FA OTP' },
              { num: 3, label: 'New Password' },
              { num: 4, label: 'Completed' },
            ].map((s) => (
              <div key={s.num} className="space-y-1">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    step >= s.num ? 'bg-indigo-500' : 'bg-slate-800'
                  }`}
                ></div>
                <span
                  className={`text-[11px] font-medium block ${
                    step === s.num
                      ? 'text-indigo-400 font-bold'
                      : step > s.num
                      ? 'text-slate-300'
                      : 'text-slate-500'
                  }`}
                >
                  Step {s.num}: {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8">
          {/* STEP 1: IDENTITY VERIFICATION */}
          {step === 1 && (
            <form onSubmit={handleIdentitySubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Select Your Account Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setRole('student');
                      setIdentifier('21BCE1429');
                      setEmail('rohan.verma@apexuniversity.edu');
                    }}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2.5 transition-all ${
                      role === 'student'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div className="text-left">
                      <span className="block font-bold">Student Account</span>
                      <span className="text-[10px] text-slate-500 font-normal">Roll No Verification</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRole('faculty');
                      setIdentifier('FAC-CSE-084');
                      setEmail('arvind.sharma@apexuniversity.edu');
                    }}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2.5 transition-all ${
                      role === 'faculty'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div className="text-left">
                      <span className="block font-bold">Faculty / Admin</span>
                      <span className="text-[10px] text-slate-500 font-normal">Employee ID</span>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {role === 'student' ? 'Student University Roll Number' : 'Faculty Employee ID'}
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={role === 'student' ? 'e.g. 21BCE1429' : 'e.g. FAC-CSE-084'}
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-mono text-slate-900 uppercase"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Found on your campus RFID smart card or registration slip.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Campus Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@apexuniversity.edu"
                    required
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900"
                  />
                </div>
              </div>

              {identityError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{identityError}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2"
                >
                  <span>Transmit 2FA Security Code</span>
                  <ShieldCheck className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg text-[11px] text-slate-500 text-center">
                Need immediate in-person help? Visit Academic Computing Centre, Tech Block Room 102.
              </div>
            </form>
          )}

          {/* STEP 2: CAMPUS 2FA OTP VERIFICATION */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-slate-900">Enter Security Code</h3>
                <p className="text-xs text-slate-500">
                  We've transmitted a 6-digit one-time code to <strong>{email}</strong> and your linked mobile phone.
                </p>
              </div>

              {/* 6-box OTP Input */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 py-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-input-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-11 h-12 text-center text-lg font-bold font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:bg-white text-slate-900 shadow-2xs"
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 px-2">
                <div>
                  {timer > 0 ? (
                    <span>Resend code in <strong className="font-mono text-indigo-600">{timer}s</strong></span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setTimer(60)}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Resend OTP Now</span>
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setOtp(['7', '4', '9', '2', '0', '1'])}
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Autofill test code (749201)
                </button>
              </div>

              {otpError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
                >
                  Verify & Proceed
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: NEW PASSWORD CREATION */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">Create New University Password</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your new password will synchronize across AttendEase, campus Wi-Fi, and Moodle LMS.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter at least 8 strong characters..."
                    required
                    className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Strength Checklist */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <span className="font-semibold text-slate-700 block">IT Security Policy Requirements:</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <span className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                    <Check className="w-3.5 h-3.5" /> 8+ Characters
                  </span>
                  <span className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                    <Check className="w-3.5 h-3.5" /> Uppercase letter (A-Z)
                  </span>
                  <span className={`flex items-center gap-1.5 ${hasLowercase ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                    <Check className="w-3.5 h-3.5" /> Lowercase letter (a-z)
                  </span>
                  <span className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                    <Check className="w-3.5 h-3.5" /> Numeric digit (0-9)
                  </span>
                  <span className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                    <Check className="w-3.5 h-3.5" /> Special symbol (!@#$)
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password exactly..."
                    required
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900"
                  />
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <span className="text-[11px] text-rose-600 mt-1 block">Passwords do not match.</span>
                )}
                {confirmPassword && newPassword === confirmPassword && (
                  <span className="text-[11px] text-emerald-600 mt-1 block flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Passwords match perfectly.
                  </span>
                )}
              </div>

              {passwordError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
              >
                Update Password & Secure Account
              </button>
            </form>
          )}

          {/* STEP 4: SUCCESS CONFIRMATION */}
          {step === 4 && (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">Password Successfully Updated</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto mt-1 leading-relaxed">
                  Your credentials have been securely updated in the Apex University Active Directory. 
                  All previous sessions on other browsers have been invalidated.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 text-left max-w-md mx-auto space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Account:</span>
                  <span className="font-semibold text-slate-900 font-mono">{identifier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Recovery Email:</span>
                  <span className="font-semibold text-slate-900">{email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="text-emerald-700 font-bold">Synchronized (LDAP Active)</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                <button
                  onClick={() => onNavigate('college-dashboard')}
                  className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
                >
                  Go to College Dashboard
                </button>
                <button
                  onClick={() => {
                    if (onSetUserRoll && role === 'student') {
                      onSetUserRoll(identifier);
                    }
                    onNavigate('student-portal');
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Sign in to Student Portal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
