const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail', // e.g., 'Gmail' or use your SMTP server
  auth: {
    user: 'mehbsc321@gmail.com',
    pass: 'CSEeng123#',
  },
});
const nodemailer = require('nodemailer');


app.post('/api/submit-form', async (req, res) => {
    try {
      const { name, email, message } = req.body;
  
      // Send an email with Nodemailer
      const mailOptions = {
        from: 'your@email.com',
        to: email, // Use the user's provided email or a fixed email
        subject: 'Form Submission',
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      };
  
      await transporter.sendMail(mailOptions);
  
      res.status(200).send('Form data sent and email sent successfully');
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('An error occurred while sending the email.');
    }
  });
  
