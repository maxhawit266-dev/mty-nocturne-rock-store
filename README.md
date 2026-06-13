# 🤘 MTY NOCTURNE ROCK STORE 🤘

Fully functional rock-metal clothing e-commerce store built with Next.js, Firebase, PayPal, and Resend.

## Features

✅ **Complete E-Commerce**
- Product catalog with categories
- Shopping cart with quantity management
- PayPal payment integration
- Order tracking

✅ **Admin Dashboard**
- Secure admin authentication (JWT)
- Product management (create, read, update, delete)
- Order management
- Order status tracking

✅ **Email Notifications**
- Order confirmation emails
- Payment confirmation emails
- Payment failed notifications
- Beautiful dark-themed HTML emails

✅ **Security**
- Protected admin routes with middleware
- JWT token validation
- Secure password hashing
- Input validation with Zod

## Setup

### 1. Environment Variables

Create `.env.local` with your API keys:

```bash
cp .env.local.example .env.local
```

Fill in all the required variables:
- Firebase credentials
- PayPal API keys
- Resend API key
- JWT secret
- Admin credentials

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Admin Access

Go to [http://localhost:3000/admin/login](http://localhost:3000/admin/login) with your admin credentials.

## API Endpoints

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create product (admin)
- `PUT /api/products/[id]` - Update product (admin)
- `DELETE /api/products/[id]` - Delete product (admin)

### Orders
- `GET /api/orders` - List all orders (admin)
- `GET /api/orders/[id]` - Get order details
- `POST /api/orders` - Create order
- `PUT /api/orders/[id]` - Update order status (admin)

### PayPal
- `POST /api/paypal/create-order` - Create PayPal order
- `POST /api/paypal/capture-order` - Capture PayPal payment

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout

## Deployment to Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) and connect your repo
3. Add environment variables in Vercel dashboard
4. Deploy!

## Database Schema (Firebase)

### Products Collection
```json
{
  "name": "string",
  "price": "number (in cents)",
  "stock": "number",
  "category": "string",
  "description": "string",
  "image": "string (URL)",
  "createdAt": "timestamp"
}
```

### Orders Collection
```json
{
  "email": "string",
  "items": "array",
  "total": "number",
  "status": "pending|processing|shipped|completed",
  "paymentStatus": "pending|paid|failed",
  "paypalOrderId": "string",
  "createdAt": "timestamp"
}
```

## Getting PayPal API Keys

1. Go to [PayPal Developer](https://developer.paypal.com)
2. Sign up or log in
3. Go to Dashboard → Apps & Credentials
4. Select "Sandbox" (for testing)
5. Find your **Client ID** and **Secret**
6. Add them to `.env.local`:
   ```
   NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_client_id
   PAYPAL_CLIENT_SECRET=your_secret
   ```

## License

MIT
