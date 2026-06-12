import { db } from '../../../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const orderRef = doc(db, 'orders', id);
      const snapshot = await getDoc(orderRef);
      if (!snapshot.exists()) {
        return res.status(404).json({ error: 'Order not found' });
      }
      return res.status(200).json({ id: snapshot.id, ...snapshot.data() });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch order' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { status, paymentStatus } = req.body;
      const orderRef = doc(db, 'orders', id);
      const updateData = {
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus }),
        updatedAt: new Date().toISOString()
      };
      await updateDoc(orderRef, updateData);
      return res.status(200).json({ id, ...updateData });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update order' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
