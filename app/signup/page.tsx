'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Mail, Lock, ShieldCheck, Loader2, AlertCircle, ArrowRight, LayoutDashboard } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirm) { 
      setError('Passwords do not match')
      return 
    }
    if (password.length < 6) { 
      setError('Password must be at least 6 characters')
      return 
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create account')
        return
      }

      window.location.href = '/dashboard'
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'radial-gradient(circle at 20% -20%, #312e81 0%, #0f172a 80%)' }}>
      
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(#818cf8 1px, transparent 1px), linear-gradient(90deg, #818cf8 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

      <div className="w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/20 mb-4 transform hover:-rotate-6 transition-transform">
            <LayoutDashboard className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            Create account
          </h1>
          <p className="text-slate-400">Join LeadPanel to manage your growth</p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 flex items-center gap-3 animate-shake">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required
                  placeholder="John Doe"
                  className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm" 
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required
                  placeholder="name@company.com"
                  className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm" 
                />
              </div>
            </div>

            {/* Password Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <input 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required
                    placeholder="Min 6 chars"
                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Confirm</label>
                <div className="relative group">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <input 
                    type="password" 
                    value={confirm} 
                    onChange={e => setConfirm(e.target.value)} 
                    required
                    placeholder="Repeat it"
                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm" 
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="group relative w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-70 text-white font-bold py-4 rounded-xl transition-all duration-300 overflow-hidden shadow-lg shadow-indigo-600/20 mt-4"
            >
              <div className="absolute inset-0 w-1/2 h-full bg-white/10 skew-x-[-25deg] -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>Create Account <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                )}
              </span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-slate-400 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-bold decoration-indigo-400/30 underline-offset-4 hover:underline transition-all">
                Sign in
              </Link>
            </p>
          </div>
        </div>
        
        <p className="mt-8 text-center text-xs text-slate-500 px-6">
          By creating an account, you agree to our <span className="text-slate-400 underline cursor-pointer">Terms of Service</span> and <span className="text-slate-400 underline cursor-pointer">Privacy Policy</span>.
        </p>
      </div>
    </div>
  )
}