'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../../styles/dashboard.module.css';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [tab, setTab] = useState('orders');
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '', category: '', description: '' });
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/products')
      ]);
      setOrders(await ordersRes.json());
      setProducts(await productsRes.json());
      setLoading(false);
    } catch (err) {
      console.error('Failed to load data');
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProduct,
          price: parseFloat(newProduct.price),
          stock: parseInt(newProduct.stock)
        })
      });
      if (res.ok) {
        setNewProduct({ name: '', price: '', stock: '', category: '', description: '' });
        loadData();
      }
    } catch (err) {
      alert('Failed to add product');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className={styles.dashboard}>
      <nav className={styles.navbar}>
        <h1>🤘 ADMIN DASHBOARD 🤘</h1>
        <button onClick={handleLogout}>Logout</button>
      </nav>

      <div className={styles.tabs}>
        <button className={tab === 'orders' ? styles.active : ''} onClick={() => setTab('orders')}>
          Órdenes
        </button>
        <button className={tab === 'products' ? styles.active : ''} onClick={() => setTab('products')}>
          Productos
        </button>
      </div>

      <div className={styles.content}>
        {tab === 'orders' && (
          <section>
            <h2>Órdenes</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Pago</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>{order.id.slice(0, 8)}</td>
                    <td>{order.email}</td>
                    <td>${(order.total / 100).toFixed(2)} MXN</td>
                    <td><span className={`${styles.badge} ${styles[order.status]}`}>{order.status}</span></td>
                    <td><span className={`${styles.badge} ${styles[order.paymentStatus]}`}>{order.paymentStatus}</span></td>
                    <td>{new Date(order.createdAt).toLocaleDateString('es-MX')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {tab === 'products' && (
          <section>
            <h2>Productos</h2>
            <form onSubmit={handleAddProduct} className={styles.form}>
              <input
                type="text"
                placeholder="Nombre"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Precio"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Stock"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Categoría"
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                required
              />
              <textarea
                placeholder="Descripción"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              />
              <button type="submit">Agregar Producto</button>
            </form>

            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>${(product.price / 100).toFixed(2)} MXN</td>
                    <td>{product.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </div>
  );
}
