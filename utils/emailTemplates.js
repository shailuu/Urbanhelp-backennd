// utils/emailTemplates.js
function generateBookingApprovalEmail(booking, worker) {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
            <h2 style="color: #333;">Your Booking Has Been Approved!</h2>
            <p>Dear ${booking.clientInfo.name},</p>
            <p>We're pleased to inform you that your booking has been approved and a worker has been assigned.</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Booking Details</h3>
                <p><strong>Service:</strong> ${booking.service?.title || 'Service'}</p>
                <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${booking.time}</p>
                <p><strong>Duration:</strong> ${booking.duration} hours</p>
                <p><strong>Total Charge:</strong> $${booking.charge}</p>
            </div>
            
            <div style="background-color: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Assigned Worker</h3>
                <p><strong>Name:</strong> ${worker.name}</p>
                <p><strong>Contact:</strong> ${worker.phone || worker.email}</p>
                ${Array.isArray(worker.skills) ? `<p><strong>Skills:</strong> ${worker.skills.join(', ')}</p>` : ''}

            </div>
            
            <p>If you have any questions or need to make changes, please contact our support team.</p>
            <p>Thank you for choosing our services!</p>
        </div>
    `;
}
// NEW: generatePaymentConfirmationEmail function
const generatePaymentConfirmationEmail = (booking, transactionId) => {
  const serviceTitle = booking.service && typeof booking.service.title === 'string'
    ? booking.service.title
    : 'service';

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #28a745; text-align: center;">Payment Confirmed & Thank You!</h2>
      <p>Dear ${booking.clientInfo.clientName},</p>
      <p>Your payment for the <strong>${serviceTitle}</strong> booking has been successfully processed. Thank you for trusting us with your service needs!</p>
      <p><strong>Payment Details:</strong></p>
      <ul>
        <li><strong>Transaction ID:</strong> ${transactionId || 'N/A'}</li>
        <li><strong>Amount Paid:</strong> Rs. ${booking.charge ? booking.charge.toFixed(2) : 'N/A'}</li>
        <li><strong>Service:</strong> ${serviceTitle}</li>
        <li><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</li>
        <li><strong>Time:</strong> ${booking.time}</li>
        ${booking.approvedWorker && booking.approvedWorker.name ? `<li><strong>Assigned Worker:</strong> ${booking.approvedWorker.name}</li>` : ''}
      </ul>
      <p style="font-weight: bold; color: #6a6eff;">
        Please take a screenshot of this email and show it to your worker after they are done with their service as proof of payment.
      </p>
      <p>We look forward to providing you with excellent service.</p>
      <p>If you have any questions, feel free to contact us.</p>
      <p>Best regards,<br>The Service Team</p>
    </div>
  `;
};

module.exports = {
    generateBookingApprovalEmail,
    generatePaymentConfirmationEmail, // Export the new function
};
