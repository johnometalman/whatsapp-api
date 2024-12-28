import sendToWhatsApp from '../services/httpRequest/sendToWhatsApp.js';

class WhatsAppService {
  async sendMessage(to, body, messageId) {
    const data = {
      messaging_product: 'whatsapp',
      to,
      text: { body }
    }

    await sendToWhatsApp(data);
  }


  async markAsRead(to, messageId) {
    const data = {
      messaging_product: 'whatsapp',
      to,
      type: 'message',
      message_id: messageId,
    };
    try {
      await sendToWhatsApp(data);
    } catch (error) {
      console.error('Error marking message as read:', error.message);
    }
  }


  async sendInteractiveButtons(to, BodyText, buttons) {
    const data = {
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: BodyText },
        action: {
          buttons: buttons
        }
      }
    };

    await sendToWhatsApp(data);
  }


  async sendMediaMessage(to, type, mediaUrl, caption) {
    try {
      const mediaObject = {};

      switch (type) {
        case 'image':
          mediaObject.image = { link: mediaUrl, caption: caption };
          break;

        case 'audio':
          mediaObject.audio = { link: mediaUrl };
          break;

        case 'video':
          mediaObject.video = { link: mediaUrl, caption: caption };
          break;

        case 'document':
          mediaObject.document = { link: mediaUrl, caption: caption, filename: 'medpet.pdf' };
          break;

        default:
          throw new Error('Este tipo de archivo no está permitido');
      }

      const data = {
        messaging_product: 'whatsapp',
        to,
        type: type,
        ...mediaObject
      };

      await sendToWhatsApp(data);

    } catch (error) {
      console.error('Error sending media message:', error.message);
    }
  }


  async sendContactMessage(to, contact) {
    const data = {
      messaging_product: 'whatsapp',
      to,
      type: 'contacts',
      contacts: [contact]
    };
    await sendToWhatsApp(data);
  }
  

  async sendLocationMessage(to, latitude, longitude, name, address) {
    const data = {
      messaging_product: 'whatsapp',
      to,
      type: 'location',
      location: {
        latitude: latitude,
        longitude: longitude,
        name: name,
        address: address
      }
    }
    await sendToWhatsApp(data);
  };
}

export default new WhatsAppService();