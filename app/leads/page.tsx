'use client'

import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import DashboardHeader from '@/components/DashboardHeader'
import LeadForm from '@/components/LeadForm'

interface LeadFull {
  id: string
  email: string
  country: string
  address: string
  phone: string
  comptiaId: string
  exam: string
  examDate: string
  price: string
  orderNo: string
  regId: string
  status: string
  vueId: string
  city: string
  state: string
  postalCode: string
  where: string
  dateTime: string
  who: string
  payment: string
  stateY: string
  disposition: string
  linkedinProfile: string
  createdAt?: string
}

type ModalType = 'add' | 'edit' | 'view' | 'delete' | null

const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; dot: string; glow: string }> = {
  'New':         { bg: 'bg-cyan-400/8',    text: 'text-cyan-300',     border: 'border-cyan-400/20',    dot: 'bg-cyan-400',    glow: 'rgba(34,211,238,0.5)' },
  'Contacted':   { bg: 'bg-amber-400/8',   text: 'text-amber-300',    border: 'border-amber-400/20',   dot: 'bg-amber-400',   glow: 'rgba(251,191,36,0.5)' },
  'Qualified':   { bg: 'bg-purple-400/8',  text: 'text-purple-300',   border: 'border-purple-400/20',  dot: 'bg-purple-400',  glow: 'rgba(192,132,252,0.5)' },
  'Closed Won':  { bg: 'bg-emerald-400/8', text: 'text-emerald-300',  border: 'border-emerald-400/20', dot: 'bg-emerald-400', glow: 'rgba(52,211,153,0.5)' },
  'Closed Lost': { bg: 'bg-rose-400/8',    text: 'text-rose-300',     border: 'border-rose-400/20',    dot: 'bg-rose-400',    glow: 'rgba(251,113,133,0.5)' },
  'Follow Up':   { bg: 'bg-orange-400/8',  text: 'text-orange-300',   border: 'border-orange-400/20',  dot: 'bg-orange-400',  glow: 'rgba(251,146,60,0.5)' },
}
const FALLBACK = { bg: 'bg-slate-800/40', text: 'text-slate-400', border: 'border-slate-700/40', dot: 'bg-slate-500', glow: 'rgba(148,163,184,0.5)' }

const FIELD_GROUPS = [
  { title: 'Contact', icon: '◎', fields: [
    { label: 'Email', key: 'email' }, { label: 'Phone', key: 'phone' }, { label: 'LinkedIn', key: 'linkedinProfile' },
  ]},
  { title: 'Location', icon: '◈', fields: [
    { label: 'Country', key: 'country' }, { label: 'City', key: 'city' },
    { label: 'State', key: 'state' }, { label: 'Postal Code', key: 'postalCode' }, { label: 'Address', key: 'address' },
  ]},
  { title: 'Exam Details', icon: '◇', fields: [
    { label: 'Exam', key: 'exam' }, { label: 'Exam Date', key: 'examDate' },
    { label: 'CompTIA ID', key: 'comptiaId' }, { label: 'VUE ID', key: 'vueId' },
    { label: 'Reg ID', key: 'regId' }, { label: 'Order No', key: 'orderNo' }, { label: 'Price', key: 'price' },
  ]},
  { title: 'Scheduling', icon: '◑', fields: [
    { label: 'Where', key: 'where' }, { label: 'Date & Time', key: 'dateTime' }, { label: 'Who', key: 'who' },
  ]},
  { title: 'Status & Payment', icon: '◐', fields: [
    { label: 'Status', key: 'status' }, { label: 'Payment', key: 'payment' },  { label: 'State Y', key: 'stateY' }, { label: 'Disposition', key: 'disposition' },
  ]},
]

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_CONFIG[status] ?? FALLBACK
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-semibold whitespace-nowrap tracking-wide ${s.bg} ${s.text} ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} style={{ boxShadow: `0 0 4px ${s.glow}` }} />
      {status || 'N/A'}
    </span>
  )
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between items-start gap-6 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600 shrink-0 pt-px font-mono w-28">{label}</span>
      <span className="text-[13px] text-slate-200 text-right break-all leading-relaxed font-light">{value || '—'}</span>
    </div>
  )
}

function CloseBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-8 h-8 flex items-center justify-center rounded-xl transition-all flex-shrink-0 text-slate-500 hover:text-white"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  )
}

