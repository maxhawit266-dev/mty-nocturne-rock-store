import Link from 'next/link';
import styles from '../styles/cancel.module.css';

export default function Cancel() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 style={{ color: '#ff0000' }}>❌ PAGO CANCELADO</h1>
        <p>Tu pago fue cancelado. No se realizó ningún cargo.</p>
        <p>Puedes intentar nuevamente cuando desees.</p>
        <Link href="/" className={styles.backBtn}>
          Volver a la tienda
        </Link>
      </div>
    </div>
  );
}
