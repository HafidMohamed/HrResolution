const twilio = require('twilio');

class SMSService {
  static async sendScheduleSMS(phoneNumber, content) {
    try {
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

      await client.messages.create({
        body: content,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });

      console.log('Schedule SMS sent successfully');
    } catch (error) {
      console.error('Error sending schedule SMS:', error);
      throw error;
    }
  }
}

module.exports = SMSService;