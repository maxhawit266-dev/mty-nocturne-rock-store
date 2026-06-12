import { db } from '../../../lib/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { checkoutSchema } from '../../../lib/validation';
import { sendOrderConfirmationEmail } from '../../../lib/mail';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const ordersRef = collection(db, 'orders');
      const snapshot = await getDocs(ordersRef);
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return res.status(200).json(orders);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch orders' });
    }
  }

  if (req.method === 'POST') {
    try {
      const validation = checkoutSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
      }

      const { cart, email } = validation.data;
      const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

      const newOrder = {
        email,
        items: cart,
        total,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: new Date().toISOString()
      };

      const ordersRef = collection(db, 'orders');
      const addedDoc = await addDoc(ordersRef, newOrder);

      await sendOrderConfirmationEmail(email, addedDoc.id, total, cart);

      return res.status(201).json({ id: addedDoc.id, ...newOrder });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to create order' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
