import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import Lead from '@/models/Lead'
import { getAuthUser } from '@/lib/auth'
import { ok, error, unauthorized, notFound, serverError } from '@/lib/response'

// Params type
interface Params {
  params: {
    id: string
  }
}

// GET
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const auth = await getAuthUser()
    if (!auth) return unauthorized()

    await connectDB()

    const lead = await Lead.findById(params.id).lean()
    if (!lead) return notFound('Lead not found')

    return ok({
      lead: { ...lead, id: lead._id.toString() },
    })
  } catch (err) {
    console.error('[GET lead]', err)
    return serverError()
  }
}

// PUT
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const auth = await getAuthUser()
    if (!auth) return unauthorized()

    const body = await req.json()

    delete body._id
    delete body.id
    delete body.createdAt
    delete body.createdBy

    await connectDB()

    const lead = await Lead.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true }
    ).lean()

    if (!lead) return notFound('Lead not found')

    return ok({
      lead: { ...lead, id: lead._id.toString() },
    })
  } catch (err) {
    console.error('[PUT lead]', err)
    return serverError()
  }
}

// DELETE
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const auth = await getAuthUser()
    if (!auth) return unauthorized()

    if (auth.role !== 'admin') {
      return error('Only admins can delete leads', 403)
    }

    await connectDB()

    const lead = await Lead.findByIdAndDelete(params.id)
    if (!lead) return notFound('Lead not found')

    return ok({ message: 'Lead deleted successfully' })
  } catch (err) {
    console.error('[DELETE lead]', err)
    return serverError()
  }
}