'use client'
import { useState } from 'react'
import { Lead } from '@/types'
import Link from 'next/link'

type LeadFormData = Omit<Lead, 'id' | 'createdAt'>

const emptyForm: LeadFormData = {
  email: '', country: '', address: '', phone: '', comptiaId: '', exam: '',
  examDate: '', price: '', orderNo: '', regId: '', status: 'New', vueId: '',
  city: '', state: '', postalCode: '', where: '', dateTime: '', who: '',
  payment: 'Pending', stateY: '', disposition: '', disposition2: '',
  linkedinProfile: '', remarks: ''
}

const STATUS_OPTIONS   = ['New','Contacted','Qualified','Closed Won','Closed Lost','Follow Up']
const PAYMENT_OPTIONS  = ['Pending','Paid','Refunded','Failed']
const EXAM_OPTIONS     = ['A+','Network+','Security+','Cloud+','CySA+','PenTest+','CASP+','Linux+','Server+','Data+','Other']
const COUNTRY_OPTIONS  = ['United States','United Kingdom','Canada','Australia','Germany','France','India','Pakistan','UAE','Other']

interface Props {
  initialData?: Partial<Lead>
  onSubmit: (data: LeadFormData) => void
  isLoading?: boolean
  isEdit?: boolean
}

const inputCls = "w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
const labelCls = "block text-xs font-medium text-slate-400 mb-1"

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
      <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2" style={{ fontFamily: 'Syne, sans-serif' }}>
        <div className="w-1 h-4 bg-indigo-500 rounded-full" />
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
    </div>
  )
}

export default function LeadForm({ initialData, onSubmit, isLoading, isEdit }: Props) {
  const [form, setForm] = useState<LeadFormData>({ ...emptyForm, ...initialData })

  const set = (field: keyof LeadFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Section title="Contact Information">
        <Field label="Email *">
          <input type="email" value={form.email} onChange={set('email')} required placeholder="john@example.com" className={inputCls} />
        </Field>
        <Field label="Phone">
          <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+1 (555) 000-0000" className={inputCls} />
        </Field>
        <Field label="LinkedIn Profile">
          <input type="url" value={form.linkedinProfile} onChange={set('linkedinProfile')} placeholder="https://linkedin.com/in/..." className={inputCls} />
        </Field>
        <Field label="Country">
          <select value={form.country} onChange={set('country')} className={inputCls}>
            <option value="">Select Country</option>
            {COUNTRY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
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
        <Field label="Address">
          <input value={form.address} onChange={set('address')} placeholder="123 Main St" className={inputCls} />
        </Field>
      </Section>

      <Section title="Exam Information">
        <Field label="CompTIA ID">
          <input value={form.comptiaId} onChange={set('comptiaId')} placeholder="COMP12345678" className={inputCls} />
        </Field>
        <Field label="VUE ID">
          <input value={form.vueId} onChange={set('vueId')} placeholder="VUE-XXXXXXXX" className={inputCls} />
        </Field>
      <Field label="Exam">
  <input
    type="text"
    value={form.exam}
    onChange={set('exam')}
    className={inputCls}
    placeholder="Enter exam name"
  />
</Field>
        <Field label="Exam Date">
          <input type="date" value={form.examDate} onChange={set('examDate')} className={inputCls} />
        </Field>
        <Field label="Where (Test Center)">
          <input value={form.where} onChange={set('where')} placeholder="Pearson VUE / Online" className={inputCls} />
        </Field>
        <Field label="Date & Time">
          <input type="datetime-local" value={form.dateTime} onChange={set('dateTime')} className={inputCls} />
        </Field>
      </Section>

      <Section title="Order & Payment">
        <Field label="Order No">
          <input value={form.orderNo} onChange={set('orderNo')} placeholder="ORD-00001" className={inputCls} />
        </Field>
        <Field label="Reg ID">
          <input value={form.regId} onChange={set('regId')} placeholder="REG-XXXXX" className={inputCls} />
        </Field>
        <Field label="Price">
          <input type="number" value={form.price} onChange={set('price')} placeholder="349.00" className={inputCls} />
        </Field>
       
      </Section>

      <Section title="Lead Status & Disposition">
       <Field label="Status">
  <input
    type="text"
    value={form.status}
    onChange={set('status')}
    className={inputCls}
  />
</Field>
        <Field label="Who (Assigned To)">
          <input value={form.who} onChange={set('who')} placeholder="Agent name" className={inputCls} />
        </Field>
        <Field label="State (Processing)">
          <input value={form.stateY} onChange={set('stateY')} placeholder="In Progress" className={inputCls} />
        </Field>
        <Field label="Disposition">
          <input value={form.disposition} onChange={set('disposition')} placeholder="Interested" className={inputCls} />
        </Field>
        <Field label="Disposition 2">
          <input value={form.disposition2} onChange={set('disposition2')} placeholder="Callback" className={inputCls} />
        </Field>
      </Section>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
        <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2" style={{ fontFamily: 'Syne, sans-serif' }}>
          <div className="w-1 h-4 bg-indigo-500 rounded-full" />
          Remarks
        </h3>
        <textarea value={form.remarks} onChange={set('remarks')} rows={4}
          placeholder="Any additional notes about this lead..."
          className={`${inputCls} resize-none`} />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={isLoading}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20">
          {isLoading ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
          ) : (
            <>{isEdit ? 'Update Lead' : 'Create Lead'}</>
          )}
        </button>
        <Link href="/leads"
          className="text-slate-400 hover:text-white text-sm font-medium px-4 py-3 rounded-xl hover:bg-slate-800 transition-all">
          Cancel
        </Link>
      </div>
    </form>
  )
}
