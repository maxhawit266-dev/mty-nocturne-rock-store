import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function createToken(adminEmail) {
  const token = jwt.sign(
    { email: adminEmail, role: 'admin' },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  return token;
}

export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}

export function validateAdminCredentials(email, password) {
  return (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  );
}
