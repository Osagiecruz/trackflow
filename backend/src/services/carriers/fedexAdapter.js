const axios = require('axios');
const logger = require('../../utils/logger');

const FEDEX_BASE = 'https://apis.fedex.com';

class FedExAdapter {
  constructor() {
    this.apiKey = process.env.FEDEX_API_KEY;
    this.apiSecret = process.env.FEDEX_API_SECRET;
    this._token = null;
    this._tokenExpires = 0;
  }

  async _getToken() {
    if (this._token && Date.now() < this._tokenExpires) return this._token;

    const res = await axios.post(`${FEDEX_BASE}/oauth/token`, new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.apiKey,
      client_secret: this.apiSecret,
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    this._token = res.data.access_token;
    this._tokenExpires = Date.now() + (res.data.expires_in - 60) * 1000;
    return this._token;
  }

  async track(trackingNumber) {
    const token = await this._getToken();

    const response = await axios.post(`${FEDEX_BASE}/track/v1/trackingnumbers`, {
      includeDetailedScans: true,
      trackingInfo: [{ trackingNumberInfo: { trackingNumber } }],
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    const result = response.data?.output?.completeTrackResults?.[0]?.trackResults?.[0];
    if (!result) throw new Error(`FedEx: No result for ${trackingNumber}`);

    return this._normalize(result);
  }

  _normalize(result) {
    const statusMap = {
      'PU': 'pending',
      'IT': 'in_transit',
      'OD': 'out_for_delivery',
      'DL': 'delivered',
      'DE': 'exception',
      'RS': 'returned',
    };

    const events = (result.scanEvents || []).map((e) => ({
      status: statusMap[e.eventType] || 'in_transit',
      description: e.eventDescription,
      location: [e.scanLocation?.city, e.scanLocation?.countryCode]
        .filter(Boolean).join(', '),
      city: e.scanLocation?.city,
      country: e.scanLocation?.countryCode,
      occurred_at: new Date(e.date),
      source: 'fedex',
      raw_data: e,
    }));

    const latestStatus = result.latestStatusDetail?.code;

    return {
      status: statusMap[latestStatus] || 'in_transit',
      estimated_delivery: result.estimatedDeliveryTimeWindow?.window?.begins
        ? new Date(result.estimatedDeliveryTimeWindow.window.begins)
        : null,
      events,
    };
  }
}

module.exports = new FedExAdapter();
