import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmationEmail(email, orderId, total, items) {
  try {
    const itemsList = items
      .map(
        (item) =>
          `<tr>
        <td style="padding: 10px; border-bottom: 1px solid #333;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #333; text-align: center;">${item.qty}</td>
        <td style="padding: 10px; border-bottom: 1px solid #333; text-align: right;">$${(item.price / 100).toFixed(2)}</td>
      </tr>`
      )
      .join('');

    const html = `
      <div style="background: #0a0a0a; color: #fff; font-family: Arial, sans-serif; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; border: 2px solid #8b0000; padding: 20px;">
          <h1 style="color: #ff0000; text-align: center;">🤘 MTY NOCTURNE ROCK STORE 🤘</h1>
          <hr style="border-color: #8b0000; margin: 20px 0;">
          
          <h2 style="color: #ff6600;">¡Gracias por tu pedido!</h2>
          <p>Hola <strong>${email}</strong>,</p>
          <p>Tu pedido ha sido recibido y estamos procesándolo.</p>
          
          <div style="margin: 30px 0;">
            <p><strong>Número de Pedido:</strong> <span style="color: #ff6600;">#${orderId}</span></p>
          </div>
          
          <h3 style="color: #ff6600;">Detalles de tu Pedido:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #1a1a1a;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #8b0000;">Producto</th>
                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #8b0000;">Cantidad</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #8b0000;">Precio</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
          </table>
          
          <div style="margin-top: 20px; text-align: right;">
            <h3 style="color: #ff6600;">Total: $${(total / 100).toFixed(2)} MXN</h3>
          </div>
          
          <hr style="border-color: #8b0000; margin: 20px 0;">
          
          <p style="color: #aaa;">Te enviaremos un email de confirmación de pago pronto. Seguiremos tu pedido y te notificaremos cuando esté listo para enviar.</p>
          
          <p style="color: #aaa; font-size: 12px; margin-top: 30px;">Este es un email automático, por favor no responder. Si tienes preguntas contacta a: maxhawir@gmail.com</p>
          
          <p style="text-align: center; color: #ff0000; margin-top: 20px;">🤘 ROCK ON 🤘</p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: 'MTY Nocturne Rock Store <orders@mtynocturnrockstore.com>',
      to: email,
      subject: '🤘 Pedido Recibido - MTY Nocturne Rock Store',
      html,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

export async function sendPaymentConfirmedEmail(email, orderId, total) {
  try {
    const html = `
      <div style="background: #0a0a0a; color: #fff; font-family: Arial, sans-serif; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; border: 2px solid #00aa00; padding: 20px;">
          <h1 style="color: #00ff00; text-align: center;">🤘 PAGO CONFIRMADO 🤘</h1>
          <hr style="border-color: #00aa00; margin: 20px 0;">
          
          <h2 style="color: #00ff00;">¡Pago recibido con éxito!</h2>
          <p>Tu pago ha sido procesado correctamente.</p>
          
          <div style="background: #1a1a1a; padding: 15px; margin: 20px 0; border-left: 3px solid #00ff00;">
            <p><strong>Número de Pedido:</strong> <span style="color: #00ff00;">#${orderId}</span></p>
            <p><strong>Monto:</strong> <span style="color: #00ff00;">$${(total / 100).toFixed(2)} MXN</span></p>
          </div>
          
          <p>Tu pedido será preparado y enviado pronto. Te mantendremos informado del estado de tu compra.</p>
          
          <p style="color: #aaa; font-size: 12px; margin-top: 30px;">🤘 ROCK ON 🤘</p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: 'MTY Nocturne Rock Store <orders@mtynocturnrockstore.com>',
      to: email,
      subject: '✅ Pago Confirmado - MTY Nocturne Rock Store',
      html,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    return { success: false, error: error.message };
  }
}

export async function sendPaymentFailedEmail(email, orderId) {
  try {
    const html = `
      <div style="background: #0a0a0a; color: #fff; font-family: Arial, sans-serif; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; border: 2px solid #ff0000; padding: 20px;">
          <h1 style="color: #ff0000; text-align: center;">⚠️ PAGO NO COMPLETADO ⚠️</h1>
          <hr style="border-color: #ff0000; margin: 20px 0;">
          
          <h2 style="color: #ff6600;">Hubo un problema con tu pago</h2>
          <p>Lamentablemente, tu pago no se completó correctamente.</p>
          
          <p style="color: #aaa;">Por favor, intenta nuevamente visitando tu carrito.</p>
          
          <p style="margin-top: 20px;">Si el problema persiste, contacta a: maxhawir@gmail.com</p>
          
          <p style="color: #aaa; font-size: 12px; margin-top: 30px;">🤘 ROCK ON 🤘</p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: 'MTY Nocturne Rock Store <orders@mtynocturnrockstore.com>',
      to: email,
      subject: '❌ Pago No Completado - MTY Nocturne Rock Store',
      html,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending payment failed email:', error);
    return { success: false, error: error.message };
  }
}
