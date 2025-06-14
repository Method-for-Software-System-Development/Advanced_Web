/**
 * Email service for sending transactional emails using Nodemailer.
 * Currently used for password reset codes.
 */

import nodemailer from "nodemailer";
import User from "../models/userSchema";
import Pet from "../models/petSchema";
import Staff from "../models/staffSchema";

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

/**
 * Sends an alert email to all secretaries about a new emergency appointment.
 * @param details Object containing userId, petId, vetId, date, time, description, emergencyReason
 */
async function sendEmergencySecretaryAlertEmail({
  userId,
  petId,
  vetId,
  date,
  time,
  description,
  emergencyReason
}: {
  userId: string;
  petId: string;
  vetId: string;
  date: Date;
  time: string;
  description: string;
  emergencyReason?: string;
}) {
  // Fetch all secretaries
  const secretaries = await User.find({ role: "secretary" });
  if (!secretaries.length) return;

  // Fetch client, pet, and vet details
  const [client, pet, vet] = await Promise.all([
    User.findById(userId),
    Pet.findById(petId),
    Staff.findById(vetId)
  ]);

  const clientName = client ? `${client.firstName} ${client.lastName}` : "Unknown";
  const clientPhone = client?.phone || "N/A";
  const clientEmail = client?.email || "N/A";
  const petName = pet?.name || "Unknown";
  const vetName = vet ? `${vet.firstName} ${vet.lastName}` : "Unknown";

  const dateStr = new Date(date).toLocaleString("en-GB", { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
  const subject = "EMERGENCY: New Emergency Appointment Scheduled!";
  const html = `
    <div style="max-width: 520px; margin: auto; background: #fff6ee; border-radius: 16px; box-shadow: 0 2px 10px #c9c9c9; padding: 36px; font-family: 'Segoe UI', Arial, sans-serif; color: #684A36;">
      <div style="text-align: center;">
        <h2 style="color: #DC2626; margin-bottom: 8px;">EMERGENCY APPOINTMENT ALERT</h2>
      </div>
      <hr style="border: none; border-top: 1px solid #b97e65; margin: 18px 0;">
      <p><b>A new emergency appointment has been scheduled:</b></p>
      <ul style="font-size: 1.05rem; margin-bottom: 18px;">
        <li><b>Date & Time:</b> ${dateStr} (${time})</li>
        <li><b>Client:</b> ${clientName} (${clientPhone}, ${clientEmail})</li>
        <li><b>Pet:</b> ${petName}</li>
        <li><b>Assigned Vet:</b> ${vetName}</li>
        <li><b>Description:</b> ${description || 'No description provided.'}</li>
        ${emergencyReason ? `<li><b>Emergency Reason:</b> ${emergencyReason}</li>` : ""}
      </ul>
      <p style="color: #b97e65; font-weight: bold;">Please prepare for immediate client arrival and coordinate with the assigned veterinarian.</p>
      <p>Thank you for your attention.<br><b>FurEver Friends Clinic</b></p>
    </div>
  `;

  // Send to all secretaries
  for (const sec of secretaries) {
    if (sec.email) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: sec.email,
        subject,
        html
      });
    }
  }
}

/**
 *
 * Sends an emergency appointment confirmation email to the pet owner (user).
 * @param to The recipient's email address.
 * @param petName The name of the pet.
 * @param vetName The assigned veterinarian's name.
 * @param date The appointment date.
 * @param time The appointment time (string, e.g., '10:30 AM').
 * @param description The emergency description.
 * @param emergencyReason The reason for the emergency (optional).
 */
async function sendEmergencyOwnerConfirmationEmail({
  to,
  petName,
  vetName,
  date,
  time,
  description,
  emergencyReason
}: {
  to: string;
  petName: string;
  vetName: string;
  date: Date;
  time: string;
  description: string;
  emergencyReason?: string;
}) {
  const dateStr = new Date(date).toLocaleString("en-GB", { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
  const subject = "FurEver Friends: Emergency Appointment Confirmation";
  const html = `
    <div style="max-width: 480px; margin: auto; background: #fff6ee; border-radius: 16px; box-shadow: 0 2px 10px #c9c9c9; padding: 36px; font-family: 'Segoe UI', Arial, sans-serif; color: #684A36;">
      <div style="text-align: center;">
        <h2 style="color: #DC2626; margin-bottom: 8px;">EMERGENCY APPOINTMENT CONFIRMATION</h2>
      </div>
      <hr style="border: none; border-top: 1px solid #b97e65; margin: 18px 0;">
      <p>Dear Client,</p>
      <p>Your emergency appointment for <b>${petName}</b> has been scheduled.</p>
      <ul style="font-size: 1.05rem; margin-bottom: 18px;">
        <li><b>Date & Time:</b> ${dateStr} (${time})</li>
        <li><b>Assigned Veterinarian:</b> ${vetName}</li>
        <li><b>Description:</b> ${description || 'No description provided.'}</li>
        ${emergencyReason ? `<li><b>Emergency Reason:</b> ${emergencyReason}</li>` : ""}
      </ul>
      <p style="color: #b97e65; font-weight: bold;">Please come to the clinic immediately. Our staff will contact you if needed.</p>
      <p style="color: #DC2626; font-weight: bold;">Note: This is an emergency request and a $1000 charge will apply.</p>
      <p>Thank you for trusting us.<br><b>FurEver Friends Clinic</b></p>
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
  sendEmergencyVetAlertEmail,
  sendEmergencySecretaryAlertEmail,
  sendEmergencyOwnerConfirmationEmail
};
