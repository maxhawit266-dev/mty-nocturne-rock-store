import { db } from '../../../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { createPayPalOrder, getPayPalAccessToken } from '../../../lib/paypal';
import { checkoutSchema } from '../../../lib/validation';
import { sendOrderConfirmationEmail } from '../../../lib/mail';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const validation = checkoutSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors });
    }

    const { cart, email } = validation.data;

    // Create PayPal order payload
    const paypalOrder = await createPayPalOrder(cart, email);

    // Get access token from PayPal
    const accessToken = await getPayPalAccessToken();

    // Create order on PayPal
    const response = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(paypalOrder)
    });

    if (!response.ok) {
      throw new Error('Failed to create PayPal order');
    }

    const paypalData = await response.json();
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    // Save order to Firebase
    const ordersRef = collection(db, 'orders');
    const newOrder = {
      email,
      items: cart,
      total,
      status: 'pending',
      paymentStatus: 'pending',
      paypalOrderId: paypalData.id,
      createdAt: new Date().toISOString()
    };

    const orderedDoc = await addDoc(ordersRef, newOrder);

    // Send confirmation email
    await sendOrderConfirmationEmail(email, orderedDoc.id, total, cart);

    return res.status(200).json({
      orderId: paypalData.id,
      approvalUrl: paypalData.links.find(link => link.rel === 'approve').href
    });
  } catch (error) {
    console.error('PayPal order creation error:', error);
    return res.status(500).json({ error: 'Failed to create PayPal order' });
  }
}
