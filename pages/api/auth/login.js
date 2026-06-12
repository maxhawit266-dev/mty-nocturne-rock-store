import { createToken, validateAdminCredentials } from '../../../lib/auth';
import { NextResponse } from 'next/server';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  if (!validateAdminCredentials(email, password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = createToken(email);

  res.setHeader('Set-Cookie', `adminToken=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`);
  res.status(200).json({ success: true, message: 'Login successful' });
}
