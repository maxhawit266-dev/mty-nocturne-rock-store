import { db } from '../../../lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { getPayPalAccessToken } from '../../../lib/paypal';
import { sendPaymentConfirmedEmail } from '../../../lib/mail';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID required' });
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    // Capture the order
    const response = await fetch(
      `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to capture PayPal order');
    }

    const captureData = await response.json();

    // Update order in Firebase
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('paypalOrderId', '==', orderId));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const orderDoc = snapshot.docs[0];
      const orderRef = doc(db, 'orders', orderDoc.id);
      const orderData = orderDoc.data();

      await updateDoc(orderRef, {
        paymentStatus: 'paid',
        status: 'processing',
        paidAt: new Date().toISOString()
      });

      // Send payment confirmed email
      await sendPaymentConfirmedEmail(orderData.email, orderDoc.id, orderData.total);
    }

    return res.status(200).json({ success: true, orderId });
  } catch (error) {
    console.error('PayPal capture error:', error);
    return res.status(500).json({ error: 'Failed to capture PayPal order' });
  }
}
