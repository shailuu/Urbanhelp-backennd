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

module.exports = { generateBookingApprovalEmail };