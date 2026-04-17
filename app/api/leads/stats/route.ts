import connectDB from '@/lib/mongodb'
import Lead from '@/models/Lead'
import { getAuthUser } from '@/lib/auth'
import { ok, unauthorized, serverError } from '@/lib/response'

export async function GET() {
  try {
    const auth = await getAuthUser()
    if (!auth) return unauthorized()

    await connectDB()

    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const [
      totalLeads,
      todayLeads,
      paidLeads,
      statusBreakdown,
      paymentBreakdown,
      recentLeads,
    ] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ createdAt: { $gte: startOfDay } }),
      Lead.countDocuments({ payment: 'Paid' }),
      Lead.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Lead.aggregate([
        { $group: { _id: '$payment', count: { $sum: 1 } } },
      ]),
      Lead.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .select('email exam country status createdAt')
        .lean(),
    ])

    const statusMap: Record<string, number> = {}
    for (const s of statusBreakdown) {
      statusMap[s._id] = s.count
    }

    const paymentMap: Record<string, number> = {}
    for (const p of paymentBreakdown) {
      paymentMap[p._id] = p.count
    }

    return ok({
      totalLeads,
      todayLeads,
      paidLeads,
      closedWon: statusMap['Closed Won'] || 0,
      statusBreakdown: statusMap,
      paymentBreakdown: paymentMap,
      recentLeads: recentLeads.map(l => ({ ...l, id: l._id.toString() })),
    })
  } catch (err) {
    console.error('[leads/stats]', err)
    return serverError()
  }
}
