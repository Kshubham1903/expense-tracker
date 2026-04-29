import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';

export default function AuthPage() {
  const { user, loading, signIn, signUp, error, setError, firebaseReady, googleSignIn, googleLoading } = useAuth();
  const [mode, setMode] = useState('login');
  const [formState, setFormState] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setError('');
  }, [mode, setError]);

  if (loading) {
    return <AuthLoadingState />;
  }

  if (user) {
    return <Navigate to={(location.state && location.state.from) || '/dashboard'} replace />;
  }

  const updateField = (field) => (event) => {
    setFormState((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (mode === 'login') {
        await signIn(formState.email, formState.password);
      } else {
        await signUp(formState.email, formState.password);
      }
      navigate('/dashboard', { replace: true });
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    try {
      await googleSignIn();
      navigate('/dashboard', { replace: true });
    } catch (nextError) {
      setError(nextError?.message || 'Google sign-in failed.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-luxury flex flex-col md:flex-row">
      {/* Left Panel - Branding & Message */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-between p-16 text-white relative overflow-hidden">
        {/* Subtle background accent */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 right-0 w-96 h-96 bg-luxury-gold rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <div className="text-luxury-gold text-sm font-medium tracking-widest uppercase mb-12">
            EXPENSE LEDGER
          </div>

          <h1 className="text-5xl font-light leading-tight text-text-primary mb-6">
            Premium personal finance. Calm and simplified.
          </h1>

          <p className="text-text-secondary text-lg leading-relaxed max-w-md mb-12">
            Track your expenses with the elegance and security you deserve. Synced across all your devices with enterprise-grade protection.
          </p>

          {/* Features */}
          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="w-1 h-12 bg-luxury-gold rounded-full flex-shrink-0 mt-1"></div>
              <div>
                <h3 className="text-text-primary font-medium mb-1">Secure by Design</h3>
                <p className="text-text-subtle text-sm">End-to-end encrypted. Your data stays private.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-1 h-12 bg-luxury-gold rounded-full flex-shrink-0 mt-1"></div>
              <div>
                <h3 className="text-text-primary font-medium mb-1">Perfectly Synced</h3>
                <p className="text-text-subtle text-sm">Real-time cloud storage. Always up to date.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-1 h-12 bg-luxury-gold rounded-full flex-shrink-0 mt-1"></div>
              <div>
                <h3 className="text-text-primary font-medium mb-1">Instant Insights</h3>
                <p className="text-text-subtle text-sm">Beautiful reports. Understand your spending.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-text-subtle text-xs">
          © 2026 Expense Ledger. Built with intention.
        </div>
      </div>

      {/* Right Panel - Sign In Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-6 md:px-12 lg:px-16 py-12 md:py-0">
        <div className="max-w-sm mx-auto w-full md:max-w-none">
          {/* Mobile Header */}
          <div className="md:hidden mb-12">
            <h1 className="text-3xl font-light text-text-primary mb-2">
              Expense Ledger
            </h1>
            <p className="text-text-secondary">Premium financial tracking</p>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-light text-text-primary mb-2">
              {mode === 'login' ? 'Welcome back' : 'Get started'}
            </h2>
            <p className="text-text-secondary">
              {mode === 'login'
                ? 'Sign in to your account'
                : 'Create a new account to begin'}
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-3 mb-8">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-3 text-sm font-medium transition-all duration-200 rounded-luxury border ${
                mode === 'login'
                  ? 'bg-luxury-gold text-gray-900 border-luxury-gold'
                  : 'border-gray-700 text-text-primary hover:border-luxury-gold'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-3 text-sm font-medium transition-all duration-200 rounded-luxury border ${
                mode === 'signup'
                  ? 'bg-luxury-gold text-gray-900 border-luxury-gold'
                  : 'border-gray-700 text-text-primary hover:border-luxury-gold'
              }`}
            >
              Sign up
            </button>
          </div>

          {/* Google Sign-In */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading || !firebaseReady}
            className="w-full py-3 px-4 mb-6 rounded-luxury border border-gray-700 bg-dark-card hover:border-luxury-gold hover:bg-dark-elevated transition-all duration-200 text-text-primary font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M21.6 12.24c0-.68-.06-1.34-.18-1.98H12v3.76h5.84c-.25 1.36-1.02 2.52-2.18 3.3v2.76h3.52c2.06-1.9 3.26-4.7 3.26-7.84z" fill="#C6A75E" />
              <path d="M12 22c2.7 0 4.96-.9 6.61-2.46l-3.52-2.76c-.98.66-2.23 1.06-3.09 1.06-2.38 0-4.4-1.6-5.12-3.74H3.16v2.36C4.86 19.94 8.17 22 12 22z" fill="#5F8F6F" />
              <path d="M6.88 13.1A7.02 7.02 0 016.6 12c0-.4.04-.8.12-1.18V8.46H3.16A9.99 9.99 0 002 12c0 1.6.38 3.12 1.04 4.44l3.84-3.34z" fill="#C6A75E" />
              <path d="M12 6.04c1.46 0 2.78.5 3.82 1.48l2.86-2.86C16.96 2.74 14.7 2 12 2 8.17 2 4.86 4.06 3.16 6.86l3.56 2.9C7.6 7.64 9.62 6.04 12 6.04z" fill="#B06A6A" />
            </svg>
            {googleLoading ? 'Connecting...' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-700"></div>
            <span className="text-text-subtle text-xs">OR</span>
            <div className="flex-1 h-px bg-gray-700"></div>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label className="block text-text-secondary text-xs font-medium mb-2 uppercase tracking-wider">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-text-subtle pointer-events-none" />
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={formState.email}
                  onChange={updateField('email')}
                  className="input-luxury pl-10 w-full bg-dark-card border border-gray-700 rounded-luxury text-text-primary placeholder:text-text-subtle"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-text-secondary text-xs font-medium mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-text-subtle pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                  minLength={6}
                  value={formState.password}
                  onChange={updateField('password')}
                  className="input-luxury pl-10 pr-10 w-full bg-dark-card border border-gray-700 rounded-luxury text-text-primary placeholder:text-text-subtle"
                  placeholder="Minimum 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-text-subtle hover:text-text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-luxury border border-state-error/30 bg-state-error/10 p-3 text-sm text-state-error">
                {error}
              </div>
            )}

            {!firebaseReady && (
              <div className="rounded-luxury border border-yellow-600/30 bg-yellow-600/10 p-3 text-sm text-yellow-200">
                Firebase configuration pending. Please check .env.local
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !firebaseReady}
              className="btn-luxury-primary w-full flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogIn className="w-4 h-4" />
              {submitting
                ? mode === 'login'
                  ? 'Signing in...'
                  : 'Creating account...'
                : mode === 'login'
                ? 'Sign in'
                : 'Create account'}
            </button>

            {/* Footer Text */}
            <p className="text-center text-text-subtle text-xs pt-2">
              {mode === 'login'
                ? 'Forgot your password? Contact support.'
                : 'By signing up, you agree to our Terms.'}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function AuthLoadingState() {
  return (
    <div className="min-h-screen bg-gradient-luxury flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-2 border-luxury-gold border-t-transparent animate-spin mx-auto mb-4"></div>
        <p className="text-text-secondary">Loading...</p>
      </div>
    </div>
  );
}
