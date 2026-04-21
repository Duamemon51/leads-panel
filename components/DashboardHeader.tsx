'use client'

import { useTheme } from './ThemeProvider'
import { useState, useEffect } from 'react'

interface DashboardHeaderProps {
  userName?: string
}

function ThemeToggleBtn() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggle}
      title={isDark ? 'Light mode on karo' : 'Dark mode on karo'}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
        padding: '7px 14px',
        borderRadius: '12px',
        border: isDark
          ? '1px solid rgba(255,255,255,0.09)'
          : '1px solid rgba(0,0,0,0.10)',
        background: isDark
          ? 'rgba(255,255,255,0.04)'
          : 'rgba(0,0,0,0.04)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        color: isDark ? '#94a3b8' : '#64748b',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLButtonElement
        el.style.background = isDark ? 'rgba(99,102,241,0.12)' : 'rgba(79,70,229,0.08)'
        el.style.borderColor = isDark ? 'rgba(99,102,241,0.3)' : 'rgba(79,70,229,0.25)'
        el.style.color = '#818cf8'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLButtonElement
        el.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'
        el.style.borderColor = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.10)'
        el.style.color = isDark ? '#94a3b8' : '#64748b'
      }}
    >
      {/* Track */}
      <div style={{
        width: '34px',
        height: '18px',
        borderRadius: '999px',
        background: isDark
          ? 'rgba(99,102,241,0.25)'
          : 'rgba(79,70,229,0.15)',
        border: isDark
          ? '1px solid rgba(99,102,241,0.35)'
          : '1px solid rgba(79,70,229,0.25)',
        position: 'relative',
        transition: 'all 0.25s ease',
        flexShrink: 0,
      }}>
        {/* Thumb */}
        <div style={{
          position: 'absolute',
          top: '2px',
          left: isDark ? '2px' : '16px',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: isDark ? '#6366f1' : '#4f46e5',
          boxShadow: '0 0 8px rgba(99,102,241,0.6)',
          transition: 'left 0.25s cubic-bezier(0.34,1.56,0.64,1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {isDark ? (
            <svg width="7" height="7" viewBox="0 0 24 24" fill="white">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          ) : (
            <svg width="7" height="7" viewBox="0 0 24 24" fill="white">
              <circle cx="12" cy="12" r="4"/>
              <path stroke="white" strokeWidth="2.5" strokeLinecap="round"
                d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
              />
            </svg>
          )}
        </div>
      </div>

      <span style={{
        fontSize: '12px',
        fontWeight: 500,
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
        fontFamily: 'DM Sans, sans-serif',
      }}>
        {isDark ? 'Light' : 'Dark'}
      </span>
    </button>
  )
}

export default function DashboardHeader({ userName }: DashboardHeaderProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [time, setTime] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)

  useEffect(() => {
    const tick = () => {
      setTime(new Date().toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: true
      }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // ── Theme-aware tokens ──
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'
  const bgColor     = isDark ? 'rgba(5,8,15,0.85)'     : 'rgba(255,255,255,0.92)'
  const textPrimary = isDark ? '#e2e8f0'                : '#0f172a'
  const textMuted   = isDark ? '#64748b'                : '#94a3b8'
  const pillBg      = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'
  const pillBorder  = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'
  const iconHoverBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const iconHoverColor = isDark ? '#e2e8f0' : '#0f172a'
  const breadcrumbAccent = '#6366f1'
  const accentBarColor = 'linear-gradient(to bottom, #6366f1, #7c3aed)'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@500;600;700&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        @keyframes headerSlideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .header-root {
          animation: headerSlideDown 0.35s ease forwards;
          transition: background 0.25s ease, border-color 0.25s ease;
        }
        .header-notif-dot {
          animation: pulse-notif 2s ease-in-out infinite;
        }
        @keyframes pulse-notif {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); }
          50%       { box-shadow: 0 0 0 4px rgba(239,68,68,0); }
        }
        @keyframes pulse-green {
          0%, 100% { box-shadow: 0 0 0 0 rgba(52,211,153,0.5); }
          50%       { box-shadow: 0 0 0 4px rgba(52,211,153,0); }
        }
        .header-icon-btn {
          transition: all 0.15s ease;
        }
        .header-icon-btn:hover {
          background: ${iconHoverBg} !important;
          color: ${iconHoverColor} !important;
        }
      `}</style>

      <header
        className="header-root sticky top-0 z-40 w-full"
        style={{
          background: bgColor,
          borderBottom: `1px solid ${borderColor}`,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div style={{
          maxWidth: '100%',
          padding: '0 24px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>

          {/* Left — Page title + breadcrumb */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '3px',
                height: '16px',
                borderRadius: '2px',
                background: accentBarColor,
                flexShrink: 0,
              }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    fontSize: '11px',
                    color: breadcrumbAccent,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 500,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                  }}>
                    LeadPanel
                  </span>
                  <svg width="10" height="10" fill="none" stroke={textMuted} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                  </svg>
                  <span style={{
                    fontSize: '11px',
                    color: textMuted,
                    fontFamily: 'JetBrains Mono, monospace',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                  }}>
                    Dashboard
                  </span>
                </div>
                <h1 style={{
                  fontFamily: 'Clash Display, sans-serif',
                  fontWeight: 600,
                  fontSize: '16px',
                  color: textPrimary,
                  margin: 0,
                  lineHeight: 1.2,
                  transition: 'color 0.25s ease',
                }}>
                  {userName ? `Welcome, ${userName.split(' ')[0]}` : 'Overview'}
                </h1>
              </div>
            </div>
          </div>

          {/* Center — Live clock (hidden on mobile) */}
          <div
            className="hidden sm:flex"
            style={{
              alignItems: 'center',
              gap: '8px',
              padding: '5px 14px',
              borderRadius: '10px',
              background: pillBg,
              border: `1px solid ${pillBorder}`,
              transition: 'background 0.25s ease, border-color 0.25s ease',
            }}
          >
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: '#34d399',
              boxShadow: '0 0 6px rgba(52,211,153,0.7)',
              animation: 'pulse-green 2.5s ease-in-out infinite',
            }} />
            <span style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '12px',
              fontWeight: 500,
              color: textMuted,
              letterSpacing: '0.05em',
              transition: 'color 0.25s ease',
            }}>
              {time}
            </span>
          </div>

          {/* Right — Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>

            {/* Theme Toggle */}
            <ThemeToggleBtn />

          

         

          </div>
        </div>
      </header>
    </>
  )
}