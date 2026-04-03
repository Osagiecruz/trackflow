const axios = require('axios');
const logger = require('../../utils/logger');

const DHL_BASE = 'https://api-eu.dhl.com';

class DHLAdapter {
  constructor() {
    this.apiKey = process.env.DHL_API_KEY;
  }

  /**
   * Track a shipment by DHL tracking number.
   * Returns normalized TrackingResult.
   */
  async track(trackingNumber) {
    const response = await axios.get(`${DHL_BASE}/track/shipments`, {
      params: { trackingNumber },
      headers: {
        'DHL-API-Key': this.apiKey,
        'Accept': 'application/json',
      },
      timeout: 10000,
    });

    const data = response.data;
    if (!data.shipments || !data.shipments.length) {
      throw new Error(`DHL: No shipment found for ${trackingNumber}`);
    }

    return this._normalize(data.shipments[0]);
  }

  _normalize(shipment) {
    const statusMap = {
      'pre-transit': 'pending',
      'transit': 'in_transit',
      'delivered': 'delivered',
      'failure': 'exception',
      'unknown': 'in_transit',
    };

    const events = (shipment.events || []).map((e) => ({
      status: statusMap[e.status] || 'in_transit',
      description: e.description,
      location: [e.location?.address?.addressLocality, e.location?.address?.countryCode]
        .filter(Boolean).join(', '),
      city: e.location?.address?.addressLocality,
      country: e.location?.address?.countryCode,
      latitude: e.location?.geo?.latitude,
      longitude: e.location?.geo?.longitude,
      occurred_at: new Date(e.timestamp),
      source: 'dhl',
      raw_data: e,
    }));

    return {
      status: statusMap[shipment.status?.status] || 'in_transit',
      estimated_delivery: shipment.estimatedTimeOfDelivery
        ? new Date(shipment.estimatedTimeOfDelivery)
        : null,
      events,
    };
  }
}

module.exports = new DHLAdapter();
