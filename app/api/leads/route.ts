import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import Lead from '@/models/Lead'
import { getAuthUser } from '@/lib/auth'
import { ok, created, error, unauthorized, serverError } from '@/lib/response'
import { FilterQuery } from 'mongoose'
import { ILead } from '@/models/Lead'

// =======================
// GET /api/leads
// =======================
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser()
    if (!auth) return unauthorized()

    await connectDB()

    const { searchParams } = new URL(req.url)

    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const payment = searchParams.get('payment') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'

    const page = Number(searchParams.get('page') || 1)
    const limit = Number(searchParams.get('limit') || 100)

    const query: FilterQuery<ILead> = {}

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { comptiaId: { $regex: search, $options: 'i' } },
        { orderNo: { $regex: search, $options: 'i' } },
        { exam: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
      ]
    }

    if (status) query.status = status
    if (payment) query.payment = payment

    const sortMap: Record<string, any> = {
      createdAt: { createdAt: -1 },
      email: { email: 1 },
      examDate: { examDate: 1 },
    }

    const sort = sortMap[sortBy] || { createdAt: -1 }
    const skip = (page - 1) * limit

    const [leads, total] = await Promise.all([
      Lead.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Lead.countDocuments(query),
    ])

    return ok({
      leads: leads.map((l: any) => ({
        ...l,
        id: l._id.toString(),
      })),
      total,
      page,
      pages: Math.ceil(total / limit),
    })
  } catch (err) {
    console.error('[leads GET]', err)
    return serverError()
  }
}

// =======================
// POST /api/leads
// =======================
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser()
    if (!auth) return unauthorized()

    await connectDB()

    const body = await req.json()

    if (!body.email) {
      return error('Email is required')
    }

    const lead = await Lead.create({
      ...body,
      createdBy: auth.userId,
    })

    // ✅ FIX: no second argument allowed
    return created({
      lead: {
        ...lead.toObject(),
        id: lead._id.toString(),
      },
    })
  } catch (err) {
    console.error('[leads POST]', err)
    return serverError()
  }
}