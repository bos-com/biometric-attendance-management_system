import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const { email, name, resetToken } = await request.json();

    if (!email || !resetToken) {
      return NextResponse.json(
        { success: false, message: "Email and reset token are required" },
        { status: 400 }
      );
    }

    // Create transporter using environment variables
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });
    console.log("Sender Email:", process.env.SMTP_EMAIL);
    console.log("Sender Password:", process.env.SMTP_PASSWORD);

    // Get the base URL for the reset link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

    // Email content
    const mailOptions = {
      from: `"Bugema Attendance System" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: "Reset Your Password - Bugema Attendance System",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 40px 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                        🎓 Bugema University
                      </h1>
                      <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                        Attendance Management System
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">
                        Password Reset Request
                      </h2>
                      
                      <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                        Hello <strong>${name || "there"}</strong>,
                      </p>
                      
                      <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                        We received a request to reset the password for your account. Click the button below to create a new password:
                      </p>
                      
                      <table role="presentation" style="margin: 30px auto;">
                        <tr>
                          <td style="border-radius: 8px; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);">
                            <a href="${resetLink}" target="_blank" style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 0 0 15px; color: #4b5563; font-size: 14px; line-height: 1.6;">
                        Or copy and paste this link into your browser:
                      </p>
                      
                      <p style="margin: 0 0 25px; padding: 12px; background-color: #f3f4f6; border-radius: 6px; word-break: break-all; color: #16a34a; font-size: 14px;">
                        ${resetLink}
                      </p>
                      
                      <div style="padding: 20px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                        <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                          <strong>⚠️ Important:</strong> This link will expire in <strong>30 minutes</strong>. 
                          If you didn't request this password reset, please ignore this email or contact support if you have concerns.
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
                      <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                        Need help? Contact us at support@bugema.edu
                      </p>
                      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                        © ${new Date().getFullYear()} Bugema University. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `
        Password Reset Request
        
        Hello ${name || "there"},
        
        We received a request to reset the password for your account.
        
        Click the link below to reset your password:
        ${resetLink}
        
        This link will expire in 30 minutes.
        
        If you didn't request this password reset, please ignore this email.
        
        - Bugema University Attendance System
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    console.error("Error sending reset email:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to send password reset email",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
