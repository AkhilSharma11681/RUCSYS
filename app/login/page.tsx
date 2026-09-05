'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { isLearnerEmail } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'learner' | 'staff'>('learner');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        router.push('/parcels');
      }
    } catch (err: any) {
      setLoading(false);
      setMessage({ type: 'error', text: err?.message || 'An error occurred during login.' });
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
      setLoading(false);
      if (res?.error) {
        setMessage({ type: 'error', text: 'Incorrect email or password.' });
      } else {
        router.push('/guard');
      }
    } catch (err: any) {
      setLoading(false);
      setMessage({ type: 'error', text: err?.message || 'An error occurred during login.' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF6F1] flex flex-col items-center justify-center p-4 text-[#1a1a1a]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-[#E8E0D8] p-6 space-y-6">
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#E4572E]/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-[#E4572E]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-5.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1a1a1a]">rishihood university</h1>
          <p className="text-xs uppercase tracking-widest text-[#E4572E] font-semibold">RUCSYS · Gate No. 2</p>
        </div>

        <div className="flex bg-[#FBF6F1] p-1 rounded-xl border border-[#E8E0D8]">
          <button
            type="button"
            onClick={() => { setActiveTab('learner'); setMessage(null); }}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'learner' ? 'bg-white text-[#E4572E] shadow-sm font-semibold' : 'text-[#6B6B6B] hover:text-[#1a1a1a]'
            }`}
          >
            Learner Login
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('staff'); setMessage(null); }}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'staff' ? 'bg-white text-[#E4572E] shadow-sm font-semibold' : 'text-[#6B6B6B] hover:text-[#1a1a1a]'
            }`}
          >
            Guard / Staff
          </button>
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
          <form onSubmit={handleStaffLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5 uppercase tracking-wide">
                Staff Email Address
              </label>
              <input
                type="email"
                required
                placeholder="staff@rishihood.edu.in"
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
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
