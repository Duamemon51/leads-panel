'use client'

import { useEffect, useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import Sidebar from '@/components/Sidebar'
import DashboardHeader from '@/components/DashboardHeader'
import LeadForm from '@/components/LeadForm'
import { useTheme } from '@/components/ThemeProvider'

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
  disposition2?: string
  remarks?: string
  linkedinProfile: string
  createdAt?: string
}

type ModalType = 'add' | 'edit' | 'view' | 'delete' | 'import' | 'bulkDelete' | null

// ── Excel column header → LeadFull field mapping (case-insensitive) ──
const EXCEL_COL_MAP: Record<string, keyof LeadFull> = {
  'email':           'email',
  'e-mail':          'email',
  'phone':           'phone',
  'mobile':          'phone',
  'linkedin':        'linkedinProfile',
  'linkedinprofile': 'linkedinProfile',
  'country':         'country',
  'city':            'city',
  'state':           'state',
  'postalcode':      'postalCode',
  'postal code':     'postalCode',
  'zip':             'postalCode',
  'address':         'address',
  'exam':            'exam',
  'examdate':        'examDate',
  'exam date':       'examDate',
  'comptiaid':       'comptiaId',
  'comptia id':      'comptiaId',
  'vueid':           'vueId',
  'vue id':          'vueId',
  'regid':           'regId',
  'reg id':          'regId',
  'orderno':         'orderNo',
  'order no':        'orderNo',
  'order number':    'orderNo',
  'price':           'price',
  'where':           'where',
  'datetime':        'dateTime',
  'date & time':     'dateTime',
  'date/time':       'dateTime',
  'who':             'who',
  'status':          'status',
  'payment':         'payment',
  'statey':          'stateY',
  'state y':         'stateY',
  'disposition':     'disposition',
  'disposition2':    'disposition2',
  'disposition 2':   'disposition2',
  'remarks':         'remarks',
  'notes':           'remarks',
}

const EXPORT_COLUMNS: { label: string; key: keyof LeadFull }[] = [
  { label: 'Email',         key: 'email' },
  { label: 'Phone',         key: 'phone' },
  { label: 'LinkedIn',      key: 'linkedinProfile' },
  { label: 'Country',       key: 'country' },
  { label: 'City',          key: 'city' },
  { label: 'State',         key: 'state' },
  { label: 'Postal Code',   key: 'postalCode' },
  { label: 'Address',       key: 'address' },
  { label: 'Exam',          key: 'exam' },
  { label: 'Exam Date',     key: 'examDate' },
  { label: 'CompTIA ID',    key: 'comptiaId' },
  { label: 'VUE ID',        key: 'vueId' },
  { label: 'Reg ID',        key: 'regId' },
  { label: 'Order No',      key: 'orderNo' },
  { label: 'Price',         key: 'price' },
  { label: 'Where',         key: 'where' },
  { label: 'Date & Time',   key: 'dateTime' },
  { label: 'Who',           key: 'who' },
  { label: 'Status',        key: 'status' },
  { label: 'Payment',       key: 'payment' },
  { label: 'State Y',       key: 'stateY' },
  { label: 'Disposition',   key: 'disposition' },
  { label: 'Disposition 2', key: 'disposition2' },
  { label: 'Remarks',       key: 'remarks' },
]

const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; dot: string; glow: string }> = {
  'New':         { bg: 'bg-cyan-400/8',    text: 'text-cyan-300',    border: 'border-cyan-400/20',    dot: 'bg-cyan-400',    glow: 'rgba(34,211,238,0.5)' },
  'Contacted':   { bg: 'bg-amber-400/8',   text: 'text-amber-300',   border: 'border-amber-400/20',   dot: 'bg-amber-400',   glow: 'rgba(251,191,36,0.5)' },
  'Qualified':   { bg: 'bg-purple-400/8',  text: 'text-purple-300',  border: 'border-purple-400/20',  dot: 'bg-purple-400',  glow: 'rgba(192,132,252,0.5)' },
  'Closed Won':  { bg: 'bg-emerald-400/8', text: 'text-emerald-300', border: 'border-emerald-400/20', dot: 'bg-emerald-400', glow: 'rgba(52,211,153,0.5)' },
  'Closed Lost': { bg: 'bg-rose-400/8',    text: 'text-rose-300',    border: 'border-rose-400/20',    dot: 'bg-rose-400',    glow: 'rgba(251,113,133,0.5)' },
  'Follow Up':   { bg: 'bg-orange-400/8',  text: 'text-orange-300',  border: 'border-orange-400/20',  dot: 'bg-orange-400',  glow: 'rgba(251,146,60,0.5)' },
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
    { label: 'Status', key: 'status' }, { label: 'Payment', key: 'payment' },
    { label: 'State Y', key: 'stateY' }, { label: 'Disposition', key: 'disposition' },
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

function DetailRow({ label, value, isDark }: { label: string; value?: string; isDark: boolean }) {
  return (
    <div className="flex justify-between items-start gap-6 py-3" style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.05)'}` }}>
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] shrink-0 pt-px font-mono w-28" style={{ color: isDark ? '#475569' : '#94a3b8' }}>{label}</span>
      <span className="text-[13px] text-right break-all leading-relaxed font-light" style={{ color: isDark ? '#e2e8f0' : '#0f172a' }}>{value || '—'}</span>
    </div>
  )
}

