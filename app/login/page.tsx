'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signIn, getSession } from 'next-auth/react';
import { isLearnerEmail } from '@/lib/utils';
import { registerStudentAction } from './actions';

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'learner' | 'staff'>('learner');
  const [learnerMode, setLearnerMode] = useState<'signin' | 'signup'>('signin');

  // Sign In fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sign Up fields
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [hostelRoom, setHostelRoom] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleLearnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const cleanEmail = email.trim().toLowerCase();
    if (!isLearnerEmail(cleanEmail)) {
      setMessage({
        type: 'error',
        text: 'Learner login requires a @rishihood.edu.in or @nst.rishihood.edu.in email address.',
      });
      return;
    }
    setLoading(true);
    try {
      const res = await signIn('credentials', {
        email: cleanEmail,
        password,
        redirect: false,
      });
      setLoading(false);
      if (res?.error) {
        setMessage({ type: 'error', text: 'Incorrect email or password.' });
      } else {
        window.location.href = '/parcels';
      }
    } catch (err: any) {
      setLoading(false);
      setMessage({ type: 'error', text: err?.message || 'An error occurred during login.' });
    }
  };

  const handleLearnerSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const res = await registerStudentAction({
      fullName,
      email: signupEmail,
      password: signupPassword,
      phone,
      hostelRoom,
    });

    if (!res.success) {
      setLoading(false);
      setMessage({ type: 'error', text: res.error });
      return;
    }

    // Auto sign in on successful signup
    const signInRes = await signIn('credentials', {
      email: signupEmail.trim().toLowerCase(),
      password: signupPassword,
      redirect: false,
    });

    setLoading(false);
    if (signInRes?.error) {
      setMessage({ type: 'success', text: 'Account created! Please sign in with your password.' });
      setLearnerMode('signin');
      setEmail(signupEmail);
    } else {
      window.location.href = '/parcels';
    }
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    try {
      const res = await signIn('credentials', {
        email: cleanEmail,
        password,
        redirect: false,
      });

      if (res?.error) {
        setLoading(false);
        setMessage({ type: 'error', text: 'Incorrect email or password.' });
      } else {
        const session = await getSession();
        const role = (session?.user as any)?.role;
        setLoading(false);

        if (role === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/guard';
        }
      }
    } catch (err: any) {
      setLoading(false);
      setMessage({ type: 'error', text: err?.message || 'An error occurred during login.' });
    }
  };

  const fillTestCredentials = (role: 'student' | 'guard' | 'admin') => {
    setMessage(null);
    if (role === 'student') {
      setActiveTab('learner');
      setLearnerMode('signin');
      setEmail('test.student@rishihood.edu.in');
      setPassword('password123');
    } else if (role === 'guard') {
      setActiveTab('staff');
      setEmail('guard@rishihood.edu.in');
      setPassword('password123');
    } else if (role === 'admin') {
      setActiveTab('staff');
      setEmail('admin@admin.com');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF6F1] flex flex-col items-center justify-center p-4 text-[#1a1a1a]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-[#E8E0D8] p-6 space-y-6">
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <Image
            src="/ru-logo.png"
            alt="Rishihood University Logo"
            width={180}
            height={66}
            className="h-16 w-auto object-contain"
            priority
          />
          <h1 className="text-2xl font-bold tracking-tight text-[#1a1a1a]">rishihood university</h1>
          <p className="text-xs uppercase tracking-widest text-[#E4572E] font-semibold">RUCSYS · Gate No. 2</p>
        </div>

        {/* Role Tabs */}
        <div className="flex bg-[#FBF6F1] p-1 rounded-xl border border-[#E8E0D8]">
          <button
            type="button"
            onClick={() => { setActiveTab('learner'); setMessage(null); }}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'learner' ? 'bg-white text-[#E4572E] shadow-sm font-semibold' : 'text-[#6B6B6B] hover:text-[#1a1a1a]'
            }`}
          >
            Learner
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('staff'); setMessage(null); }}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'staff' ? 'bg-white text-[#E4572E] shadow-sm font-semibold' : 'text-[#6B6B6B] hover:text-[#1a1a1a]'
            }`}
          >
            Guard / Admin
          </button>
        </div>

        {/* Quick Demo Credentials Bar */}
        <div className="bg-[#FAF8F5] border border-[#E8E0D8] rounded-xl p-3 text-xs space-y-2">
          <div className="font-semibold text-[#1a1a1a] flex items-center justify-between">
            <span>⚡ Quick Demo Logins (Click to Fill):</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => fillTestCredentials('student')}
              className="px-2.5 py-1 bg-white hover:bg-[#F3EDE6] border border-[#E8E0D8] rounded-lg font-medium text-[#E4572E] transition-all shadow-2xs"
            >
              🎓 Learner
            </button>
            <button
              type="button"
              onClick={() => fillTestCredentials('guard')}
              className="px-2.5 py-1 bg-white hover:bg-[#F3EDE6] border border-[#E8E0D8] rounded-lg font-medium text-[#2E7D4F] transition-all shadow-2xs"
            >
              🛡️ Guard
            </button>
            <button
              type="button"
              onClick={() => fillTestCredentials('admin')}
              className="px-2.5 py-1 bg-white hover:bg-[#F3EDE6] border border-[#E8E0D8] rounded-lg font-medium text-[#2C3E50] transition-all shadow-2xs"
            >
              🏛️ Admin
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`p-3.5 rounded-xl text-sm ${
              message.type === 'success'
                ? 'bg-[#E8F5E9] text-[#2E7D4F] border border-[#2E7D4F]/20'
                : 'bg-[#FDECEA] text-[#C0392B] border border-[#C0392B]/20'
            }`}
          >
            {message.text}
          </div>
        )}

        {activeTab === 'learner' ? (
          <div>
            {/* Learner Sign In / Register toggle */}
            <div className="flex justify-center space-x-4 mb-4 border-b border-[#E8E0D8] pb-2">
              <button
                type="button"
                onClick={() => { setLearnerMode('signin'); setMessage(null); }}
                className={`text-sm font-semibold pb-1 border-b-2 transition-all ${
                  learnerMode === 'signin'
                    ? 'border-[#E4572E] text-[#E4572E]'
                    : 'border-transparent text-[#6B6B6B] hover:text-[#1a1a1a]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setLearnerMode('signup'); setMessage(null); }}
                className={`text-sm font-semibold pb-1 border-b-2 transition-all ${
                  learnerMode === 'signup'
                    ? 'border-[#E4572E] text-[#E4572E]'
                    : 'border-transparent text-[#6B6B6B] hover:text-[#1a1a1a]'
                }`}
              >
                Register New Account
              </button>
            </div>

            {learnerMode === 'signin' ? (
              <form onSubmit={handleLearnerLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5 uppercase tracking-wide">
                    College Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="student.name@rishihood.edu.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl border border-[#E8E0D8] bg-[#FBF6F1] text-sm focus:outline-none focus:ring-2 focus:ring-[#E4572E] focus:bg-white transition-all"
                  />
                  <p className="text-xs text-[#6B6B6B] mt-1.5">
                    Must end with <span className="font-semibold text-[#E4572E]">@rishihood.edu.in</span> or <span className="font-semibold text-[#E4572E]">@nst.rishihood.edu.in</span>
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5 uppercase tracking-wide">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl border border-[#E8E0D8] bg-[#FBF6F1] text-sm focus:outline-none focus:ring-2 focus:ring-[#E4572E] focus:bg-white transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[54px] bg-[#E4572E] hover:bg-[#C0392B] text-white font-semibold text-base rounded-[14px] shadow-sm transition-all flex items-center justify-center disabled:opacity-50"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleLearnerSignUp} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#1a1a1a] mb-1 uppercase tracking-wide">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Aarav Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E0D8] bg-[#FBF6F1] text-sm focus:outline-none focus:ring-2 focus:ring-[#E4572E] focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1a1a1a] mb-1 uppercase tracking-wide">
                    College Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="aarav.s@rishihood.edu.in"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E0D8] bg-[#FBF6F1] text-sm focus:outline-none focus:ring-2 focus:ring-[#E4572E] focus:bg-white transition-all"
                  />
                  <p className="text-[11px] text-[#6B6B6B] mt-0.5">
                    @rishihood.edu.in or @nst.rishihood.edu.in
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#1a1a1a] mb-1 uppercase tracking-wide">
                      Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#E8E0D8] bg-[#FBF6F1] text-sm focus:outline-none focus:ring-2 focus:ring-[#E4572E] focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1a1a1a] mb-1 uppercase tracking-wide">
                      Hostel Room
                    </label>
                    <input
                      type="text"
                      placeholder="B-304"
                      value={hostelRoom}
                      onChange={(e) => setHostelRoom(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#E8E0D8] bg-[#FBF6F1] text-sm focus:outline-none focus:ring-2 focus:ring-[#E4572E] focus:bg-white transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1a1a1a] mb-1 uppercase tracking-wide">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E0D8] bg-[#FBF6F1] text-sm focus:outline-none focus:ring-2 focus:ring-[#E4572E] focus:bg-white transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[50px] bg-[#E4572E] hover:bg-[#C0392B] text-white font-semibold text-base rounded-[14px] shadow-sm transition-all flex items-center justify-center disabled:opacity-50 mt-2"
                >
                  {loading ? 'Creating Account...' : 'Register Account'}
                </button>
              </form>
            )}
          </div>
        ) : (
          <form onSubmit={handleStaffLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5 uppercase tracking-wide">
                Staff Email Address
              </label>
              <input
                type="email"
                required
                placeholder="guard@rishihood.edu.in or admin@admin.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-[#E8E0D8] bg-[#FBF6F1] text-sm focus:outline-none focus:ring-2 focus:ring-[#E4572E] focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-[#E8E0D8] bg-[#FBF6F1] text-sm focus:outline-none focus:ring-2 focus:ring-[#E4572E] focus:bg-white transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[54px] bg-[#E4572E] hover:bg-[#C0392B] text-white font-semibold text-base rounded-[14px] shadow-sm transition-all flex items-center justify-center disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In as Staff'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
