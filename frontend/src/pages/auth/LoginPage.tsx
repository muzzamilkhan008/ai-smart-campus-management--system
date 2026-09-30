import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiFetch } from '../../services/api';
import { Sparkles, ShieldCheck, User, Lock, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [emailOrUsername, setEmailOrUsername] = useState<string>('admin@campus.edu');
  const [password, setPassword] = useState<string>('admin123');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ emailOrUsername, password }),
      });

      login(data.token, data.user);

      if (data.user.role === 'ADMIN') navigate('/admin/dashboard');
      else if (data.user.role === 'TEACHER') navigate('/teacher/dashboard');
      else navigate('/student/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: 'admin' | 'teacher' | 'student' | 'staff') => {
    if (role === 'admin') {
      setEmailOrUsername('admin@campus.edu');
      setPassword('admin123');
    } else if (role === 'teacher') {
      setEmailOrUsername('teacher1@campus.edu');
      setPassword('password123');
    } else if (role === 'student') {
      setEmailOrUsername('student1@campus.edu');
      setPassword('password123');
    } else {
      setEmailOrUsername('staff@campus.edu');
      setPassword('password123');
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/30">
            <Sparkles className="h-7 w-7 animate-pulse" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-white">AI Smart Campus</h1>
          <p className="mt-1 text-xs text-slate-400">"One Smart Platform for the Entire Campus"</p>
        </div>

        {/* Demo Quick Logins */}
        <div className="mt-6">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-2">
            Click Demo Role Account:
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            <button
              onClick={() => fillDemo('admin')}
              className="rounded-lg border border-blue-500/30 bg-blue-500/10 py-1.5 text-[11px] font-medium text-blue-300 hover:bg-blue-500/20"
            >
              👑 Admin
            </button>
            <button
              onClick={() => fillDemo('teacher')}
              className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 py-1.5 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/20"
            >
              👨‍🏫 Teacher
            </button>
            <button
              onClick={() => fillDemo('student')}
              className="rounded-lg border border-purple-500/30 bg-purple-500/10 py-1.5 text-[11px] font-medium text-purple-300 hover:bg-purple-500/20"
            >
              🎓 Student
            </button>
            <button
              onClick={() => fillDemo('staff')}
              className="rounded-lg border border-amber-500/30 bg-amber-500/10 py-1.5 text-[11px] font-medium text-amber-300 hover:bg-amber-500/20"
            >
              💼 Staff
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300 text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-300">Email or Username</label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                required
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="admin@campus.edu"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300">Password</label>
              <span className="text-[11px] text-blue-400 hover:underline cursor-pointer">Forgot password?</span>
            </div>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Campus Portal'} <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Protected by Enterprise Role-Based Access Control (RBAC) & JWT Security.
        </div>
      </div>
    </div>
  );
};
