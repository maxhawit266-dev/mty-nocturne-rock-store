import { db } from '../../../lib/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { productSchema } from '../../../lib/validation';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const validation = productSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
      }

      const productRef = doc(db, 'products', id);
      const updateData = {
        ...validation.data,
        price: Math.round(validation.data.price * 100),
        stock: parseInt(validation.data.stock),
        updatedAt: new Date().toISOString()
      };

      await updateDoc(productRef, updateData);
      return res.status(200).json({ id, ...updateData });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update product' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const productRef = doc(db, 'products', id);
      await deleteDoc(productRef);
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete product' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
