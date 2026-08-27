import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Instagram,
  Linkedin,
  Clock,
  Sparkles,
  ShieldCheck,
  X
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';

export const AuthPage: React.FC = () => {
  const { signin, signup } = useAuth();
  const { addToast } = useToast();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  // Password Recovery State
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [resetLoading, setResetLoading] = useState(false);

  const triggerError = (msg: string) => {
    setError(msg);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 400);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      triggerError('Please enter your email address.');
      return;
    }
    if (!password) {
      triggerError('Please enter your password.');
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        triggerError('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        triggerError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        triggerError('Passwords do not match. Please re-enter.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        await signup(name, email, password);
        addToast('Account registered successfully. Welcome to PostWave!', 'success');
      } else {
        await signin(email, password);
        addToast('Signed in successfully.', 'success');
      }
    } catch (err: any) {
      triggerError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setResetLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to request reset link');

      if (data.resetToken) {
        setResetToken(data.resetToken);
        setResetStep(2);
        addToast('Reset link issued. Enter your new password below.', 'success');
      } else {
        addToast(data.message || 'Reset link issued if account exists.', 'info');
        setShowForgotPassword(false);
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to request reset', 'error');
    } finally {
      setResetLoading(false);
    }
  };

  const handleExecuteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      addToast('New password must be at least 6 characters', 'error');
      return;
    }
    setResetLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');
      addToast('Password updated successfully. You may now sign in.', 'success');
      setShowForgotPassword(false);
      setResetStep(1);
      setForgotEmail('');
      setResetToken('');
      setNewPassword('');
    } catch (err: any) {
      addToast(err.message || 'Reset failed', 'error');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center selection:bg-indigo-500 selection:text-white p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl mx-auto">
        <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
          
          {/* Left Column: Brand & Product Value (Desktop Only) */}
          <div className="hidden lg:flex lg:col-span-5 bg-slate-900 text-white p-8 flex-col justify-between relative overflow-hidden">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="PostWave Logo"
                  className="w-9 h-9 rounded-lg object-contain bg-white p-0.5 border border-slate-700"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-base tracking-tight text-white">PostWave</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">PRO</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">Social Media Publishing Engine</p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h1 className="text-2xl font-bold tracking-tight text-white leading-snug">
                  Multi-channel publishing, unified in one workspace.
                </h1>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Draft once, adapt natively for Instagram and LinkedIn with AI, and schedule to official APIs with automatic background queue workers.
                </p>
              </div>

              {/* Scheduled Queue Visual Preview */}
              <div className="pt-2">
                <div className="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-pink-500/20 flex items-center justify-center">
                        <Instagram className="w-3 h-3 text-pink-400" />
                      </div>
                      <div className="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center">
                        <Linkedin className="w-3 h-3 text-blue-400" />
                      </div>
                      <span className="text-xs font-semibold text-slate-200">Scheduled Queue</span>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> Tomorrow 9:30 AM
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed font-normal">
                    "🚀 Launching our new architecture today: verified multi-channel delivery across Instagram & LinkedIn..."
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> AES-256 Encrypted Vault
              </span>
              <span>PostgreSQL + Prisma</span>
            </div>
          </div>

          {/* Right Column: Authentication Form */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
            <div className="space-y-5 max-w-sm mx-auto w-full">
              
              <div className="space-y-1">
                <div className="lg:hidden flex items-center gap-2 mb-3">
                  <img src="/logo.png" alt="Logo" className="w-7 h-7 rounded object-contain border" />
                  <span className="font-bold text-sm text-slate-900">PostWave</span>
                </div>

                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {mode === 'signin' ? 'Sign in to your account' : 'Create an account'}
                </h2>
                <p className="text-xs text-slate-500">
                  {mode === 'signin'
                    ? 'Enter your credentials to access your scheduler workspace.'
                    : 'Get started with automated social media publishing.'}
                </p>
              </div>

              {/* Mode Switcher */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setError(null); }}
                  className={`py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    mode === 'signin' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(null); }}
                  className={`py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    mode === 'signup' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Register
                </button>
              </div>

              {/* Error Banner */}
              {error && (
                <div className={`p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-700 ${isShaking ? 'animate-shake' : ''}`}>
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {mode === 'signup' && (
                  <Input
                    label="Full Name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Vance"
                    icon={<UserIcon className="w-4 h-4" />}
                  />
                )}

                <Input
                  label="Email Address"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  icon={<Mail className="w-4 h-4" />}
                />

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">Password</label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => { setForgotEmail(email); setShowForgotPassword(true); }}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      icon={<Lock className="w-4 h-4" />}
                      rightElement={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-slate-400 hover:text-slate-600 p-0.5"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                    />
                  </div>
                </div>

                {mode === 'signup' && (
                  <Input
                    label="Confirm Password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    icon={<Lock className="w-4 h-4" />}
                  />
                )}

                {mode === 'signin' && (
                  <div className="flex items-center gap-2 pt-0.5">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <label htmlFor="rememberMe" className="text-xs text-slate-600 font-medium cursor-pointer">
                      Keep me signed in
                    </label>
                  </div>
                )}

                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  loading={loading}
                  className="w-full"
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  {mode === 'signin' ? 'Sign in to Workspace' : 'Create Account'}
                </Button>
              </form>
            </div>

            <div className="pt-6 text-center text-[11px] text-slate-400">
              PostWave Social Publishing Suite
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={showForgotPassword}
        onClose={() => { setShowForgotPassword(false); setResetStep(1); }}
        title={resetStep === 1 ? 'Reset Password' : 'Set New Password'}
      >
        {resetStep === 1 ? (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <p className="text-xs text-slate-500">
              Enter your registered account email. A secure password reset link will be generated.
            </p>
            <Input
              label="Email Address"
              type="email"
              required
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="name@company.com"
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="secondary" size="md" type="button" onClick={() => setShowForgotPassword(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="md" type="submit" loading={resetLoading}>
                Generate Reset Link
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleExecuteReset} className="space-y-4">
            <p className="text-xs text-slate-500">
              Enter your new account password below.
            </p>
            <Input
              label="New Password"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="primary" size="md" type="submit" loading={resetLoading}>
                Update Password
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