const panelStyle = {
  background: 'linear-gradient(145deg, rgba(14,18,32,0.98) 0%, rgba(10,13,24,0.98) 100%)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)',
}

export default function LeadsPage() {
  const [leads, setLeads]               = useState<LeadFull[]>([])
  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading]           = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modal, setModal]               = useState<ModalType>(null)
  const [selected, setSelected]         = useState<LeadFull | null>(null)

  const openModal  = (type: ModalType, lead?: LeadFull) => { setSelected(lead ?? null); setModal(type) }
  const closeModal = () => { setModal(null); setSelected(null) }

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams()
      if (search) p.set('search', search)
      if (statusFilter) p.set('status', statusFilter)
      const res  = await fetch(`/api/leads?${p}`, { credentials: 'include' })
      const data = await res.json()
      setLeads(data.data?.leads ?? [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchLeads() }, [search, statusFilter])

  const handleCreate = async (fd: any) => {
    setIsSubmitting(true)
    try {
      const r = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fd), credentials: 'include' })
      if (r.ok) { closeModal(); fetchLeads() }
    } finally { setIsSubmitting(false) }
  }

  const handleEdit = async (fd: any) => {
    if (!selected) return
    setIsSubmitting(true)
    try {
      const r = await fetch(`/api/leads/${selected.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fd), credentials: 'include' })
      if (r.ok) { closeModal(); fetchLeads() }
    } finally { setIsSubmitting(false) }
  }

  const handleDelete = async () => {
    if (!selected) return
    await fetch(`/api/leads/${selected.id}`, { method: 'DELETE', credentials: 'include' })
    setLeads(p => p.filter(l => l.id !== selected.id))
    closeModal()
  }

  const statCards = [
    { label: 'Total',      value: leads.length,                                        color: '#818cf8', glow: 'rgba(129,140,248,0.15)' },
    { label: 'New',        value: leads.filter(l => l.status === 'New').length,        color: '#22d3ee', glow: 'rgba(34,211,238,0.12)' },
    { label: 'Closed Won', value: leads.filter(l => l.status === 'Closed Won').length, color: '#34d399', glow: 'rgba(52,211,153,0.12)' },
    { label: 'Follow Up',  value: leads.filter(l => l.status === 'Follow Up').length,  color: '#fbbf24', glow: 'rgba(251,191,36,0.12)' },
  ]

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Clash Display', sans-serif; }
        .font-body    { font-family: 'DM Sans', sans-serif; }
        .font-mono-jb { font-family: 'JetBrains Mono', monospace; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.45s ease forwards; }

        .table-row:hover { background: rgba(255,255,255,0.016); }

        input::placeholder, select option { color: #475569; }
        input:focus, select:focus { outline: none; }

        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.2); border-radius: 4px; }

        .payment-paid    { color: #34d399; }
        .payment-pending { color: #fbbf24; }
        .payment-failed  { color: #f87171; }
        .payment-default { color: #64748b; }

        .action-btn { padding: 7px; border-radius: 10px; transition: all 0.15s ease; color: #475569; }
        .action-btn:hover { background: rgba(255,255,255,0.05); color: #cbd5e1; }
        .action-btn.edit:hover { background: rgba(99,102,241,0.1); color: #818cf8; }
        .action-btn.del:hover  { background: rgba(244,63,94,0.1);  color: #fb7185; }

        @keyframes backdropIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.97) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes sheetUp {
          from { opacity: 0; transform: translateY(100%); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .backdrop-anim { animation: backdropIn 0.2s ease; }
        .modal-anim    { animation: modalIn 0.25s ease; }

        /* Mobile: bottom sheet */
        @media (max-width: 639px) {
          .modal-shell {
            position: fixed !important;
            inset: auto 0 0 0 !important;
            max-width: 100% !important;
            max-height: 92dvh !important;
            border-radius: 24px 24px 0 0 !important;
            animation: sheetUp 0.3s cubic-bezier(0.32,0.72,0,1) !important;
          }
          .modal-shell-sm {
            position: fixed !important;
            inset: auto 0 0 0 !important;
            max-width: 100% !important;
            border-radius: 24px 24px 0 0 !important;
            animation: sheetUp 0.3s cubic-bezier(0.32,0.72,0,1) !important;
          }
          .modal-drag-handle {
            display: block !important;
          }
          .modal-wrapper-mobile {
            align-items: flex-end !important;
            padding: 0 !important;
          }
        }
        .modal-drag-handle { display: none; }
      `}</style>

      <div className="flex flex-col lg:flex-row min-h-screen w-screen bg-[#05080f] text-slate-300 overflow-x-hidden font-body">
        <Sidebar />

        <main className="flex-1 min-w-0 overflow-x-hidden relative">
 <DashboardHeader userName="Admin" />
 
          {/* Background */}
          <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            <div className="absolute top-[-5%] right-[-5%] w-[550px] h-[550px] rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 65%)' }} />
            <div className="absolute bottom-[-10%] left-[10%] w-[400px] h-[400px] rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 65%)' }} />
            <div className="absolute inset-0" style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.014) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(255,255,255,0.014) 1px, transparent 1px)`,
              backgroundSize: '60px 60px'
            }} />
          </div>

          <div className="w-full px-6 sm:px-10 lg:px-16 py-10 lg:py-14">

            {/* ── Header ── */}
            <div className="fade-up flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 rounded-full bg-indigo-500" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-indigo-400/70 font-mono-jb">
                    CRM DASHBOARD
                  </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-display font-bold text-white tracking-tight leading-none">
                  Leads{' '}
                  <span style={{
                    background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 60%, #818cf8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    Overview
                  </span>
                </h1>
                <p className="text-slate-500 text-sm mt-3 font-light">Track and manage your certification candidates.</p>
              </div>

              <button
                onClick={() => openModal('add')}
                className="self-start sm:self-auto group flex items-center gap-2.5 text-white px-7 py-3.5 rounded-2xl font-semibold text-sm whitespace-nowrap flex-shrink-0 transition-all active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  boxShadow: '0 0 28px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Lead
              </button>
            </div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statCards.map(({ label, value, color, glow }) => (
                <div
                  key={label}
                  className="fade-up rounded-2xl px-6 py-6 transition-transform hover:-translate-y-0.5 cursor-default"
                  style={{
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                  }}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] mb-4 font-mono-jb" style={{ color }}>
                    {label}
                  </p>
                  <p className="text-[52px] font-display font-bold leading-none tabular-nums" style={{ color }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* ── Filters ── */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by email, country, exam…"
                  className="w-full pl-11 pr-4 py-3.5 text-white text-sm placeholder-slate-600 transition-all rounded-xl"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(99,102,241,0.4)')}
                  onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.07)')}
                />
              </div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-4 py-3.5 text-slate-300 text-sm transition-all cursor-pointer min-w-[170px] rounded-xl"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <option value="">All Statuses</option>
                {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* ── Table ── */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
              }}
            >
              {loading ? (
                <div className="flex items-center justify-center py-32">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full" style={{ border: '1px solid rgba(99,102,241,0.1)' }} />
                    <div className="absolute inset-0 w-10 h-10 rounded-full animate-spin" style={{ borderTop: '2px solid #6366f1', border: '2px solid transparent', borderTopColor: '#6366f1' }} />
                  </div>
                </div>
              ) : (
                <>
                  {/* Desktop */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          {['Identity', 'Exam & Region', 'Status', 'Payment', 'Actions'].map((h, i) => (
                            <th
                              key={h}
                              className={`px-7 py-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600 font-mono-jb ${i === 4 ? 'text-right' : 'text-left'}`}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {leads.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-28 text-center">
                              <p className="text-slate-600 text-sm mb-2">No leads found</p>
                              <button onClick={() => openModal('add')} className="text-indigo-400 text-xs hover:text-indigo-300 transition-colors">
                                Add your first lead →
                              </button>
                            </td>
                          </tr>
                        ) : leads.map(lead => (
                          <tr
                            key={lead.id}
                            className="table-row transition-colors"
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                          >
                            <td className="px-7 py-4">
                              <button onClick={() => openModal('view', lead)} className="text-left group/id">
                                <span className="text-slate-200 font-medium text-sm block group-hover/id:text-indigo-300 transition-colors">
                                  {lead.email}
                                </span>
                                <span className="text-[11px] text-slate-600 font-mono-jb mt-0.5 block">
                                  #{lead.id.slice(-8).toUpperCase()}
                                </span>
                              </button>
                            </td>
                            <td className="px-7 py-4">
                              <span className="text-slate-300 font-medium text-sm block">{lead.exam || '—'}</span>
                              <span className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5 font-light">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"/>
                                </svg>
                                {lead.country || 'International'}
                              </span>
                            </td>
                            <td className="px-7 py-4">
                              <StatusBadge status={lead.status} />
                            </td>
                            <td className="px-7 py-4">
                              <span className={`text-[12px] font-semibold font-mono-jb ${
                                lead.payment === 'Paid'    ? 'payment-paid' :
                                lead.payment === 'Pending' ? 'payment-pending' :
                                lead.payment === 'Failed'  ? 'payment-failed' : 'payment-default'
                              }`}>
                                {lead.payment || '—'}
                              </span>
                            </td>
                            <td className="px-7 py-4">
                              <div className="flex items-center justify-end gap-1">
                                <button onClick={() => openModal('view', lead)} className="action-btn">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                  </svg>
                                </button>
                                <button onClick={() => openModal('edit', lead)} className="action-btn edit">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                  </svg>
                                </button>
                                <button onClick={() => openModal('delete', lead)} className="action-btn del">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="md:hidden divide-y" style={{ borderColor: 'rgba(255,255,255,0.03)' }}>
                    {leads.length === 0 ? (
                      <p className="py-16 text-center text-slate-600 text-sm">No leads found.</p>
                    ) : leads.map(lead => (
                      <div key={lead.id} className="p-5 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <button onClick={() => openModal('view', lead)} className="text-left min-w-0">
                            <p className="text-slate-200 font-semibold text-sm truncate">{lead.email}</p>
                            <p className="text-[11px] text-slate-600 font-mono-jb mt-0.5">#{lead.id.slice(-8).toUpperCase()}</p>
                          </button>
                          <StatusBadge status={lead.status} />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-slate-300 text-sm">{lead.exam || '—'}</p>
                            <p className="text-[11px] text-slate-600 font-light">{lead.country || 'International'}</p>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => openModal('view',   lead)} className="action-btn">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                            </button>
                            <button onClick={() => openModal('edit',   lead)} className="action-btn edit">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                            </button>
                            <button onClick={() => openModal('delete', lead)} className="action-btn del">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {!loading && leads.length > 0 && (
              <p className="text-center text-[11px] text-slate-700 mt-4 font-mono-jb">
                {leads.length} lead{leads.length !== 1 ? 's' : ''} total
              </p>
            )}
          </div>
        </main>

        {/* ── Backdrop ── */}
        {modal && (
          <div
            className="fixed inset-0 backdrop-anim z-[80]"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={closeModal}
          />
        )}

        {/* ── VIEW Modal ── */}
        {modal === 'view' && selected && (
          <div className="modal-wrapper-mobile fixed inset-0 z-[90] flex items-center justify-center sm:p-4 pointer-events-none">
            <div className="modal-shell modal-anim w-full sm:max-w-xl sm:rounded-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[92dvh] sm:max-h-[90vh]" style={panelStyle}>
              <div className="modal-drag-handle w-10 h-1 rounded-full mx-auto mt-3 mb-1 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.12)' }} />
              <div className="px-5 sm:px-7 py-4 sm:py-5 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="min-w-0 flex-1 mr-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-indigo-400/60 mb-1 font-mono-jb">Lead Detail</p>
                  <h2 className="text-sm font-semibold text-white truncate font-body">{selected.email}</h2>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={selected.status} />
                  <CloseBtn onClick={closeModal} />
                </div>
              </div>

              <div className="overflow-y-auto px-5 sm:px-7 py-5 space-y-4 flex-1">
                {FIELD_GROUPS.map(g => (
                  <div key={g.title}>
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="text-indigo-400/50 text-xs">{g.icon}</span>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-indigo-400/50 font-mono-jb">{g.title}</p>
                    </div>
                    <div className="rounded-xl px-4 sm:px-5 py-1" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                      {g.fields.map(({ label, key }) => (
                        <DetailRow key={key} label={label} value={(selected as any)[key]} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-5 sm:px-7 py-4 flex gap-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                  onClick={() => { closeModal(); setTimeout(() => openModal('edit', selected), 10) }}
                  className="flex-1 text-white text-sm font-semibold py-3.5 sm:py-3 rounded-xl transition-all active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 0 20px rgba(99,102,241,0.25)' }}
                >
                  Edit Lead
                </button>
                <button
                  onClick={() => { closeModal(); setTimeout(() => openModal('delete', selected), 10) }}
                  className="px-5 text-rose-400 text-sm font-semibold py-3.5 sm:py-3 rounded-xl transition-all border"
                  style={{ background: 'rgba(244,63,94,0.06)', borderColor: 'rgba(244,63,94,0.2)' }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── ADD Modal ── */}
        {modal === 'add' && (
          <div className="modal-wrapper-mobile fixed inset-0 z-[90] flex items-center justify-center sm:p-4 pointer-events-none">
            <div className="modal-shell modal-anim w-full sm:max-w-4xl sm:rounded-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[92dvh] sm:max-h-[90vh]" style={panelStyle}>
              <div className="modal-drag-handle w-10 h-1 rounded-full mx-auto mt-3 mb-1 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.12)' }} />
              <div className="px-5 sm:px-8 py-4 sm:py-6 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-indigo-400/60 mb-1 font-mono-jb">New Entry</p>
                  <h2 className="text-lg sm:text-xl font-display font-bold text-white">Create Lead</h2>
                </div>
                <CloseBtn onClick={closeModal} />
              </div>
              <div className="p-5 sm:p-8 overflow-y-auto">
                <LeadForm onSubmit={handleCreate} isLoading={isSubmitting} onCancel={closeModal} />
              </div>
            </div>
          </div>
        )}

        {/* ── EDIT Modal ── */}
        {modal === 'edit' && selected && (
          <div className="modal-wrapper-mobile fixed inset-0 z-[90] flex items-center justify-center sm:p-4 pointer-events-none">
            <div className="modal-shell modal-anim w-full sm:max-w-4xl sm:rounded-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[92dvh] sm:max-h-[90vh]" style={panelStyle}>
              <div className="modal-drag-handle w-10 h-1 rounded-full mx-auto mt-3 mb-1 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.12)' }} />
              <div className="px-5 sm:px-8 py-4 sm:py-6 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="min-w-0 flex-1 mr-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-indigo-400/60 mb-1 font-mono-jb">Editing</p>
                  <h2 className="text-lg sm:text-xl font-display font-bold text-white truncate">{selected.email}</h2>
                </div>
                <CloseBtn onClick={closeModal} />
              </div>
              <div className="p-5 sm:p-8 overflow-y-auto">
                <LeadForm initialData={selected as any} onSubmit={handleEdit} isLoading={isSubmitting} onCancel={closeModal} isEdit />
              </div>
            </div>
          </div>
        )}

        {/* ── DELETE Modal ── */}
        {modal === 'delete' && selected && (
          <div className="modal-wrapper-mobile fixed inset-0 z-[90] flex items-center justify-center sm:p-4 pointer-events-none">
            <div className="modal-shell-sm modal-anim w-full sm:max-w-sm sm:rounded-2xl overflow-hidden pointer-events-auto text-center" style={panelStyle}>
              <div className="modal-drag-handle w-10 h-1 rounded-full mx-auto mt-3 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.12)' }} />
              <div className="px-6 sm:px-8 pt-8 sm:pt-10 pb-6 sm:pb-8">
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 sm:mb-6"
                  style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', boxShadow: '0 0 30px rgba(244,63,94,0.08)' }}
                >
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-display font-bold text-white mb-2">Delete Lead?</h3>
                <p className="text-slate-500 text-sm mb-2 font-light">This will permanently remove</p>
                <p className="text-slate-200 font-medium text-sm break-all px-2">{selected.email}</p>
                <p className="text-slate-600 text-xs font-light mt-3">This action cannot be undone.</p>
              </div>
              <div className="px-6 sm:px-8 pb-8 sm:pb-8 flex gap-3">
                <button
                  onClick={handleDelete}
                  className="flex-1 text-white py-3.5 sm:py-3 rounded-xl font-semibold text-sm transition-all active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #e11d48, #be123c)', boxShadow: '0 0 20px rgba(225,29,72,0.25)' }}
                >
                  Yes, Delete
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 text-slate-300 py-3.5 sm:py-3 rounded-xl font-semibold text-sm transition-all hover:text-white"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}