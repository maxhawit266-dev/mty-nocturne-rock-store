import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  price: z.number().min(0, 'Price must be positive'),
  stock: z.number().min(0, 'Stock must be non-negative'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  image: z.string().optional(),
});

export const cartItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  qty: z.number().min(1),
  stock: z.number(),
  category: z.string(),
  image: z.string().optional(),
});

export const checkoutSchema = z.object({
  cart: z.array(cartItemSchema).min(1, 'Cart cannot be empty'),
  email: z.string().email('Invalid email'),
});

export const adminLoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});
