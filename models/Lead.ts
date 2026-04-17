import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ILead extends Document {
  _id: mongoose.Types.ObjectId

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
  disposition: string
  linkedinProfile: string

  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const LeadSchema = new Schema<ILead>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    country: { type: String, default: '' },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    comptiaId: { type: String, default: '' },

    exam: { type: String, default: '' },
    examDate: { type: String, default: '' },

    price: { type: String, default: '' },
    orderNo: { type: String, default: '' },
    regId: { type: String, default: '' },

    status: { type: String, default: 'New' },

    vueId: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    postalCode: { type: String, default: '' },

    where: { type: String, default: '' },
    dateTime: { type: String, default: '' },
    who: { type: String, default: '' },

    payment: { type: String, default: 'Pending' },

    disposition: { type: String, default: '' },
    linkedinProfile: { type: String, default: '' },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// indexes (optional but useful)
LeadSchema.index({ email: 1 })
LeadSchema.index({ createdAt: -1 })

const Lead: Model<ILead> =
  mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema)

export default Lead