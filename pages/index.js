'use client';
import { useEffect, useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/checkout-js';
import Link from 'next/link';
import styles from '../styles/home.module.css';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [email, setEmail] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showPayPal, setShowPayPal] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load products');
        setLoading(false);
      });
  }, []);

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, qty: item.qty + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQty = (productId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map(item =>
      item.id === productId ? { ...item, qty } : item
    ));
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  };

  const handleCheckout = async () => {
    if (!email || cart.length === 0) {
      alert('Por favor ingresa tu email y asegúrate de que tu carrito no esté vacío');
      return;
    }
    setShowPayPal(true);
  };

  if (loading) return <div className={styles.loading}>Cargando...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID }}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>🤘 MTY NOCTURNE ROCK STORE 🤘</h1>
          <button
            className={styles.cartBtn}
            onClick={() => setShowCart(!showCart)}
          >
            Carrito ({cart.length})
          </button>
        </header>

        <div className={styles.content}>
          <div className={styles.productsGrid}>
            {products.map(product => (
              <div key={product.id} className={styles.productCard}>
                {product.image && <img src={product.image} alt={product.name} />}
                <h3>{product.name}</h3>
                <p className={styles.category}>{product.category}</p>
                <p className={styles.description}>{product.description}</p>
                <div className={styles.footer}>
                  <span className={styles.price}>${(product.price / 100).toFixed(2)} MXN</span>
                  {product.stock > 0 ? (
                    <button
                      className={styles.addBtn}
                      onClick={() => addToCart(product)}
                    >
                      Agregar
                    </button>
                  ) : (
                    <span className={styles.outOfStock}>Agotado</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {showCart && (
            <aside className={styles.cartSidebar}>
              <h2>Tu Carrito</h2>
              {cart.length === 0 ? (
                <p>Tu carrito está vacío</p>
              ) : (
                <>
                  <div className={styles.cartItems}>
                    {cart.map(item => (
                      <div key={item.id} className={styles.cartItem}>
                        <div>
                          <h4>{item.name}</h4>
                          <p>${(item.price / 100).toFixed(2)} MXN</p>
                        </div>
                        <div className={styles.qtyControl}>
                          <button onClick={() => updateQty(item.id, item.qty - 1)}>-</button>
                          <input
                            type="number"
                            value={item.qty}
                            onChange={(e) => updateQty(item.id, parseInt(e.target.value))}
                          />
                          <button onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                        </div>
                        <button
                          className={styles.removeBtn}
                          onClick={() => removeFromCart(item.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className={styles.cartSummary}>
                    <h3>Total: ${(getTotal() / 100).toFixed(2)} MXN</h3>
                    <input
                      type="email"
                      placeholder="Tu email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={styles.emailInput}
                    />
                    {!showPayPal ? (
                      <button
                        className={styles.checkoutBtn}
                        onClick={handleCheckout}
                        disabled={checkoutLoading}
                      >
                        {checkoutLoading ? 'Procesando...' : 'PAGAR CON PAYPAL 🤘'}
                      </button>
                    ) : (
                      <PayPalButtons
                        createOrder={async () => {
                          const res = await fetch('/api/paypal/create-order', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ cart, email })
                          });
                          const data = await res.json();
                          return data.orderId;
                        }}
                        onApprove={async (data) => {
                          await fetch('/api/paypal/capture-order', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ orderId: data.orderID })
                          });
                          window.location.href = '/success';
                        }}
                        onError={(err) => {
                          console.error(err);
                          alert('Error en el pago. Por favor intenta de nuevo.');
                        }}
                      />
                    )}
                  </div>
                </>
              )}
            </aside>
          )}
        </div>

        <footer className={styles.footer}>
          <p>© 2024 MTY Nocturne Rock Store - All rights reserved 🤘</p>
          <Link href="/admin/login">Admin</Link>
        </footer>
      </div>
    </PayPalScriptProvider>
  );
}
