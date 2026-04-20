'use client'

import { useState } from 'react'
import { LeadFormData, LeadStatus, PaymentStatus } from '@/types'
const emptyForm: LeadFormData = {
  email: '', country: '', address: '', phone: '', comptiaId: '',
  exam: '', examDate: '', price: '', orderNo: '', regId: '',
  status: 'New', vueId: '', city: '', state: '', postalCode: '',
  where: '', dateTime: '', who: '', payment: 'Approved',
  disposition: '',
  disposition2: '',   // ✅ ADD
  stateY: '',         // ✅ ADD
  remarks: '',        // ✅ ADD
  linkedinProfile: '',
}

interface Props {
  initialData?: Partial<LeadFormData>
 onSubmit: (data: LeadFormData) => Promise<void>
  isLoading?: boolean
  isEdit?: boolean
  onCancel?: () => void
}

const inputCls = [
  'w-full bg-slate-900/60 border border-white/[0.07]',
  'rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600',
  'focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30',
  'transition-all text-sm hover:border-white/[0.12]',
].join(' ')

const labelCls = 'block text-[11px] font-semibold uppercase tracking-widest text-slate-600 mb-1.5'

function Field({ label, children, span2 = false }: { label: string; children: React.ReactNode; span2?: boolean }) {
  return (
    <div className={span2 ? 'sm:col-span-2' : ''}>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  )
}

const sectionColors: Record<string, string> = {
  'Contact Information': 'from-indigo-500 to-violet-500',
  'Location':            'from-sky-500 to-cyan-500',
  'Exam Details':        'from-violet-500 to-purple-500',
  'Scheduling':          'from-amber-500 to-orange-500',
  'Status & Payment':    'from-emerald-500 to-teal-500',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const gradient = sectionColors[title] ?? 'from-indigo-500 to-violet-500'
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.05] flex items-center gap-3">
        <div className={`w-1 h-5 rounded-full bg-gradient-to-b ${gradient}`} />
        <h3 className="text-white font-semibold text-sm">{title}</h3>
      </div>
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {children}
      </div>
    </div>
  )
}

export default function LeadForm({ initialData, onSubmit, isLoading, isEdit, onCancel }: Props) {
  const [form, setForm] = useState<LeadFormData>({ ...emptyForm, ...initialData })

  const set =
  (field: keyof LeadFormData) =>
  (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    let value: any = e.target.value

    if (field === 'status') value = value as LeadStatus
    if (field === 'payment') value = value as PaymentStatus

    setForm(prev => ({ ...prev, [field]: value }))
  }
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* ── Contact Information ── */}
      <Section title="Contact Information">
        <Field label="Email *">
          <input
            type="email" required
            value={form.email} onChange={set('email')}
            placeholder="john@example.com"
            className={inputCls}
          />
        </Field>
        <Field label="Phone">
          <input
            value={form.phone} onChange={set('phone')}
            placeholder="+1 234 567 8900"
            className={inputCls}
          />
        </Field>
        <Field label="LinkedIn Profile">
          <input
            value={form.linkedinProfile} onChange={set('linkedinProfile')}
            placeholder="linkedin.com/in/..."
            className={inputCls}
          />
        </Field>
      </Section>

      {/* ── Location ── */}
      <Section title="Location">
        <Field label="Country">
          <input value={form.country} onChange={set('country')} placeholder="United States" className={inputCls} />
        </Field>
        <Field label="City">
          <input value={form.city} onChange={set('city')} placeholder="New York" className={inputCls} />
        </Field>
        <Field label="State">
          <input value={form.state} onChange={set('state')} placeholder="NY" className={inputCls} />
        </Field>
        <Field label="Postal Code">
          <input value={form.postalCode} onChange={set('postalCode')} placeholder="10001" className={inputCls} />
        </Field>
        <Field label="Address" span2>
          <input value={form.address} onChange={set('address')} placeholder="123 Main St" className={inputCls} />
        </Field>
      </Section>

      {/* ── Exam Details ── */}
      <Section title="Exam Details">
        <Field label="Exam">
          <input value={form.exam} onChange={set('exam')} placeholder="CompTIA A+" className={inputCls} />
        </Field>
        <Field label="Exam Date">
          <input type="date" value={form.examDate} onChange={set('examDate')} className={inputCls} />
        </Field>
        <Field label="CompTIA ID">
          <input value={form.comptiaId} onChange={set('comptiaId')} placeholder="COMP001234" className={inputCls} />
        </Field>
        <Field label="VUE ID">
          <input value={form.vueId} onChange={set('vueId')} placeholder="VUE0001" className={inputCls} />
        </Field>
        <Field label="Reg ID">
          <input value={form.regId} onChange={set('regId')} placeholder="REG0001" className={inputCls} />
        </Field>
        <Field label="Order No">
          <input value={form.orderNo} onChange={set('orderNo')} placeholder="ORD-00001" className={inputCls} />
        </Field>
        <Field label="Price">
          <input value={form.price} onChange={set('price')} placeholder="$299.00" className={inputCls} />
        </Field>
      </Section>

      {/* ── Scheduling ── */}
      <Section title="Scheduling">
        <Field label="Where">
          <input value={form.where} onChange={set('where')} placeholder="Online / Test Center" className={inputCls} />
        </Field>
        <Field label="Date & Time">
          <input value={form.dateTime} onChange={set('dateTime')} placeholder="2024-06-15 10:00 AM" className={inputCls} />
        </Field>
        <Field label="Who">
          <input value={form.who} onChange={set('who')} placeholder="Assigned agent" className={inputCls} />
        </Field>
      </Section>

      {/* ── Status & Payment ── */}
      <Section title="Status & Payment">
        <Field label="Status">
          <select value={form.status} onChange={set('status')} className={inputCls}>
            {['New', 'Contacted', 'Qualified', 'Closed Won', 'Closed Lost', 'Follow Up'].map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </Field>
        <Field label="Payment">
          <select value={form.payment} onChange={set('payment')} className={inputCls}>
            {['Approved'].map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </Field>
        <Field label="Disposition">
          <input value={form.disposition} onChange={set('disposition')} placeholder="Notes on outcome…" className={inputCls} />
        </Field>
        <Field label="Disposition 2">
  <input
    value={form.disposition2}
    onChange={set('disposition2')}
    placeholder="Secondary disposition"
    className={inputCls}
  />
</Field>

<Field label="State Y">
  <input
    value={form.stateY}
    onChange={set('stateY')}
    placeholder="State Y"
    className={inputCls}
  />
</Field>

<Field label="Remarks" span2>
  <textarea
    value={form.remarks}
    onChange={set('remarks')}
    placeholder="Additional notes..."
    className={inputCls}
  />
</Field>
      </Section>

      {/* ── Actions ── */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 sm:flex-none sm:px-6 py-3 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.07] text-slate-300 rounded-xl transition-all text-sm font-semibold disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold py-3 rounded-xl disabled:opacity-50 transition-all text-sm shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
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
  )
}