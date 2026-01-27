import { Resend } from 'https://esm.sh/resend';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

export class EmailService {
  static async sendWelcomeEmail(to: string, username: string) {
    await resend.emails.send({
      from: 'Otaku Merch <welcome@otakumerch.com>',
      to,
      subject: 'Welcome to Otaku Merch!',
      html: `<h1>Welcome ${username}!</h1><p>Start exploring Web3 and Anime merch...</p>`
    });
  }

  static async sendPasswordReset(to: string, resetLink: string) {
    await resend.emails.send({
      from: 'Otaku Merch <support@otakumerch.com>',
      to,
      subject: 'Reset Your Password',
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
    });
  }

  static async sendOrderConfirmation(to: string, order: any) {
    await resend.emails.send({
      from: 'Otaku Merch <orders@otakumerch.com>',
      to,
      subject: `Order Confirmation #${order.order_number}`,
      html: this.generateOrderEmail(order)
    });
  }

  static async sendCreatorApproval(to: string, approved: boolean, reason?: string) {
    const subject = approved ? 'Creator Account Approved!' : 'Creator Application Update';
    const html = approved 
      ? '<h1>Congratulations! Your creator account has been approved.</h1>'
      : `<h1>Update on your creator application</h1><p>${reason || 'Please contact support for details.'}</p>`;
    
    await resend.emails.send({
      from: 'Otaku Merch <creators@otakumerch.com>',
      to,
      subject,
      html
    });
  }

  static async sendProductApproval(to: string, product: any, approved: boolean, reason?: string) {
    const subject = approved ? 'Product Approved!' : 'Product Needs Revisions';
    const html = approved
      ? `<h1>Your product "${product.title}" has been approved!</h1>`
      : `<h1>Revisions needed for "${product.title}"</h1><p>${reason}</p>`;
    
    await resend.emails.send({
      from: 'Otaku Merch <creators@otakumerch.com>',
      to,
      subject,
      html
    });
  }

  private static generateOrderEmail(order: any) {
      return `
        <h1>Order Confirmed!</h1>
        <p>Order Number: ${order.order_number}</p>
        <p>Total: $${order.total}</p>
        <p>We'll notify you when it ships!</p>
      `;
  }
}
