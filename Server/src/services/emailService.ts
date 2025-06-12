/**
 * Email service for sending transactional emails using Nodemailer.
 * Currently used for password reset codes.
 */

import nodemailer from "nodemailer";

// Create a Nodemailer transporter using Gmail SMTP.
// Credentials are stored in environment variables for security.
 const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your Gmail address ( youremail@gmail.com)
    pass: process.env.EMAIL_PASS, // an app password or your Gmail password
  },
});

/**
 * Sends a password reset code to the user's email address.
 * @param to The recipient's email address.
 * @param code The 6-digit reset code to send.
 */
 async function sendPasswordResetEmail(to: string, code: string) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "FurEver Friends - Password Reset Code",
    html: `
      <div style="max-width: 480px; margin: auto; background: #fff6ee; border-radius: 16px; box-shadow: 0 2px 10px #c9c9c9; padding: 36px; font-family: 'Segoe UI', Arial, sans-serif; color: #684A36;">
        <div style="text-align: center;">
          <img src="https://i.ibb.co/tpPxh7BZ/logo.png" alt="FurEver Friends Logo" width="72" height="72" style="margin-bottom: 10px;" />
          <h2 style="color: #b97e65; margin-bottom: 8px;">FurEver Friends – Pet Clinic</h2>
        </div>
        <hr style="border: none; border-top: 1px solid #b97e65; margin: 18px 0;">
        <h3 style="margin-top: 16px;">Password Reset Request</h3>
        <p>Hi,</p>
        <p>We received a request to reset your password. Please use the following verification code:</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="display: inline-block; font-size: 2.3rem; background: #fbe6da; border-radius: 10px; padding: 12px 32px; font-weight: bold; letter-spacing: 2px; color: #b97e65; border: 1px dashed #b97e65;">
            ${code}
          </span>
        </div>
        <p style="margin-bottom: 18px;">This code is valid for 15 minutes. If you did not request a password reset, you can ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #b97e65; margin: 18px 0;">
        <div style="font-size: 0.9rem; color: #84736c;">
          <div>FurEver Friends – Pet Clinic</div>
          <div>51 Snunit St., Karmiel, Israel 2161002</div>
          <div>info@fureverfriends.com | +972 4 123 4567</div>
        </div>
      </div>
    `,
  });
}
 async function sendEmergencyCancelEmail(
  to: string,
  appointmentDate: Date,
  vetName: string
) {
  const dateStr = new Date(appointmentDate).toLocaleString("en-GB", { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
  const subject = "Important: Your Appointment Has Been Cancelled";
  const html = `
    <div style="max-width: 480px; margin: auto; background: #fff6ee; border-radius: 16px; box-shadow: 0 2px 10px #c9c9c9; padding: 36px; font-family: 'Segoe UI', Arial, sans-serif; color: #684A36;">
      <div style="text-align: center;">
        <h2 style="color: #b97e65; margin-bottom: 8px;">FurEver Friends – Emergency Notice</h2>
      </div>
      <hr style="border: none; border-top: 1px solid #b97e65; margin: 18px 0;">
      <p>Dear Client,</p>
      <p>Your appointment on <b>${dateStr}</b> with <b>Dr. ${vetName}</b> was cancelled due to an unexpected emergency case at our clinic.</p>
      <p>We apologize for the inconvenience. Please reschedule your appointment via our website. If you need urgent help, contact the clinic at <b>+972 4 123 4567</b>.</p>
      <p>Thank you for your understanding.<br><b>FurEver Friends Clinic</b></p>
    </div>
  `;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html
  });
}
 async function sendEmergencyVetAlertEmail(
  to: string,
  emergencyTime: Date,
  description: string,
  emergencyReason?: string
) {
  const dateStr = new Date(emergencyTime).toLocaleString("en-GB", { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
  const subject = "EMERGENCY: You Have Been Assigned an Urgent Appointment!";
  const html = `
    <div style="max-width: 480px; margin: auto; background: #fff6ee; border-radius: 16px; box-shadow: 0 2px 10px #c9c9c9; padding: 36px; font-family: 'Segoe UI', Arial, sans-serif; color: #684A36;">
      <div style="text-align: center;">
        <h2 style="color: #DC2626; margin-bottom: 8px;">EMERGENCY APPOINTMENT</h2>
      </div>
      <hr style="border: none; border-top: 1px solid #b97e65; margin: 18px 0;">
      <p>Dear Doctor,</p>
      <p>You have been assigned an <b>emergency appointment</b> scheduled for <b>${dateStr}</b>.</p>
      <p><b>Case Description:</b> ${description || 'No description provided.'}</p>
      ${emergencyReason ? `<p><b>Emergency Reason:</b> ${emergencyReason}</p>` : ""}
      <p>Please prepare for immediate action.</p>
      <p>Thank you for your dedication.<br><b>FurEver Friends Clinic</b></p>
    </div>
  `;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html
  });
}

export {
  sendPasswordResetEmail,
  sendEmergencyCancelEmail,
  sendEmergencyVetAlertEmail
};
