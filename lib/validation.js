import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Product name required'),
  price: z.number().positive('Price must be positive'),
  stock: z.number().int().min(0, 'Stock must be non-negative'),
  category: z.string().min(1, 'Category required'),
  description: z.string().optional(),
  image: z.string().url().optional()
});

export const checkoutSchema = z.object({
  cart: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    qty: z.number().int().positive()
  })).min(1, 'Cart must not be empty'),
  email: z.string().email('Valid email required')
});

export const orderSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'completed']).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'failed']).optional()
});
