const axios = require('axios');
const logger = require('./logger');

/**
 * Sends a WhatsApp message using Meta's WhatsApp Cloud API (Template Message)
 * @param {string} to - Recipient phone number (with country code, e.g., 919182764294)
 * @param {string} templateName - Name of the pre-approved WhatsApp template
 * @param {string} languageCode - Language code for the template (default: 'en_US')
 * @param {Array} components - Parameters to populate the template body/header
 */
const sendWhatsApp = async (to, templateName, languageCode = 'en_US', components = []) => {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  // Basic validation to see if WhatsApp integration is configured
  if (!token || !phoneNumberId || token.includes('YOUR_META') || phoneNumberId.includes('YOUR_META')) {
    logger.warn('WhatsApp notification skipped: Meta Cloud API credentials not configured in environment.');
    return false;
  }

  try {
    const cleanTo = to.replace(/\D/g, ''); // strip formatting
    const url = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;
    
    const response = await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanTo,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode
          },
          components
        }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    logger.info(`WhatsApp message sent successfully: ${response.data.messages[0].id}`);
    return true;
  } catch (error) {
    logger.error(`Failed to send WhatsApp message: ${error.response?.data ? JSON.stringify(error.response.data) : error.message}`);
    return false;
  }
};

module.exports = sendWhatsApp;