function CloseBtn({ onClick, isDark }: { onClick: () => void; isDark: boolean }) {
  return (
    <button onClick={onClick}
      className="w-8 h-8 flex items-center justify-center rounded-xl transition-all flex-shrink-0"
      style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`, color: isDark ? '#64748b' : '#94a3b8' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = isDark ? '#ffffff' : '#0f172a'; (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = isDark ? '#64748b' : '#94a3b8'; (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}
    >
      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  )
}

export default function LeadsPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [leads, setLeads]               = useState<LeadFull[]>([])
  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading]           = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modal, setModal]               = useState<ModalType>(null)
  const [selected, setSelected]         = useState<LeadFull | null>(null)

  // ── Bulk select state ────────────────────────────────────────────────────────
  const [selectedIds, setSelectedIds]   = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)

  // ── Pagination state ─────────────────────────────────────────────────────────
  const PAGE_SIZE = 10
  const [currentPage, setCurrentPage]   = useState(1)

  // Import state
  const fileInputRef                      = useRef<HTMLInputElement>(null)
  const [importRows, setImportRows]       = useState<Partial<LeadFull>[]>([])
  const [importErrors, setImportErrors]   = useState<string[]>([])
  const [importLoading, setImportLoading] = useState(false)
  const [importDone, setImportDone]       = useState(false)
  const [isDragging, setIsDragging]       = useState(false)

  const openModal  = (type: ModalType, lead?: LeadFull) => { setSelected(lead ?? null); setModal(type) }
  const closeModal = () => {
    setModal(null); setSelected(null)
    setImportRows([]); setImportErrors([]); setImportDone(false); setIsDragging(false)
  }

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams()
      if (search) p.set('search', search)
      if (statusFilter) p.set('status', statusFilter)
      const res  = await fetch(`/api/leads?${p}`, { credentials: 'include' })
      const data = await res.json()
      setLeads(data.data?.leads ?? [])
      // Clear selection + reset page when leads reload
      setSelectedIds(new Set())
      setCurrentPage(1)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchLeads() }, [search, statusFilter])

  // Reset to page 1 when search or filter changes
  useEffect(() => { setCurrentPage(1) }, [search, statusFilter])

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

  // ── Bulk select handlers ─────────────────────────────────────────────────────
  const toggleSelect = (id: string) =>
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  // ── Pagination computed ──────────────────────────────────────────────────────
  const totalPages  = Math.max(1, Math.ceil(leads.length / PAGE_SIZE))
  const pagedLeads  = leads.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const goToPage = (p: number) => setCurrentPage(Math.min(Math.max(1, p), totalPages))

  const toggleSelectAll = () =>
    setSelectedIds(prev => {
      const pageIds = pagedLeads.map(l => l.id)
      const allPageSelected = pageIds.every(id => prev.has(id))
      const next = new Set(prev)
      if (allPageSelected) pageIds.forEach(id => next.delete(id))
      else pageIds.forEach(id => next.add(id))
      return next
    })

  // ── FIX: Use Array.from() instead of spread on Set ──────────────────────────
  const handleBulkDelete = async () => {
    if (!selectedIds.size) return
    setBulkDeleting(true)
    try {
      await Promise.all(
        Array.from(selectedIds).map(id =>
          fetch(`/api/leads/${id}`, { method: 'DELETE', credentials: 'include' })
        )
      )
      setLeads(prev => prev.filter(l => !selectedIds.has(l.id)))
      setSelectedIds(new Set())
      closeModal()
    } finally { setBulkDeleting(false) }
  }

  // ── EXPORT ──────────────────────────────────────────────────────────────────
  const handleExport = () => {
    const rows = leads.map(lead =>
      Object.fromEntries(EXPORT_COLUMNS.map(({ label, key }) => [label, (lead as any)[key] ?? '']))
    )
    const ws = XLSX.utils.json_to_sheet(rows)
    ws['!cols'] = EXPORT_COLUMNS.map(() => ({ wch: 22 }))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Leads')
    const date = new Date().toISOString().split('T')[0]
    XLSX.writeFile(wb, `leads-export-${date}.xlsx`)
  }

  // ── Download blank template ─────────────────────────────────────────────────
  const handleDownloadTemplate = () => {
    const blank = [Object.fromEntries(EXPORT_COLUMNS.map(({ label }) => [label, '']))]
    const ws = XLSX.utils.json_to_sheet(blank)
    ws['!cols'] = EXPORT_COLUMNS.map(() => ({ wch: 22 }))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Leads')
    XLSX.writeFile(wb, 'leads-import-template.xlsx')
  }

  // ── IMPORT: parse file ─────────────────────────────────────────────────────
  const parseFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const wb   = XLSX.read(data, { type: 'array' })
        const ws   = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' })

        const errors: string[] = []
        const parsed: Partial<LeadFull>[] = rows.map((row, i) => {
          const lead: Partial<LeadFull> = {}
          for (const [col, val] of Object.entries(row)) {
            const mapped = EXCEL_COL_MAP[col.trim().toLowerCase()]
            if (mapped) (lead as any)[mapped] = String(val).trim()
          }
          if (!lead.email) errors.push(`Row ${i + 2}: Email column missing or empty`)
          return lead
        })

        setImportRows(parsed)
        setImportErrors(errors)
      } catch {
        setImportErrors(['Could not parse file. Please use a valid .xlsx or .xls file.'])
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { setImportRows([]); setImportErrors([]); parseFile(file) }
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) { setImportRows([]); setImportErrors([]); parseFile(file) }
  }

  // ── IMPORT: submit valid rows to API ────────────────────────────────────────
  const handleImportSubmit = async () => {
    const valid = importRows.filter(r => r.email)
    if (!valid.length) return
    setImportLoading(true)
    try {
      for (const row of valid) {
        await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...row, status: row.status || 'New', payment: row.payment || '' }),
          credentials: 'include',
        })
      }
      setImportDone(true)
      fetchLeads()
    } finally { setImportLoading(false) }
  }

  const statCards = [
    { label: 'Total',      value: leads.length,                                        color: '#818cf8' },
    { label: 'New',        value: leads.filter(l => l.status === 'New').length,        color: '#22d3ee' },
    { label: 'Closed Won', value: leads.filter(l => l.status === 'Closed Won').length, color: '#34d399' },
    { label: 'Follow Up',  value: leads.filter(l => l.status === 'Follow Up').length,  color: '#fbbf24' },
  ]

  // ── Theme tokens ─────────────────────────────────────────────────────────────
  const modalBg        = isDark ? 'linear-gradient(145deg, rgba(14,18,32,0.98) 0%, rgba(10,13,24,0.98) 100%)' : 'linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(248,250,252,0.99) 100%)'
  const modalBorder    = isDark ? 'rgba(255,255,255,0.08)'  : 'rgba(0,0,0,0.09)'
  const modalShadow    = isDark ? '0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)' : '0 25px 80px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.04)'
  const modalDivider   = isDark ? 'rgba(255,255,255,0.06)'  : 'rgba(0,0,0,0.07)'
  const modalTitle     = isDark ? '#ffffff'                  : '#0f172a'
  const modalSubtitle  = isDark ? 'rgba(99,102,241,0.6)'    : 'rgba(79,70,229,0.55)'
  const dragHandle     = isDark ? 'rgba(255,255,255,0.12)'   : 'rgba(0,0,0,0.12)'
  const detailRowBg    = isDark ? 'rgba(255,255,255,0.02)'   : 'rgba(0,0,0,0.02)'
  const detailRowBorder= isDark ? 'rgba(255,255,255,0.04)'   : 'rgba(0,0,0,0.06)'
  const backdropBg     = isDark ? 'rgba(0,0,0,0.7)'          : 'rgba(0,0,0,0.35)'
  const tableBg        = isDark ? 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)' : 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)'
  const tableBorder    = isDark ? 'rgba(255,255,255,0.07)'  : 'rgba(0,0,0,0.08)'
  const thColor        = isDark ? '#475569'                  : '#94a3b8'
  const trBorder       = isDark ? 'rgba(255,255,255,0.03)'  : 'rgba(0,0,0,0.05)'
  const emailColor     = isDark ? '#e2e8f0'                  : '#0f172a'
  const idColor        = isDark ? '#475569'                  : '#94a3b8'
  const examColor      = isDark ? '#cbd5e1'                  : '#334155'
  const locColor       = isDark ? '#475569'                  : '#94a3b8'
  const filterBg       = isDark ? 'rgba(255,255,255,0.03)'  : 'rgba(0,0,0,0.03)'
  const filterBorder   = isDark ? 'rgba(255,255,255,0.07)'  : 'rgba(0,0,0,0.09)'
  const filterColor    = isDark ? '#cbd5e1'                  : '#334155'
  const mutedColor     = isDark ? '#64748b'                  : '#94a3b8'
  const subText        = isDark ? '#475569'                  : '#94a3b8'
  const btnSecBg       = isDark ? 'rgba(255,255,255,0.04)'  : 'rgba(0,0,0,0.04)'
  const btnSecBorder   = isDark ? 'rgba(255,255,255,0.08)'  : 'rgba(0,0,0,0.10)'
  const btnSecColor    = isDark ? '#94a3b8'                  : '#64748b'

  const panelStyle = { background: modalBg, border: `1px solid ${modalBorder}`, boxShadow: modalShadow }

  // Import drop zone
  const dropZoneBg     = isDragging ? (isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.05)') : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)')
  const dropZoneBorder = isDragging ? 'rgba(99,102,241,0.5)' : (isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.11)')
  const previewBg      = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
  const previewBorder  = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'
  const previewThColor = isDark ? '#475569' : '#94a3b8'
  const previewTdColor = isDark ? '#cbd5e1' : '#334155'
  const previewTrBorder= isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'

  const validCount = importRows.filter(r => r.email).length

  // ── Checkbox style ─────────────────────────────────────────────────────────
  const cbxStyle: React.CSSProperties = {
    width: '15px',
    height: '15px',
    cursor: 'pointer',
    accentColor: '#6366f1',
    flexShrink: 0,
  }

  const allSelected  = pagedLeads.length > 0 && pagedLeads.every(l => selectedIds.has(l.id))
  const someSelected = pagedLeads.some(l => selectedIds.has(l.id)) && !allSelected

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Clash Display', sans-serif; }
        .font-body    { font-family: 'DM Sans', sans-serif; }
        .font-mono-jb { font-family: 'JetBrains Mono', monospace; }

        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.45s ease forwards; }

        .table-row:hover { background: ${isDark ? 'rgba(255,255,255,0.016)' : 'rgba(0,0,0,0.02)'}; }
        .table-row.row-selected { background: ${isDark ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.04)'}; }
        .table-row.row-selected:hover { background: ${isDark ? 'rgba(99,102,241,0.09)' : 'rgba(99,102,241,0.07)'}; }
        input::placeholder { color: ${isDark ? '#475569' : '#94a3b8'}; }
        input:focus, select:focus { outline: none; }

        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(99,102,241,0.2); border-radius:4px; }

        .payment-paid    { color:#34d399; }
        .payment-pending { color:#fbbf24; }
        .payment-failed  { color:#f87171; }
        .payment-default { color:${isDark ? '#64748b' : '#94a3b8'}; }

        .action-btn { padding:7px; border-radius:10px; transition:all 0.15s ease; color:${isDark ? '#475569' : '#94a3b8'}; }
        .action-btn:hover { background:${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}; color:${isDark ? '#cbd5e1' : '#334155'}; }
        .action-btn.edit:hover { background:rgba(99,102,241,0.1); color:#818cf8; }
        .action-btn.del:hover  { background:rgba(244,63,94,0.1);  color:#fb7185; }

        @keyframes backdropIn { from{opacity:0;} to{opacity:1;} }
        @keyframes modalIn { from{opacity:0;transform:scale(0.97) translateY(8px);} to{opacity:1;transform:scale(1) translateY(0);} }
        @keyframes sheetUp { from{opacity:0;transform:translateY(100%);} to{opacity:1;transform:translateY(0);} }
        .backdrop-anim { animation:backdropIn 0.2s ease; }
        .modal-anim    { animation:modalIn 0.25s ease; }

        @media (max-width:639px) {
          .modal-shell    { position:fixed!important; inset:auto 0 0 0!important; max-width:100%!important; max-height:92dvh!important; border-radius:24px 24px 0 0!important; animation:sheetUp 0.3s cubic-bezier(0.32,0.72,0,1)!important; }
          .modal-shell-sm { position:fixed!important; inset:auto 0 0 0!important; max-width:100%!important; border-radius:24px 24px 0 0!important; animation:sheetUp 0.3s cubic-bezier(0.32,0.72,0,1)!important; }
          .modal-drag-handle { display:block!important; }
          .modal-wrapper-mobile { align-items:flex-end!important; padding:0!important; }
        }
        .modal-drag-handle { display:none; }

        /* Import preview table */
        .imp-table { width:100%; border-collapse:collapse; }
        .imp-table th { padding:8px 14px; text-align:left; font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.12em; color:${previewThColor}; border-bottom:1px solid ${previewBorder}; white-space:nowrap; }
        .imp-table td { padding:8px 14px; font-size:12px; color:${previewTdColor}; border-bottom:1px solid ${previewTrBorder}; white-space:nowrap; max-width:180px; overflow:hidden; text-overflow:ellipsis; }

        @keyframes checkPop { 0%{transform:scale(0);} 60%{transform:scale(1.2);} 100%{transform:scale(1);} }
        .check-pop { animation:checkPop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards; }

        /* Bulk action bar */
        @keyframes bulkBarIn { from{opacity:0;transform:translateY(-6px);} to{opacity:1;transform:translateY(0);} }
        .bulk-bar { animation: bulkBarIn 0.2s ease forwards; }
      `}</style>

      <div className="flex flex-col lg:flex-row min-h-screen w-screen bg-page t-primary overflow-x-hidden font-body">
        <Sidebar />

        <main className="flex-1 min-w-0 overflow-x-hidden relative">
          <DashboardHeader userName="Admin" />

          {/* Background glows */}
          <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            <div className="absolute top-[-5%] right-[-5%] w-[550px] h-[550px] rounded-full" style={{ background: `radial-gradient(circle, ${isDark ? 'rgba(99,102,241,0.07)' : 'rgba(99,102,241,0.04)'} 0%, transparent 65%)` }} />
            <div className="absolute bottom-[-10%] left-[10%] w-[400px] h-[400px] rounded-full" style={{ background: `radial-gradient(circle, ${isDark ? 'rgba(168,85,247,0.05)' : 'rgba(168,85,247,0.03)'} 0%, transparent 65%)` }} />
            <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(${isDark ? 'rgba(255,255,255,0.014)' : 'rgba(0,0,0,0.03)'} 1px,transparent 1px),linear-gradient(90deg,${isDark ? 'rgba(255,255,255,0.014)' : 'rgba(0,0,0,0.03)'} 1px,transparent 1px)`, backgroundSize:'60px 60px' }} />
          </div>

          <div className="w-full px-6 sm:px-10 lg:px-16 py-10 lg:py-14">

            {/* ── Page Header ── */}
            <div className="fade-up flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 rounded-full bg-indigo-500" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-indigo-400/70 font-mono-jb">CRM DASHBOARD</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-display font-bold tracking-tight leading-none" style={{ color: isDark ? '#ffffff' : '#0f172a' }}>
                  Leads{' '}
                  <span style={{ background: 'linear-gradient(135deg,#818cf8 0%,#c084fc 60%,#818cf8 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Overview</span>
                </h1>
                <p className="text-sm mt-3 font-light" style={{ color: subText }}>Track and manage your certification candidates.</p>
              </div>

              {/* ── Action buttons ── */}
              <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">

                {/* ── Bulk Delete Button (appears when rows selected) ── */}
                {selectedIds.size > 0 && (
                  <button
                    onClick={() => openModal('bulkDelete')}
                    className="bulk-bar flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95"
                    style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)', color: '#fb7185' }}
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                    Delete Selected
                    <span className="px-1.5 py-0.5 rounded-md text-[11px] font-bold" style={{ background: 'rgba(244,63,94,0.2)', color: '#fb7185' }}>
                      {selectedIds.size}
                    </span>
                  </button>
                )}

                {/* Import */}
                <button
                  onClick={() => openModal('import')}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95"
                  style={{ background: btnSecBg, border: `1px solid ${btnSecBorder}`, color: btnSecColor }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background='rgba(99,102,241,0.09)'; el.style.color='#818cf8'; el.style.borderColor='rgba(99,102,241,0.3)' }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background=btnSecBg; el.style.color=btnSecColor; el.style.borderColor=btnSecBorder }}
                >
                  <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                  </svg>
                  Import
                </button>

                {/* Export */}
                <button
                  onClick={handleExport}
                  disabled={leads.length === 0}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: btnSecBg, border: `1px solid ${btnSecBorder}`, color: btnSecColor }}
                  onMouseEnter={e => { if (leads.length === 0) return; const el = e.currentTarget as HTMLElement; el.style.background='rgba(52,211,153,0.08)'; el.style.color='#34d399'; el.style.borderColor='rgba(52,211,153,0.3)' }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background=btnSecBg; el.style.color=btnSecColor; el.style.borderColor=btnSecBorder }}
                >
                  <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                  Export {leads.length > 0 && <span className="opacity-60 text-xs">({leads.length})</span>}
                </button>

                {/* Add Lead */}
                <button
                  onClick={() => openModal('add')}
                  className="flex items-center gap-2 text-white px-6 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-all active:scale-95"
                  style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow:'0 0 24px rgba(99,102,241,0.3),inset 0 1px 0 rgba(255,255,255,0.1)' }}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                  Add Lead
                </button>
              </div>
            </div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statCards.map(({ label, value, color }) => (
                <div key={label} className="fade-up rounded-2xl px-6 py-6 transition-transform hover:-translate-y-0.5 card-themed border-soft">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] mb-4 font-mono-jb" style={{ color }}>{label}</p>
                  <p className="text-[52px] font-display font-bold leading-none tabular-nums" style={{ color }}>{value}</p>
                </div>
              ))}
            </div>

            {/* ── Filters ── */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: mutedColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by email, country, exam…"
                  className="w-full pl-11 pr-4 py-3.5 text-sm transition-all rounded-xl"
                  style={{ background: filterBg, border: `1px solid ${filterBorder}`, color: filterColor }}
                  onFocus={e => (e.target.style.borderColor='rgba(99,102,241,0.4)')}
                  onBlur={e  => (e.target.style.borderColor=filterBorder)}
                />
              </div>
              <select
                value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="px-4 py-3.5 text-sm transition-all cursor-pointer min-w-[170px] rounded-xl"
                style={{ background: filterBg, border: `1px solid ${filterBorder}`, color: filterColor }}
              >
                <option value="">All Statuses</option>
                {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* ── Table ── */}
            <div className="rounded-2xl overflow-hidden" style={{ background: tableBg, border: `1px solid ${tableBorder}`, boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.07)' }}>
              {loading ? (
                <div className="flex items-center justify-center py-32">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full" style={{ border:'1px solid rgba(99,102,241,0.1)' }} />
                    <div className="absolute inset-0 w-10 h-10 rounded-full animate-spin" style={{ border:'2px solid transparent', borderTopColor:'#6366f1' }} />
                  </div>
                </div>
              ) : (
                <>
                  {/* Desktop */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr style={{ borderBottom:`1px solid ${trBorder}` }}>
                          {/* ── Select All checkbox ── */}
                          <th className="px-5 py-5 w-10">
                            <input
                              type="checkbox"
                              style={cbxStyle}
                              checked={allSelected}
                              ref={el => { if (el) el.indeterminate = someSelected }}
                              onChange={toggleSelectAll}
                            />
                          </th>
                          {['Identity','Exam & Region','Status','Payment','Actions'].map((h,i) => (
                            <th key={h} className={`px-7 py-5 text-[10px] font-semibold uppercase tracking-[0.2em] font-mono-jb ${i===4?'text-right':'text-left'}`} style={{ color: thColor }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {leads.length === 0 ? (
                          <tr><td colSpan={6} className="py-28 text-center">
                            <p className="text-sm mb-2" style={{ color: subText }}>No leads found</p>
                            <button onClick={() => openModal('add')} className="text-indigo-400 text-xs hover:text-indigo-300 transition-colors">Add your first lead →</button>
                          </td></tr>
                        ) : pagedLeads.map(lead => (
                          <tr
                            key={lead.id}
                            className={`table-row transition-colors ${selectedIds.has(lead.id) ? 'row-selected' : ''}`}
                            style={{ borderBottom:`1px solid ${trBorder}` }}
                          >
                            {/* ── Row checkbox ── */}
                            <td className="px-5 py-4">
                              <input
                                type="checkbox"
                                style={cbxStyle}
                                checked={selectedIds.has(lead.id)}
                                onChange={() => toggleSelect(lead.id)}
                                onClick={e => e.stopPropagation()}
                              />
                            </td>
                            <td className="px-7 py-4">
                              <button onClick={() => openModal('view', lead)} className="text-left">
                                <span className="font-medium text-sm block hover:text-indigo-400 transition-colors" style={{ color: emailColor }}>{lead.email}</span>
                                <span className="text-[11px] font-mono-jb mt-0.5 block" style={{ color: idColor }}>#{lead.id.slice(-8).toUpperCase()}</span>
                              </button>
                            </td>
                            <td className="px-7 py-4">
                              <span className="font-medium text-sm block" style={{ color: examColor }}>{lead.exam||'—'}</span>
                              <span className="text-[11px] flex items-center gap-1 mt-0.5 font-light" style={{ color: locColor }}>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"/></svg>
                                {lead.country||'International'}
                              </span>
                            </td>
                            <td className="px-7 py-4"><StatusBadge status={lead.status}/></td>
                            <td className="px-7 py-4">
                              <span className={`text-[12px] font-semibold font-mono-jb ${lead.payment==='Paid'?'payment-paid':lead.payment==='Pending'?'payment-pending':lead.payment==='Failed'?'payment-failed':'payment-default'}`}>{lead.payment||'—'}</span>
                            </td>
                            <td className="px-7 py-4">
                              <div className="flex items-center justify-end gap-1">
                                <button onClick={() => openModal('view',   lead)} className="action-btn"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg></button>
                                <button onClick={() => openModal('edit',   lead)} className="action-btn edit"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
                                <button onClick={() => openModal('delete', lead)} className="action-btn del"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="md:hidden divide-y" style={{ borderColor: trBorder }}>
                    {leads.length===0 ? (
                      <p className="py-16 text-center text-sm" style={{ color: subText }}>No leads found.</p>
                    ) : pagedLeads.map(lead => (
                      <div
                        key={lead.id}
                        className={`p-5 space-y-3 transition-colors ${selectedIds.has(lead.id) ? 'row-selected' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          {/* Mobile checkbox */}
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            <input
                              type="checkbox"
                              style={{ ...cbxStyle, marginTop: '3px' }}
                              checked={selectedIds.has(lead.id)}
                              onChange={() => toggleSelect(lead.id)}
                            />
                            <button onClick={() => openModal('view', lead)} className="text-left min-w-0">
                              <p className="font-semibold text-sm truncate" style={{ color: emailColor }}>{lead.email}</p>
                              <p className="text-[11px] font-mono-jb mt-0.5" style={{ color: idColor }}>#{lead.id.slice(-8).toUpperCase()}</p>
                            </button>
                          </div>
                          <StatusBadge status={lead.status}/>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm" style={{ color: examColor }}>{lead.exam||'—'}</p>
                            <p className="text-[11px] font-light" style={{ color: locColor }}>{lead.country||'International'}</p>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => openModal('view',   lead)} className="action-btn"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg></button>
                            <button onClick={() => openModal('edit',   lead)} className="action-btn edit"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
                            <button onClick={() => openModal('delete', lead)} className="action-btn del"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* ── Pagination Bar ── */}
            {!loading && leads.length > 0 && (
              <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-4">

                {/* Left: info + clear selection */}
                <p className="text-[11px] font-mono-jb order-2 sm:order-1" style={{ color: isDark ? '#334155' : '#94a3b8' }}>
                  {selectedIds.size > 0 ? (
                    <>{selectedIds.size} selected · <button className="text-indigo-400 hover:text-indigo-300 transition-colors" onClick={() => setSelectedIds(new Set())}>Clear</button> · </>
                  ) : null}
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, leads.length)} of {leads.length}
                </p>

                {/* Right: page controls */}
                {totalPages > 1 && (
                  <div className="flex items-center gap-1 order-1 sm:order-2">

                    {/* Prev */}
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="w-8 h-8 flex items-center justify-center rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ background: btnSecBg, border:`1px solid ${btnSecBorder}`, color: btnSecColor }}
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                    </button>

                    {/* Page numbers */}
                    {(() => {
                      const pages: (number | '...')[] = []
                      if (totalPages <= 7) {
                        for (let i = 1; i <= totalPages; i++) pages.push(i)
                      } else {
                        pages.push(1)
                        if (currentPage > 3) pages.push('...')
                        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i)
                        if (currentPage < totalPages - 2) pages.push('...')
                        pages.push(totalPages)
                      }
                      return pages.map((p, i) =>
                        p === '...' ? (
                          <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-[11px] font-mono-jb" style={{ color: mutedColor }}>…</span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => goToPage(p as number)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-[12px] font-semibold font-mono-jb transition-all"
                            style={
                              p === currentPage
                                ? { background:'linear-gradient(135deg,#4f46e5,#7c3aed)', color:'#ffffff', border:'1px solid transparent', boxShadow:'0 0 12px rgba(99,102,241,0.3)' }
                                : { background: btnSecBg, border:`1px solid ${btnSecBorder}`, color: btnSecColor }
                            }
                          >
                            {p}
                          </button>
                        )
                      )
                    })()}

                    {/* Next */}
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="w-8 h-8 flex items-center justify-center rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ background: btnSecBg, border:`1px solid ${btnSecBorder}`, color: btnSecColor }}
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        {/* ── Backdrop ── */}
        {modal && (
          <div className="fixed inset-0 backdrop-anim z-[80]" style={{ background: backdropBg, backdropFilter:'blur(8px)' }} onClick={closeModal} />
        )}

        {/* ══════════════════════════════════════════
            BULK DELETE Confirm Modal
        ══════════════════════════════════════════ */}
        {modal === 'bulkDelete' && (
          <div className="modal-wrapper-mobile fixed inset-0 z-[90] flex items-center justify-center sm:p-4 pointer-events-none">
            <div className="modal-shell-sm modal-anim w-full sm:max-w-sm sm:rounded-2xl overflow-hidden pointer-events-auto text-center" style={panelStyle}>
              <div className="modal-drag-handle w-10 h-1 rounded-full mx-auto mt-3 flex-shrink-0" style={{ background: dragHandle }} />
              <div className="px-6 sm:px-8 pt-8 sm:pt-10 pb-6 sm:pb-8">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 sm:mb-6" style={{ background:'rgba(244,63,94,0.08)', border:'1px solid rgba(244,63,94,0.2)', boxShadow:'0 0 30px rgba(244,63,94,0.08)' }}>
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-display font-bold mb-2" style={{ color: modalTitle }}>Delete {selectedIds.size} Leads?</h3>
                <p className="text-sm mb-2 font-light" style={{ color: mutedColor }}>
                  This will permanently remove <strong style={{ color: isDark ? '#e2e8f0' : '#0f172a' }}>{selectedIds.size} selected lead{selectedIds.size !== 1 ? 's' : ''}</strong>.
                </p>
                <p className="text-xs font-light mt-3" style={{ color: isDark ? '#334155' : '#94a3b8' }}>This action cannot be undone.</p>
              </div>
              <div className="px-6 sm:px-8 pb-8 flex gap-3">
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting}
                  className="flex-1 text-white py-3.5 sm:py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background:'linear-gradient(135deg,#e11d48,#be123c)', boxShadow:'0 0 20px rgba(225,29,72,0.25)' }}
                >
                  {bulkDeleting ? (
                    <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Deleting…</>
                  ) : `Yes, Delete ${selectedIds.size}`}
                </button>
                <button onClick={closeModal} className="flex-1 py-3.5 sm:py-3 rounded-xl font-semibold text-sm transition-all" style={{ background: btnSecBg, border:`1px solid ${btnSecBorder}`, color: isDark ? '#94a3b8' : '#475569' }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            IMPORT Modal
        ══════════════════════════════════════════ */}
        {modal === 'import' && (
          <div className="modal-wrapper-mobile fixed inset-0 z-[90] flex items-center justify-center sm:p-4 pointer-events-none">
            <div className="modal-shell modal-anim w-full sm:max-w-3xl sm:rounded-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[92dvh] sm:max-h-[90vh]" style={panelStyle}>
              <div className="modal-drag-handle w-10 h-1 rounded-full mx-auto mt-3 mb-1 flex-shrink-0" style={{ background: dragHandle }} />

              {/* Header */}
              <div className="px-5 sm:px-8 py-4 sm:py-6 flex items-center justify-between flex-shrink-0" style={{ borderBottom:`1px solid ${modalDivider}` }}>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] mb-1 font-mono-jb" style={{ color: modalSubtitle }}>Excel Import</p>
                  <h2 className="text-lg sm:text-xl font-display font-bold" style={{ color: modalTitle }}>Import Leads</h2>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDownloadTemplate}
                    className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg transition-all"
                    style={{ background: btnSecBg, border:`1px solid ${btnSecBorder}`, color: btnSecColor }}
                    onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.color='#818cf8'; el.style.borderColor='rgba(99,102,241,0.3)' }}
                    onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.color=btnSecColor; el.style.borderColor=btnSecBorder }}
                  >
                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                    Download Template
                  </button>
                  <CloseBtn onClick={closeModal} isDark={isDark} />
                </div>
              </div>

              {/* Body */}
              <div className="p-5 sm:p-8 overflow-y-auto flex-1 space-y-5">

                {importDone ? (
                  <div className="flex flex-col items-center py-14 gap-4">
                    <div className="check-pop w-20 h-20 rounded-full flex items-center justify-center" style={{ background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.25)' }}>
                      <svg width="36" height="36" fill="none" stroke="#34d399" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <h3 className="text-xl font-display font-bold" style={{ color: modalTitle }}>Import Successful!</h3>
                    <p className="text-sm" style={{ color: mutedColor }}>{validCount} lead{validCount !== 1 ? 's' : ''} added to your database.</p>
                    <button onClick={closeModal} className="mt-2 px-8 py-3 rounded-xl text-white font-semibold text-sm active:scale-95 transition-all" style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow:'0 0 20px rgba(99,102,241,0.25)' }}>
                      Done
                    </button>
                  </div>
                ) : (
                  <>
                    {importRows.length === 0 && importErrors.length === 0 && (
                      <div
                        className="rounded-2xl flex flex-col items-center justify-center py-16 px-6 cursor-pointer transition-all"
                        style={{ background: dropZoneBg, border:`2px dashed ${dropZoneBorder}` }}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                      >
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-all" style={{ background: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.07)', border:'1px solid rgba(99,102,241,0.22)' }}>
                          <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                            <rect x="3" y="3" width="18" height="18" rx="3" fill="rgba(99,102,241,0.15)" stroke="#818cf8" strokeWidth="1.5"/>
                            <path d="M8 8.5l2.5 3L13 9l3 4.5H8z" fill="#818cf8" opacity=".5"/>
                            <path d="M9 16h6M12 13v3" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </div>
                        <p className="font-semibold text-sm mb-1.5" style={{ color: isDark ? '#e2e8f0' : '#0f172a' }}>
                          {isDragging ? 'Release to upload' : 'Click or drag & drop Excel file'}
                        </p>
                        <p className="text-xs mb-5" style={{ color: mutedColor }}>.xlsx or .xls · Columns auto-detected · Any order</p>
                        <div className="flex flex-wrap justify-center gap-2 text-[11px]" style={{ color: mutedColor }}>
                          {['Email','Phone','Country','Exam','Status','Payment'].map(col => (
                            <span key={col} className="px-2.5 py-1 rounded-full font-mono-jb" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', border:`1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.09)'}` }}>{col}</span>
                          ))}
                          <span className="px-2.5 py-1 rounded-full font-mono-jb" style={{ color:'#818cf8', background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.18)' }}>+18 more</span>
                        </div>
                        <button onClick={e => { e.stopPropagation(); handleDownloadTemplate() }} className="mt-5 flex items-center gap-1.5 text-xs font-medium sm:hidden" style={{ color:'#818cf8' }}>
                          <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                          Download sample template
                        </button>
                        <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />
                      </div>
                    )}

                    {importErrors.length > 0 && importRows.length === 0 && (
                      <div className="space-y-4">
                        <div className="rounded-xl px-5 py-4" style={{ background:'rgba(244,63,94,0.06)', border:'1px solid rgba(244,63,94,0.2)' }}>
                          <p className="text-[11px] font-semibold uppercase tracking-widest text-rose-400 mb-2">Error</p>
                          {importErrors.map((err, i) => (
                            <p key={i} className="text-xs text-rose-400/80 flex items-start gap-2">
                              <span className="mt-0.5 flex-shrink-0">⚠</span>{err}
                            </p>
                          ))}
                        </div>
                        <button onClick={() => { setImportErrors([]); fileInputRef.current?.click() }} className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all" style={{ background: btnSecBg, border:`1px solid ${btnSecBorder}`, color: btnSecColor }}>
                          <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                          Try another file
                        </button>
                        <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />
                      </div>
                    )}

                    {importRows.length > 0 && (
                      <div className="space-y-4">
                        {importErrors.length > 0 && (
                          <div className="rounded-xl px-4 py-3 space-y-1" style={{ background:'rgba(251,191,36,0.06)', border:'1px solid rgba(251,191,36,0.2)' }}>
                            <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-400 mb-2">Row Warnings</p>
                            {importErrors.slice(0,5).map((e, i) => <p key={i} className="text-xs text-amber-400/80 flex items-start gap-2"><span className="mt-0.5 flex-shrink-0">⚠</span>{e}</p>)}
                            {importErrors.length > 5 && <p className="text-xs text-amber-400/60">+{importErrors.length - 5} more warnings</p>}
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold" style={{ color: modalTitle }}>{importRows.length} rows parsed</span>
                            <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold" style={{ background:'rgba(52,211,153,0.1)', color:'#34d399', border:'1px solid rgba(52,211,153,0.2)' }}>✓ {validCount} valid</span>
                            {importErrors.length > 0 && (
                              <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold" style={{ background:'rgba(251,191,36,0.08)', color:'#fbbf24', border:'1px solid rgba(251,191,36,0.2)' }}>⚠ {importErrors.length} skip</span>
                            )}
                          </div>
                          <button onClick={() => { setImportRows([]); setImportErrors([]); fileInputRef.current?.click() }} className="text-xs font-medium flex items-center gap-1.5 transition-colors" style={{ color: mutedColor }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.color='#818cf8'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.color=mutedColor}>
                            <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                            Change file
                          </button>
                        </div>
                        <div className="rounded-xl overflow-hidden" style={{ background: previewBg, border:`1px solid ${previewBorder}` }}>
                          <div className="overflow-x-auto max-h-56">
                            <table className="imp-table">
                              <thead><tr><th>#</th><th>Email</th><th>Phone</th><th>Country</th><th>Exam</th><th>Status</th><th>Payment</th></tr></thead>
                              <tbody>
                                {importRows.slice(0,50).map((row, i) => (
                                  <tr key={i} style={{ opacity: row.email ? 1 : 0.4 }}>
                                    <td style={{ color: mutedColor }}>{i + 1}</td>
                                    <td style={{ color: row.email ? (isDark ? '#818cf8' : '#4f46e5') : '#ef4444', fontWeight: row.email ? 500 : 400 }}>{row.email || '⚠ missing'}</td>
                                    <td>{row.phone || '—'}</td>
                                    <td>{row.country || '—'}</td>
                                    <td>{row.exam || '—'}</td>
                                    <td>{row.status || 'New'}</td>
                                    <td>{row.payment || '—'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {importRows.length > 50 && (
                            <p className="text-center text-xs py-2.5" style={{ color: mutedColor, borderTop:`1px solid ${previewBorder}` }}>Showing 50 of {importRows.length} rows</p>
                          )}
                        </div>
                        <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />
                      </div>
                    )}
                  </>
                )}
              </div>

              {importRows.length > 0 && !importDone && (
                <div className="px-5 sm:px-8 py-4 flex gap-3 flex-shrink-0" style={{ borderTop:`1px solid ${modalDivider}` }}>
                  <button onClick={closeModal} className="flex-1 sm:flex-none sm:px-7 py-3 rounded-xl text-sm font-semibold transition-all" style={{ background: btnSecBg, border:`1px solid ${btnSecBorder}`, color: btnSecColor }}>Cancel</button>
                  <button onClick={handleImportSubmit} disabled={importLoading || validCount === 0} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-50" style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow:'0 0 20px rgba(99,102,241,0.25)' }}>
                    {importLoading ? (<><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Importing…</>) : (<><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>Import {validCount} Lead{validCount !== 1 ? 's' : ''}</>)}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            VIEW Modal
        ══════════════════════════════════════════ */}
        {modal === 'view' && selected && (
          <div className="modal-wrapper-mobile fixed inset-0 z-[90] flex items-center justify-center sm:p-4 pointer-events-none">
            <div className="modal-shell modal-anim w-full sm:max-w-xl sm:rounded-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[92dvh] sm:max-h-[90vh]" style={panelStyle}>
              <div className="modal-drag-handle w-10 h-1 rounded-full mx-auto mt-3 mb-1 flex-shrink-0" style={{ background: dragHandle }} />
              <div className="px-5 sm:px-7 py-4 sm:py-5 flex items-center justify-between flex-shrink-0" style={{ borderBottom:`1px solid ${modalDivider}` }}>
                <div className="min-w-0 flex-1 mr-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] mb-1 font-mono-jb" style={{ color: modalSubtitle }}>Lead Detail</p>
                  <h2 className="text-sm font-semibold truncate font-body" style={{ color: modalTitle }}>{selected.email}</h2>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={selected.status}/>
                  <CloseBtn onClick={closeModal} isDark={isDark}/>
                </div>
              </div>
              <div className="overflow-y-auto px-5 sm:px-7 py-5 space-y-4 flex-1">
                {FIELD_GROUPS.map(g => (
                  <div key={g.title}>
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="text-xs" style={{ color: modalSubtitle }}>{g.icon}</span>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] font-mono-jb" style={{ color: modalSubtitle }}>{g.title}</p>
                    </div>
                    <div className="rounded-xl px-4 sm:px-5 py-1" style={{ background: detailRowBg, border:`1px solid ${detailRowBorder}` }}>
                      {g.fields.map(({ label, key }) => <DetailRow key={key} label={label} value={(selected as any)[key]} isDark={isDark}/>)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 sm:px-7 py-4 flex gap-3 flex-shrink-0" style={{ borderTop:`1px solid ${modalDivider}` }}>
                <button onClick={() => { closeModal(); setTimeout(() => openModal('edit', selected), 10) }} className="flex-1 text-white text-sm font-semibold py-3 rounded-xl transition-all active:scale-95" style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow:'0 0 20px rgba(99,102,241,0.25)' }}>Edit Lead</button>
                <button onClick={() => { closeModal(); setTimeout(() => openModal('delete', selected), 10) }} className="px-5 text-rose-500 text-sm font-semibold py-3 rounded-xl transition-all border" style={{ background:'rgba(244,63,94,0.06)', borderColor:'rgba(244,63,94,0.2)' }}>Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            ADD Modal
        ══════════════════════════════════════════ */}
        {modal === 'add' && (
          <div className="modal-wrapper-mobile fixed inset-0 z-[90] flex items-center justify-center sm:p-4 pointer-events-none">
            <div className="modal-shell modal-anim w-full sm:max-w-4xl sm:rounded-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[92dvh] sm:max-h-[90vh]" style={panelStyle}>
              <div className="modal-drag-handle w-10 h-1 rounded-full mx-auto mt-3 mb-1 flex-shrink-0" style={{ background: dragHandle }} />
              <div className="px-5 sm:px-8 py-4 sm:py-6 flex items-center justify-between flex-shrink-0" style={{ borderBottom:`1px solid ${modalDivider}` }}>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] mb-1 font-mono-jb" style={{ color: modalSubtitle }}>New Entry</p>
                  <h2 className="text-lg sm:text-xl font-display font-bold" style={{ color: modalTitle }}>Create Lead</h2>
                </div>
                <CloseBtn onClick={closeModal} isDark={isDark}/>
              </div>
              <div className="p-5 sm:p-8 overflow-y-auto">
                <LeadForm onSubmit={handleCreate} isLoading={isSubmitting} onCancel={closeModal}/>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            EDIT Modal
        ══════════════════════════════════════════ */}
        {modal === 'edit' && selected && (
          <div className="modal-wrapper-mobile fixed inset-0 z-[90] flex items-center justify-center sm:p-4 pointer-events-none">
            <div className="modal-shell modal-anim w-full sm:max-w-4xl sm:rounded-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[92dvh] sm:max-h-[90vh]" style={panelStyle}>
              <div className="modal-drag-handle w-10 h-1 rounded-full mx-auto mt-3 mb-1 flex-shrink-0" style={{ background: dragHandle }} />
              <div className="px-5 sm:px-8 py-4 sm:py-6 flex items-center justify-between flex-shrink-0" style={{ borderBottom:`1px solid ${modalDivider}` }}>
                <div className="min-w-0 flex-1 mr-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] mb-1 font-mono-jb" style={{ color: modalSubtitle }}>Editing</p>
                  <h2 className="text-lg sm:text-xl font-display font-bold truncate" style={{ color: modalTitle }}>{selected.email}</h2>
                </div>
                <CloseBtn onClick={closeModal} isDark={isDark}/>
              </div>
              <div className="p-5 sm:p-8 overflow-y-auto">
                <LeadForm initialData={selected as any} onSubmit={handleEdit} isLoading={isSubmitting} onCancel={closeModal} isEdit/>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            DELETE Modal (single)
        ══════════════════════════════════════════ */}
        {modal === 'delete' && selected && (
          <div className="modal-wrapper-mobile fixed inset-0 z-[90] flex items-center justify-center sm:p-4 pointer-events-none">
            <div className="modal-shell-sm modal-anim w-full sm:max-w-sm sm:rounded-2xl overflow-hidden pointer-events-auto text-center" style={panelStyle}>
              <div className="modal-drag-handle w-10 h-1 rounded-full mx-auto mt-3 flex-shrink-0" style={{ background: dragHandle }} />
              <div className="px-6 sm:px-8 pt-8 sm:pt-10 pb-6 sm:pb-8">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 sm:mb-6" style={{ background:'rgba(244,63,94,0.08)', border:'1px solid rgba(244,63,94,0.2)', boxShadow:'0 0 30px rgba(244,63,94,0.08)' }}>
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-display font-bold mb-2" style={{ color: modalTitle }}>Delete Lead?</h3>
                <p className="text-sm mb-2 font-light" style={{ color: mutedColor }}>This will permanently remove</p>
                <p className="font-medium text-sm break-all px-2" style={{ color: isDark ? '#e2e8f0' : '#0f172a' }}>{selected.email}</p>
                <p className="text-xs font-light mt-3" style={{ color: isDark ? '#334155' : '#94a3b8' }}>This action cannot be undone.</p>
              </div>
              <div className="px-6 sm:px-8 pb-8 flex gap-3">
                <button onClick={handleDelete} className="flex-1 text-white py-3.5 sm:py-3 rounded-xl font-semibold text-sm transition-all active:scale-95" style={{ background:'linear-gradient(135deg,#e11d48,#be123c)', boxShadow:'0 0 20px rgba(225,29,72,0.25)' }}>Yes, Delete</button>
                <button onClick={closeModal} className="flex-1 py-3.5 sm:py-3 rounded-xl font-semibold text-sm transition-all" style={{ background: btnSecBg, border:`1px solid ${btnSecBorder}`, color: isDark ? '#94a3b8' : '#475569' }}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}