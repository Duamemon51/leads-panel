// types/index.ts

// ───────────────
// Enums / Unions
// ───────────────

export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Qualified'
  | 'Closed Won'
  | 'Closed Lost'
  | 'Follow Up'

export type PaymentStatus =
  | 'Approved'
  | 'Paid'
  | 'Refunded'
  | 'Failed'
  | 'Partial'

// ───────────────
// Main Lead Model (DB)
// ───────────────

export interface Lead {
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
  status: LeadStatus
  vueId: string
  city: string
  state: string
  postalCode: string
  where: string
  dateTime: string
  who: string
  payment: PaymentStatus
  stateY: string
  disposition: string
  disposition2: string
  linkedinProfile: string
  remarks: string
  createdAt: string
}

// ───────────────
// Form Type (Derived)
// ───────────────

export type LeadFormData = Omit<Lead, 'id' | 'createdAt'>

// ───────────────
// User Model
// ───────────────

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: 'admin' | 'user'
}