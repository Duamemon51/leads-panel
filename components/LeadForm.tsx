'use client'

import { useState } from 'react'
import { LeadFormData, LeadStatus } from '@/types'
import { useTheme } from '@/components/ThemeProvider'

const emptyForm: LeadFormData = {
  email: '', country: '', address: '', phone: '', comptiaId: '',
  exam: '', examDate: '', price: '', orderNo: '', regId: '',
  status: 'New', vueId: '', city: '', state: '', postalCode: '',
  where: '', dateTime: '', who: '', payment: 'Approved',
  disposition: '',
  disposition2: '',
  stateY: '',
  remarks: '',
  linkedinProfile: '',
}

interface Props {
  initialData?: Partial<LeadFormData>
  onSubmit: (data: LeadFormData) => Promise<void>
  isLoading?: boolean
  isEdit?: boolean
  onCancel?: () => void
}

const sectionGradients: Record<string, string> = {
  'Contact Information': 'from-indigo-500 to-violet-500',
  'Location':            'from-sky-500 to-cyan-500',
  'Exam Details':        'from-violet-500 to-purple-500',
  'Scheduling':          'from-amber-500 to-orange-500',
  'Status & Payment':    'from-emerald-500 to-teal-500',
}

export default function LeadForm({
  initialData,
  onSubmit,
  isLoading,
  isEdit,
  onCancel,
}: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [form, setForm] = useState<LeadFormData>({ ...emptyForm, ...initialData })

  const set =
    (field: keyof LeadFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form)
  }

  // ── Theme tokens ──
  const inputBg      = isDark ? 'rgba(255,255,255,0.04)'  : 'rgba(0,0,0,0.03)'
  const inputBorder  = isDark ? 'rgba(255,255,255,0.08)'  : 'rgba(0,0,0,0.10)'
  const inputFocus   = 'rgba(99,102,241,0.45)'
  const inputColor   = isDark ? '#e2e8f0'                 : '#0f172a'
  const inputPh      = isDark ? '#475569'                 : '#94a3b8'
  const sectionBg    = isDark ? 'rgba(255,255,255,0.02)'  : 'rgba(0,0,0,0.02)'
  const sectionBorder= isDark ? 'rgba(255,255,255,0.05)'  : 'rgba(0,0,0,0.07)'
  const headerBorder = isDark ? 'rgba(255,255,255,0.05)'  : 'rgba(0,0,0,0.07)'
  const titleColor   = isDark ? '#e2e8f0'                 : '#0f172a'
  const labelColor   = isDark ? '#64748b'                 : '#94a3b8'
  const cancelBg     = isDark ? 'rgba(255,255,255,0.04)'  : 'rgba(0,0,0,0.04)'
  const cancelBorder = isDark ? 'rgba(255,255,255,0.08)'  : 'rgba(0,0,0,0.10)'
  const cancelColor  = isDark ? '#94a3b8'                 : '#64748b'
  const optionBg     = isDark ? '#0f1221'                 : '#ffffff'

  const inputCls = 'w-full rounded-xl px-3.5 py-2.5 text-sm transition-all outline-none'
  const inputStyle = {
    background: inputBg,
    border: `1px solid ${inputBorder}`,
    color: inputColor,
  }

  const labelCls = 'block text-[11px] font-semibold uppercase tracking-widest mb-1.5'

  function Field({ label, children, span2 = false }: { label: string; children: React.ReactNode; span2?: boolean }) {
    return (
      <div className={span2 ? 'sm:col-span-2' : ''}>
        <label className={labelCls} style={{ color: labelColor }}>{label}</label>
        {children}
      </div>
    )
  }

  function Section({ title, children }: { title: string; children: React.ReactNode }) {
    const gradient = sectionGradients[title] ?? 'from-indigo-500 to-violet-500'
    return (
      <div className="rounded-xl overflow-hidden" style={{ background: sectionBg, border: `1px solid ${sectionBorder}` }}>
        <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: `1px solid ${headerBorder}` }}>
          <div className={`w-1 h-5 rounded-full bg-gradient-to-b ${gradient}`} />
          <h3 className="font-semibold text-sm" style={{ color: titleColor }}>{title}</h3>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {children}
        </div>
      </div>
    )
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = inputFocus
    e.target.style.boxShadow   = `0 0 0 3px ${isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)'}`
  }
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = inputBorder
    e.target.style.boxShadow   = 'none'
  }

  return (
    <>
      <style>{`
        .lf-input::placeholder { color: ${inputPh}; }
      `}</style>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* ── Contact Information ── */}
        <Section title="Contact Information">
          <Field label="Email *">
            <input
              type="email" required
              value={form.email} onChange={set('email')}
              placeholder="john@example.com"
              className={`${inputCls} lf-input`}
              style={inputStyle}
              onFocus={handleFocus} onBlur={handleBlur}
            />
          </Field>
          <Field label="Phone">
            <input
              value={form.phone} onChange={set('phone')}
              placeholder="+1 234 567 8900"
              className={`${inputCls} lf-input`}
              style={inputStyle}
              onFocus={handleFocus} onBlur={handleBlur}
            />
          </Field>
          <Field label="LinkedIn Profile">
            <input
              value={form.linkedinProfile} onChange={set('linkedinProfile')}
              placeholder="linkedin.com/in/..."
              className={`${inputCls} lf-input`}
              style={inputStyle}
              onFocus={handleFocus} onBlur={handleBlur}
            />
          </Field>
        </Section>

        {/* ── Location ── */}
        <Section title="Location">
          <Field label="Country">
            <input value={form.country} onChange={set('country')} placeholder="United States" className={`${inputCls} lf-input`} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
          </Field>
          <Field label="City">
            <input value={form.city} onChange={set('city')} placeholder="New York" className={`${inputCls} lf-input`} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
          </Field>
          <Field label="State">
            <input value={form.state} onChange={set('state')} placeholder="NY" className={`${inputCls} lf-input`} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
          </Field>
          <Field label="Postal Code">
            <input value={form.postalCode} onChange={set('postalCode')} placeholder="10001" className={`${inputCls} lf-input`} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
          </Field>
          <Field label="Address" span2>
            <input value={form.address} onChange={set('address')} placeholder="123 Main St" className={`${inputCls} lf-input`} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
          </Field>
        </Section>

        {/* ── Exam Details ── */}
        <Section title="Exam Details">
          <Field label="Exam">
            <input value={form.exam} onChange={set('exam')} placeholder="CompTIA A+" className={`${inputCls} lf-input`} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
          </Field>
          <Field label="Exam Date">
            <input type="date" value={form.examDate} onChange={set('examDate')} className={`${inputCls} lf-input`} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
          </Field>
          <Field label="CompTIA ID">
            <input value={form.comptiaId} onChange={set('comptiaId')} placeholder="COMP001234" className={`${inputCls} lf-input`} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
          </Field>
          <Field label="VUE ID">
            <input value={form.vueId} onChange={set('vueId')} placeholder="VUE0001" className={`${inputCls} lf-input`} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
          </Field>
          <Field label="Reg ID">
            <input value={form.regId} onChange={set('regId')} placeholder="REG0001" className={`${inputCls} lf-input`} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
          </Field>
          <Field label="Order No">
            <input value={form.orderNo} onChange={set('orderNo')} placeholder="ORD-00001" className={`${inputCls} lf-input`} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
          </Field>
          <Field label="Price">
            <input value={form.price} onChange={set('price')} placeholder="$299.00" className={`${inputCls} lf-input`} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
          </Field>
        </Section>

        {/* ── Scheduling ── */}
        <Section title="Scheduling">
          <Field label="Where">
            <input value={form.where} onChange={set('where')} placeholder="Online / Test Center" className={`${inputCls} lf-input`} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
          </Field>
          <Field label="Date & Time">
            <input value={form.dateTime} onChange={set('dateTime')} placeholder="2024-06-15 10:00 AM" className={`${inputCls} lf-input`} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
          </Field>
          <Field label="Who">
            <input value={form.who} onChange={set('who')} placeholder="Assigned agent" className={`${inputCls} lf-input`} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
          </Field>
        </Section>

        {/* ── Status & Payment ── */}
        <Section title="Status & Payment">
          <Field label="Status">
            <select
              value={form.status} onChange={set('status')}
              className={`${inputCls} lf-input cursor-pointer`}
              style={{ ...inputStyle, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '14px', paddingRight: '36px', appearance: 'none' }}
              onFocus={handleFocus} onBlur={handleBlur}
            >
              {['New', 'Contacted', 'Qualified', 'Closed Won', 'Closed Lost', 'Follow Up'].map(o => (
                <option key={o} value={o} style={{ background: optionBg, color: inputColor }}>{o}</option>
              ))}
            </select>
          </Field>
          <Field label="Payment">
            <input
              value={form.payment} onChange={set('payment')}
              placeholder="Approved / Pending / Failed"
              className={`${inputCls} lf-input`}
              style={inputStyle}
              onFocus={handleFocus} onBlur={handleBlur}
            />
          </Field>
          <Field label="Disposition">
            <input value={form.disposition} onChange={set('disposition')} placeholder="Notes on outcome…" className={`${inputCls} lf-input`} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
          </Field>
          <Field label="Disposition 2">
            <input value={form.disposition2} onChange={set('disposition2')} placeholder="Secondary disposition" className={`${inputCls} lf-input`} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
          </Field>
          <Field label="State Y">
            <input value={form.stateY} onChange={set('stateY')} placeholder="State Y" className={`${inputCls} lf-input`} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
          </Field>
          <Field label="Remarks" span2>
            <textarea
              value={form.remarks} onChange={set('remarks')}
              placeholder="Additional notes..."
              rows={3}
              className={`${inputCls} lf-input resize-none`}
              style={inputStyle}
              onFocus={handleFocus} onBlur={handleBlur}
            />
          </Field>
        </Section>

        {/* ── Actions ── */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 sm:flex-none sm:px-6 py-3 rounded-xl transition-all text-sm font-semibold disabled:opacity-50"
            style={{
              background: cancelBg,
              border: `1px solid ${cancelBorder}`,
              color: cancelColor,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = isDark ? '#cbd5e1' : '#334155'
              ;(e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = cancelColor
              ;(e.currentTarget as HTMLElement).style.background = cancelBg
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 text-white font-semibold py-3 rounded-xl disabled:opacity-50 transition-all text-sm active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 0 20px rgba(99,102,241,0.25), inset 0 1px 0 rgba(255,255,255,0.1)' }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Saving…
              </span>
            ) : isEdit ? 'Update Lead' : 'Create Lead'}
          </button>
        </div>

      </form>
    </>
  )
}