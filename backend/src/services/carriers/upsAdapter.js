const axios = require('axios');

const UPS_BASE = 'https://onlinetools.ups.com/api';

class UPSAdapter {
  constructor() {
    this.clientId = process.env.UPS_CLIENT_ID;
    this.clientSecret = process.env.UPS_CLIENT_SECRET;
    this._token = null;
    this._tokenExpires = 0;
  }

  async _getToken() {
    if (this._token && Date.now() < this._tokenExpires) return this._token;

    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    const res = await axios.post('https://onlinetools.ups.com/security/v1/oauth/token',
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    this._token = res.data.access_token;
    this._tokenExpires = Date.now() + (res.data.expires_in - 60) * 1000;
    return this._token;
  }

  async track(trackingNumber) {
    const token = await this._getToken();
    const res = await axios.get(`${UPS_BASE}/track/v1/details/${trackingNumber}`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { locale: 'en_US', returnSignature: false },
      timeout: 10000,
    });

    const pkg = res.data?.trackResponse?.shipment?.[0]?.package?.[0];
    if (!pkg) throw new Error(`UPS: No package found for ${trackingNumber}`);

    return this._normalize(pkg);
  }

  _normalize(pkg) {
    const statusMap = {
      'I': 'in_transit',
      'D': 'delivered',
      'X': 'exception',
      'P': 'pending',
      'M': 'pending',
      'O': 'out_for_delivery',
    };

    const events = (pkg.activity || []).map((a) => ({
      status: statusMap[a.status?.type] || 'in_transit',
      description: a.status?.description,
      location: [a.location?.address?.city, a.location?.address?.country]
        .filter(Boolean).join(', '),
      city: a.location?.address?.city,
      country: a.location?.address?.country,
      occurred_at: new Date(`${a.date} ${a.time}`),
      source: 'ups',
      raw_data: a,
    }));

    return {
      status: statusMap[pkg.currentStatus?.type] || 'in_transit',
      estimated_delivery: pkg.deliveryDate?.[0]?.date
        ? new Date(pkg.deliveryDate[0].date)
        : null,
      events,
    };
  }
}

module.exports = new UPSAdapter();
