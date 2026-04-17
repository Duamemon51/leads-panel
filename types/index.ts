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
  disposition2: string
  linkedinProfile: string
  remarks: string
  createdAt: string
}
export interface User {
  id: string
  name: string
  email: string
  password: string
  role: 'admin' | 'user'
}
export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Closed Won' | 'Closed Lost' | 'Follow Up'
export type PaymentStatus = 'Pending' | 'Paid' | 'Refunded' | 'Failed'
