import Link from 'next/link';
import styles from '../styles/success.module.css';

export default function Success() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 style={{ color: '#00ff00' }}>✅ ¡PAGO COMPLETADO!</h1>
        <p>Tu pedido ha sido recibido y procesado correctamente.</p>
        <p>Recibirás un email de confirmación pronto.</p>
        <p>Te enviaremos seguimiento de tu pedido.</p>
        <Link href="/" className={styles.backBtn}>
          Volver a la tienda
        </Link>
      </div>
    </div>
  );
}
