import { stripe } from '../../../lib/stripe';
import { db } from '../../../lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { sendPaymentConfirmedEmail } from '../../../lib/mail';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];

  let event;
  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('stripeSessionId', '==', session.id));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const orderDoc = snapshot.docs[0];
        const orderRef = doc(db, 'orders', orderDoc.id);
        await updateDoc(orderRef, {
          paymentStatus: 'paid',
          status: 'processing',
          paidAt: new Date().toISOString()
        });

        const orderData = orderDoc.data();
        await sendPaymentConfirmedEmail(orderData.email, orderDoc.id, orderData.total);
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  }

  res.status(200).json({ received: true });
}
