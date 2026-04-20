'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardHeader from '@/components/DashboardHeader'
import Sidebar from '@/components/Sidebar'

interface Lead {
  id: string
  email: string
  country: string
  exam: string
  status: string
  payment: string
  createdAt: string
}

interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

const STATUS_COLORS: Record<string, string> = {
  'New':         'bg-cyan-400/10 text-cyan-300 border-cyan-400/20',
  'Contacted':   'bg-amber-400/10 text-amber-300 border-amber-400/20',
  'Qualified':   'bg-purple-400/10 text-purple-300 border-purple-400/20',
  'Closed Won':  'bg-emerald-400/10 text-emerald-300 border-emerald-400/20',
  'Closed Lost': 'bg-rose-400/10 text-rose-300 border-rose-400/20',
  'Follow Up':   'bg-orange-400/10 text-orange-300 border-orange-400/20',
}

export default function DashboardPage() {
  const router = useRouter()
  const [leads, setLeads]     = useState<Lead[]>([])
  const [user, setUser]       = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' })
        if (!res.ok) { router.replace('/login'); return }
        const { user: u } = await res.json()
        if (!u) { router.replace('/login'); return }
        setUser(u)
        const lr  = await fetch('/api/leads', { credentials: 'include' })
        const ld  = await lr.json()
        setLeads(ld.data?.leads ?? ld.leads ?? [])
      } catch { router.replace('/login') }
      finally { setLoading(false) }
    })()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05080f]">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border border-white/5" />
          <div className="absolute inset-0 w-12 h-12 rounded-full border-t border-indigo-500 animate-spin" />
        </div>
      </div>
    )
  }

  const today        = new Date().toDateString()
  const todayLeads   = leads.filter(l => new Date(l.createdAt).toDateString() === today)
  const paidLeads    = leads.filter(l => l.payment === 'Paid').length
  const closedWon    = leads.filter(l => l.status === 'Closed Won').length
  const recentLeads  = [...leads].reverse().slice(0, 8)
  const statusCounts = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1; return acc
  }, {})

  const stats = [
    {
      label: 'Total Leads',
      value: leads.length,
      sub: `${todayLeads.length} added today`,
      accent: '#6366f1',
      glowColor: 'rgba(99,102,241,0.08)',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 108 0 4 4 0 00-8 0M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
        </svg>
      ),
    },
    {
      label: 'Added Today',
      value: todayLeads.length,
      sub: 'new this session',
      accent: '#10b981',
      glowColor: 'rgba(16,185,129,0.08)',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="1.5"/>
          <line x1="16" y1="2" x2="16" y2="6" strokeWidth="1.5"/>
          <line x1="8" y1="2" x2="8" y2="6" strokeWidth="1.5"/>
          <line x1="3" y1="10" x2="21" y2="10" strokeWidth="1.5"/>
        </svg>
      ),
    },
    {
      label: 'Paid',
      value: paidLeads,
      sub: `of ${leads.length} total`,
      accent: '#a855f7',
      glowColor: 'rgba(168,85,247,0.08)',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="1" y="4" width="22" height="16" rx="2" strokeWidth="1.5"/>
          <line x1="1" y1="10" x2="23" y2="10" strokeWidth="1.5"/>
        </svg>
      ),
    },
    {
      label: 'Closed Won',
      value: closedWon,
      sub: `${leads.length > 0 ? Math.round((closedWon / leads.length) * 100) : 0}% win rate`,
      accent: '#f59e0b',
      glowColor: 'rgba(245,158,11,0.08)',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
        </svg>
      ),
    },
  ]

  const pipelineRows = Object.entries(statusCounts).sort((a, b) => b[1] - a[1])

  const barConfig: Record<string, { bar: string; dot: string }> = {
    'New':         { bar: 'bg-cyan-400',    dot: 'bg-cyan-400' },
    'Contacted':   { bar: 'bg-amber-400',   dot: 'bg-amber-400' },
    'Qualified':   { bar: 'bg-purple-400',  dot: 'bg-purple-400' },
    'Closed Won':  { bar: 'bg-emerald-400', dot: 'bg-emerald-400' },
    'Closed Lost': { bar: 'bg-rose-400',    dot: 'bg-rose-400' },
    'Follow Up':   { bar: 'bg-orange-400',  dot: 'bg-orange-400' },
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Clash Display', sans-serif; }
        .font-body    { font-family: 'DM Sans', sans-serif; }
        .font-mono    { font-family: 'JetBrains Mono', monospace; }
        .stat-card:hover .stat-glow { opacity: 1; }
        .stat-glow { opacity: 0; transition: opacity 0.4s ease; }
        .lead-row:hover { background: rgba(255,255,255,0.018); }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeUp { animation: fadeUp 0.5s ease forwards; }
        .delay-1 { animation-delay: 0.05s; opacity: 0; }
        .delay-2 { animation-delay: 0.10s; opacity: 0; }
        .delay-3 { animation-delay: 0.15s; opacity: 0; }
        .delay-4 { animation-delay: 0.20s; opacity: 0; }
        .delay-5 { animation-delay: 0.25s; opacity: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.25); border-radius: 4px; }
      `}</style>

      {/* ── Root layout: Sidebar + right column ── */}
      <div className="flex min-h-screen w-screen bg-[#05080f] overflow-x-hidden font-body">
        <Sidebar />

        {/* Right column: Header on top, then main content below */}
        <div className="flex flex-col flex-1 min-w-0">

          {/* ✅ Header lives HERE — inside the right column, above main */}
          <DashboardHeader userName={user?.name} />

          <main className="flex-1 min-w-0 overflow-x-hidden relative">

            {/* Background atmosphere */}
            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
              <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)' }} />
              <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 70%)' }} />
              <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.03) 0%, transparent 70%)' }} />
              <div className="absolute inset-0" style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)`,
                backgroundSize: '60px 60px'
              }} />
            </div>

            <div className="w-full px-6 sm:px-10 lg:px-16 py-10 lg:py-12 space-y-8">

              {/* ── Page heading ── */}
              <div className="animate-fadeUp flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 rounded-full bg-indigo-500" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-indigo-400/70 font-mono">
                      OVERVIEW
                    </span>
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-display font-bold text-white tracking-tight leading-tight">
                    Welcome back,{' '}
                    <span style={{
                      background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #818cf8 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                      {user?.name?.split(' ')[0] ?? 'there'}
                    </span>
                  </h1>
                  <p className="text-slate-500 text-sm mt-2 font-light tracking-wide">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>

                <Link
                  href="/leads"
                  className="self-start sm:self-auto group flex items-center gap-2.5 text-white px-7 py-3.5 rounded-2xl font-semibold text-sm whitespace-nowrap transition-all active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    boxShadow: '0 0 30px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                  }}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Lead
                  <svg className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </Link>
              </div>

              {/* ── Stats Grid ── */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                  <div
                    key={s.label}
                    className={`stat-card relative animate-fadeUp delay-${i + 1} rounded-2xl p-6 overflow-hidden cursor-default transition-transform hover:-translate-y-0.5`}
                    style={{
                      background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                    }}
                  >
                    <div
                      className="stat-glow absolute inset-0 rounded-2xl pointer-events-none"
                      style={{ background: `radial-gradient(circle at 30% 30%, ${s.glowColor} 0%, transparent 70%)` }}
                    />
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 relative z-10"
                      style={{ background: `${s.accent}18`, color: s.accent, border: `1px solid ${s.accent}25` }}
                    >
                      {s.icon}
                    </div>
                    <p className="text-[42px] font-display font-bold leading-none mb-2 relative z-10" style={{ color: s.accent }}>
                      {s.value}
                    </p>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 relative z-10">{s.label}</p>
                    <p className="text-[11px] text-slate-600 mt-1 relative z-10 font-light">{s.sub}</p>
                    <div
                      className="absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"
                      style={{ background: `radial-gradient(circle, ${s.glowColor} 0%, transparent 70%)` }}
                    />
                  </div>
                ))}
              </div>

              {/* ── Bottom Grid ── */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 animate-fadeUp delay-5">

                {/* Recent Leads */}
                <div
                  className="xl:col-span-2 rounded-2xl overflow-hidden"
                  style={{
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                  }}
                >
                  <div className="px-7 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <h2 className="text-white font-display font-semibold text-base">Recent Leads</h2>
                      <p className="text-slate-600 text-[11px] mt-0.5 font-light">Latest activity</p>
                    </div>
                    <Link href="/leads" className="flex items-center gap-1.5 text-indigo-400 text-xs font-semibold hover:text-indigo-300 transition-colors group">
                      View all
                      <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                      </svg>
                    </Link>
                  </div>

                  {recentLeads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-indigo-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                        </svg>
                      </div>
                      <p className="text-slate-600 text-sm">No leads yet</p>
                      <Link href="/leads" className="text-indigo-400 text-xs hover:text-indigo-300 transition-colors">
                        Add your first lead →
                      </Link>
                    </div>
                  ) : (
                    <div>
                      {recentLeads.map((lead, idx) => (
                        <Link
                          key={lead.id}
                          href="/leads"
                          className="lead-row flex items-center gap-4 px-7 py-4 transition-colors group"
                          style={{ borderBottom: idx < recentLeads.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}
                        >
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-display font-bold text-xs"
                            style={{
                              background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))',
                              border: '1px solid rgba(99,102,241,0.2)',
                              color: '#a5b4fc',
                            }}
                          >
                            {lead.email[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-200 text-sm font-medium truncate group-hover:text-indigo-300 transition-colors">
                              {lead.email}
                            </p>
                            <p className="text-[11px] text-slate-600 truncate font-light mt-0.5">
                              {[lead.exam, lead.country].filter(Boolean).join(' · ') || 'No details'}
                            </p>
                          </div>
                          <span className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-semibold flex-shrink-0 tracking-wide ${STATUS_COLORS[lead.status] ?? 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                            {lead.status}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pipeline */}
                <div
                  className="rounded-2xl overflow-hidden flex flex-col"
                  style={{
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                  }}
                >
                  <div className="px-7 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <h2 className="text-white font-display font-semibold text-base">Pipeline</h2>
                    <p className="text-slate-600 text-[11px] mt-0.5 font-light">Distribution by status</p>
                  </div>
                  <div className="p-6 space-y-4 flex-1">
                    {pipelineRows.length === 0 ? (
                      <p className="text-slate-600 text-sm text-center py-10">No pipeline data yet</p>
                    ) : pipelineRows.map(([status, count]) => {
                      const pct = leads.length > 0 ? (count / leads.length) * 100 : 0
                      const cfg = barConfig[status] ?? { bar: 'bg-slate-600', dot: 'bg-slate-500' }
                      return (
                        <div key={status} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                              <span className="text-slate-300 text-[13px] font-medium">{status}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 text-[11px] font-mono">{pct.toFixed(0)}%</span>
                              <span className="text-slate-400 text-[11px] font-semibold w-5 text-right">{count}</span>
                            </div>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                            <div className={`h-full rounded-full transition-all duration-700 ${cfg.bar}`} style={{ width: `${pct}%`, opacity: 0.6 }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="px-6 pb-6">
                    <Link
                      href="/leads"
                      className="flex items-center justify-between w-full px-4 py-3.5 rounded-xl transition-all group"
                      style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}
                    >
                      <span className="text-slate-400 group-hover:text-indigo-300 text-[13px] font-medium transition-colors">
                        Manage All Leads
                      </span>
                      <svg className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>{/* end right column */}
      </div>
    </>
  )
}