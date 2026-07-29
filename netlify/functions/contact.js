import nodemailer from "nodemailer";

export const handler = async (event) => {
  try {
    const { name, email, message } = JSON.parse(event.body);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: `New Message Via Portfolio`,
      html: `
        <h2>New Message from Portfolio</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
      replyTo: email,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Email sent successfully!",
      }),
    };
  } catch (err) {
    console.error("Error sending email:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: err.message || "Failed to send email",
      }),
    };
  }
};