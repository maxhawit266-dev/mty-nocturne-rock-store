import { stripe } from '../../lib/stripe';
import { db } from '../../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { checkoutSchema } from '../../lib/validation';

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

    const lineItems = cart.map(item => ({
      price_data: {
        currency: 'mxn',
        product_data: {
          name: item.name,
          description: item.category
        },
        unit_amount: item.price
      },
      quantity: item.qty
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/cancel`,
      customer_email: email,
      metadata: {
        email,
        items: JSON.stringify(cart)
      }
    });

    const ordersRef = collection(db, 'orders');
    const newOrder = {
      email,
      items: cart,
      total: cart.reduce((sum, item) => sum + item.price * item.qty, 0),
      status: 'pending',
      paymentStatus: 'pending',
      stripeSessionId: session.id,
      createdAt: new Date().toISOString()
    };
    const orderedDoc = await addDoc(ordersRef, newOrder);

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
