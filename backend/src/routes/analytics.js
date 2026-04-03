const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const db = require('../config/database');

router.use(authenticate);

router.get('/overview', async (req, res) => {
  const agencyId = req.agency.id;

  const [totals] = await db('shipments')
    .where({ agency_id: agencyId })
    .select(
      db.raw('count(*) as total'),
      db.raw("count(*) filter (where status = 'in_transit') as in_transit"),
      db.raw("count(*) filter (where status = 'delivered') as delivered"),
      db.raw("count(*) filter (where status = 'exception') as exceptions"),
      db.raw("count(*) filter (where created_at > now() - interval '30 days') as last_30_days"),
      db.raw("count(*) filter (where status = 'delivered' and actual_delivery <= estimated_delivery) as on_time")
    );

  const byCarrier = await db('shipments')
    .where({ agency_id: agencyId })
    .groupBy('carrier')
    .select('carrier', db.raw('count(*) as count'));

  const byStatus = await db('shipments')
    .where({ agency_id: agencyId })
    .groupBy('status')
    .select('status', db.raw('count(*) as count'));

  // Daily shipment volume for last 30 days
  const dailyVolume = await db('shipments')
    .where({ agency_id: agencyId })
    .where('created_at', '>', db.raw("now() - interval '30 days'"))
    .groupByRaw("date_trunc('day', created_at)")
    .select(db.raw("date_trunc('day', created_at) as date, count(*) as count"))
    .orderBy('date', 'asc');

  const deliveryRate = totals.delivered > 0
    ? Math.round((totals.on_time / totals.delivered) * 100)
    : 0;

  res.json({
    overview: {
      total: parseInt(totals.total),
      in_transit: parseInt(totals.in_transit),
      delivered: parseInt(totals.delivered),
      exceptions: parseInt(totals.exceptions),
      last_30_days: parseInt(totals.last_30_days),
      on_time_rate: deliveryRate,
    },
    by_carrier: byCarrier.map(r => ({ carrier: r.carrier, count: parseInt(r.count) })),
    by_status: byStatus.map(r => ({ status: r.status, count: parseInt(r.count) })),
    daily_volume: dailyVolume.map(r => ({ date: r.date, count: parseInt(r.count) })),
  });
});

router.get('/delivery-rate', async (req, res) => {
  const { days = 30 } = req.query;
  const agencyId = req.agency.id;

  const weekly = await db('shipments')
    .where({ agency_id: agencyId, status: 'delivered' })
    .where('actual_delivery', '>', db.raw(`now() - interval '${parseInt(days)} days'`))
    .groupByRaw("date_trunc('week', actual_delivery)")
    .select(
      db.raw("date_trunc('week', actual_delivery) as week"),
      db.raw('count(*) as total'),
      db.raw('count(*) filter (where actual_delivery <= estimated_delivery) as on_time')
    )
    .orderBy('week', 'asc');

  res.json({
    weekly: weekly.map(r => ({
      week: r.week,
      total: parseInt(r.total),
      on_time: parseInt(r.on_time),
      rate: r.total > 0 ? Math.round((r.on_time / r.total) * 100) : 0,
    })),
  });
});

module.exports = router;
