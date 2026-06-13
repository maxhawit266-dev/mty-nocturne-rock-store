export const createPayPalOrder = async (cart, email) => {
  const items = cart.map(item => ({
    name: item.name,
    unit_amount: {
      currency_code: 'MXN',
      value: (item.price / 100).toFixed(2)
    },
    quantity: item.qty.toString()
  }));

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return {
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: 'MXN',
          value: (total / 100).toFixed(2),
          breakdown: {
            item_total: {
              currency_code: 'MXN',
              value: (total / 100).toFixed(2)
            }
          }
        },
        items,
        description: `Order from MTY Nocturne Rock Store - ${email}`
      }
    ],
    application_context: {
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/cancel`,
      user_action: 'PAY_NOW',
      brand_name: 'MTY Nocturne Rock Store'
    }
  };
};

export const capturePayPalOrder = async (orderId, accessToken) => {
  const response = await fetch(
    `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to capture PayPal order');
  }

  return response.json();
};

export const getPayPalAccessToken = async () => {
  const auth = Buffer.from(
    `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64');

  const response = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  if (!response.ok) {
    throw new Error('Failed to get PayPal access token');
  }

  const data = await response.json();
  return data.access_token;
};
