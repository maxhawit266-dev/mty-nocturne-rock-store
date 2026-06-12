import { db } from '../../../lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { productSchema } from '../../../lib/validation';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return res.status(200).json(products);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch products' });
    }
  }

  if (req.method === 'POST') {
    try {
      const validation = productSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
      }

      const { name, price, stock, category, description, image } = validation.data;
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('name', '==', name));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        return res.status(400).json({ error: 'Product already exists' });
      }

      const newProduct = {
        name,
        price: Math.round(price * 100),
        stock: parseInt(stock),
        category,
        description: description || '',
        image: image || '',
        createdAt: new Date().toISOString()
      };

      const addedDoc = await db.collection('products').add(newProduct);
      return res.status(201).json({ id: addedDoc.id, ...newProduct });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create product' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
