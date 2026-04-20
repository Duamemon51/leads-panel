'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1.5" strokeWidth="1.75"/>
        <rect x="14" y="3" width="7" height="7" rx="1.5" strokeWidth="1.75"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5" strokeWidth="1.75"/>
        <rect x="14" y="14" width="7" height="7" rx="1.5" strokeWidth="1.75"/>
      </svg>
    ),
  },
  {
    href: '/leads',
    label: 'All Leads',
    icon: (
      <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4" strokeWidth="1.75"/>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
]

const LogoMark = ({ size = 36 }: { size?: number }) => (
  <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
    <div
      className="absolute inset-0 rounded-xl"
      style={{
        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
        filter: 'blur(8px)',
        opacity: 0.45,
        transform: 'translateY(2px)',
      }}
    />
    <div
      className="relative w-full h-full rounded-xl flex items-center justify-center"
      style={{
        background: 'linear-gradient(145deg, #4f46e5 0%, #7c3aed 100%)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
      }}
    >
      <svg width={size * 0.52} height={size * 0.52} fill="none" stroke="white" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
      </svg>
    </div>
  </div>
)

export default function Sidebar() {
  const pathname            = usePathname()
  const router              = useRouter()
  const [user, setUser]     = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen]     = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' })
        if (res.ok) setUser((await res.json()).user)
      } catch {}
      setLoading(false)
    })()
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])

  // Lock body scroll when drawer open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleLogout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }) }
    finally { router.push('/login') }
  }

  const initial = loading ? '…' : (user?.name?.[0]?.toUpperCase() ?? '?')

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full">

      {/* ── Logo ── */}
      <div
        className="px-5 py-5 flex items-center justify-between flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center gap-3">
          <LogoMark size={36} />
          <div>
            <h1
              className="text-white font-bold text-[15px] leading-none tracking-tight"
              style={{ fontFamily: 'Clash Display, sans-serif' }}
            >
              LeadPanel
            </h1>
            <span
              className="text-[9px] font-medium uppercase tracking-[0.22em] mt-0.5 block"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: 'rgba(129,140,248,0.6)' }}
            >
              CompTIA Manager
            </span>
          </div>
        </div>

        {mobile && (
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg transition-colors text-slate-500 hover:text-white"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        )}
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 pt-5 space-y-1">
        <p
          className="px-3 pb-3 text-[9px] font-semibold uppercase tracking-[0.28em] text-slate-600"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        >
          Navigation
        </p>

        {navItems.map(({ href, label, icon }) => {
          const isActive = href === '/leads'
            ? pathname.startsWith('/leads')
            : pathname === href

          return (
            <Link
              key={href}
              href={href}
              className="group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-200 active:scale-[0.98]"
              style={{
                color: isActive ? '#a5b4fc' : '#64748b',
                background: isActive ? 'rgba(99,102,241,0.1)' : 'transparent',
                border: isActive ? '1px solid rgba(99,102,241,0.18)' : '1px solid transparent',
                fontFamily: 'DM Sans, sans-serif',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.color = '#cbd5e1'
                  ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.color = '#64748b'
                  ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                }
              }}
            >
              {/* Active left bar */}
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                  style={{ background: 'linear-gradient(to bottom, #818cf8, #7c3aed)' }}
                />
              )}

              <div className="flex items-center gap-3 pl-1">
                <span style={{ color: isActive ? '#818cf8' : '#475569', transition: 'color 0.15s' }}>
                  {icon}
                </span>
                {label}
              </div>

              {isActive && (
                <svg
                  width="12" height="12"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  style={{ color: 'rgba(129,140,248,0.4)', flexShrink: 0 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/>
                </svg>
              )}
            </Link>
          )
        })}
      </nav>

      {/* ── Version tag ── */}
      <div className="px-4 pb-3">
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.02)' }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: '#34d399', boxShadow: '0 0 5px rgba(52,211,153,0.6)' }}
          />
          <span
            className="text-[10px] text-slate-600"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            System Online
          </span>
        </div>
      </div>

      {/* ── User card ── */}
      <div
        className="p-3 flex-shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div
          className="flex items-center gap-3 p-3 rounded-xl transition-all"
          style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.5), rgba(168,85,247,0.5))',
                border: '1px solid rgba(99,102,241,0.25)',
                fontFamily: 'Clash Display, sans-serif',
              }}
            >
              {initial}
            </div>
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
              style={{
                background: '#34d399',
                border: '2px solid #0b0f1a',
                boxShadow: '0 0 6px rgba(52,211,153,0.5)',
              }}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p
              className="text-slate-200 text-[13px] font-semibold truncate leading-tight"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              {loading ? 'Loading…' : (user?.name || 'Guest')}
            </p>
            <p
              className="text-[10px] text-slate-600 capitalize truncate mt-0.5 font-light"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              {user?.role || 'Limited Access'}
            </p>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex-shrink-0 p-1.5 rounded-lg transition-all"
            title="Sign Out"
            style={{ color: '#475569' }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLElement).style.color = '#fb7185'
              ;(e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.08)'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLElement).style.color = '#475569'
              ;(e.currentTarget as HTMLElement).style.background = 'transparent'
            }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Google Fonts — must load once globally; safe to repeat */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=JetBrains+Mono:wght@400;500&display=swap');

        @keyframes drawerIn {
          from { transform: translateX(-100%); opacity: 0.6; }
          to   { transform: translateX(0);     opacity: 1; }
        }
        @keyframes backdropIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .drawer-anim   { animation: drawerIn   0.28s cubic-bezier(0.32, 0.72, 0, 1); }
        .backdrop-fade { animation: backdropIn 0.2s ease; }

        /* Pulse dot */
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0   rgba(52,211,153,0.5); }
          70%  { box-shadow: 0 0 0 5px rgba(52,211,153,0); }
          100% { box-shadow: 0 0 0 0   rgba(52,211,153,0); }
        }
        .pulse-online { animation: pulse-ring 2.5s ease-out infinite; }
      `}</style>

      {/* ══ Mobile top bar ══ */}
      <header
        className="lg:hidden sticky top-0 z-50 flex items-center justify-between px-4 py-3"
        style={{
          background: 'rgba(5,8,15,0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <LogoMark size={30} />
          <span
            className="text-white font-bold text-[14px]"
            style={{ fontFamily: 'Clash Display, sans-serif' }}
          >
            LeadPanel
          </span>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-xl transition-all"
          aria-label="Open menu"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            color: '#94a3b8',
          }}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
      </header>

      {/* ══ Mobile drawer backdrop ══ */}
      {open && (
        <div
          className="fixed inset-0 z-[60] lg:hidden backdrop-fade"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* ══ Mobile drawer ══ */}
      {open && (
        <aside
          className="fixed top-0 left-0 h-full w-64 z-[70] lg:hidden drawer-anim flex flex-col"
          style={{
            background: 'linear-gradient(160deg, #0b0f1a 0%, #080c16 100%)',
            borderRight: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '8px 0 40px rgba(0,0,0,0.5)',
          }}
        >
          <SidebarContent mobile />
        </aside>
      )}

      {/* ══ Desktop sidebar ══ */}
      <aside
        className="hidden lg:flex w-60 xl:w-64 flex-shrink-0 flex-col min-h-screen"
        style={{
          background: 'linear-gradient(160deg, #0b0f1a 0%, #080c16 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <SidebarContent />
      </aside>
    </>
  )
}