import sendToWhatsApp from '../services/httpRequest/sendToWhatsApp.js';
// Importing a helper function that handles the actual HTTP request to WhatsApp.

class WhatsAppService {
  // This class manages all interactions with the WhatsApp API.

  async sendMessage(to, body, messageId) {
    // Sends a plain text message to a specific WhatsApp number.
    
    const data = {
      messaging_product: 'whatsapp',  // Specifies that the product being used is WhatsApp.
      to,  // Recipient's phone number.
      text: { body }  // Message body (text content).
    }

    await sendToWhatsApp(data);  // Sends the data using the sendToWhatsApp function.
  }


  async markAsRead(to, messageId) {
    // Marks a message as read by the recipient.

    const data = {
      messaging_product: 'whatsapp',
      to,  // Recipient's phone number.
      type: 'message',  // Type of request (message-related).
      message_id: messageId,  // ID of the message to mark as read.
    };
    try {
      await sendToWhatsApp(data);  // Sends the request.
    } catch (error) {
      console.error('Error marking message as read:', error.message);
      // Logs an error if the request fails.
    }
  }


  async sendInteractiveButtons(to, BodyText, buttons) {
    // Sends a message with interactive buttons (for user response).
    
    const data = {
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',  // This indicates the message contains interactive elements.
      interactive: {
        type: 'button',  // Type of interactive element.
        body: { text: BodyText },  // Main message text.
        action: {
          buttons: buttons  // Array of buttons to display.
        }
      }
    };

    await sendToWhatsApp(data);
  }


  async sendMediaMessage(to, type, mediaUrl, caption) {
    // Sends media files (image, video, audio, document) to a recipient.

    try {
      const mediaObject = {};  // Object to hold media-specific details.

      switch (type) {
        case 'image':
          mediaObject.image = { link: mediaUrl, caption: caption };  // Image with optional caption.
          break;

        case 'audio':
          mediaObject.audio = { link: mediaUrl };  // Audio file (no caption needed).
          break;

        case 'video':
          mediaObject.video = { link: mediaUrl, caption: caption };  // Video with optional caption.
          break;

        case 'document':
          mediaObject.document = { 
            link: mediaUrl,  // Document URL.
            caption: caption,  // Optional caption.
            filename: 'medpet.pdf'  // Default filename for document downloads.
          };
          break;

        default:
          throw new Error('Este tipo de archivo no está permitido');  
          // Throws an error if the file type is not supported.
      }

      const data = {
        messaging_product: 'whatsapp',
        to,
        type: type,  // Media type (image, video, etc.).
        ...mediaObject  // Spread operator to include the correct media object dynamically.
      };

      await sendToWhatsApp(data);  // Sends the media message.

    } catch (error) {
      console.error('Error sending media message:', error.message);
      // Logs an error if media sending fails.
    }
  }


  async sendContactMessage(to, contact) {
    // Sends a contact card to a recipient.

    const data = {
      messaging_product: 'whatsapp',
      to,
      type: 'contacts',  // Message type - sending a contact.
      contacts: [contact]  // Array of contacts (WhatsApp accepts multiple).
    };
    await sendToWhatsApp(data);
  }
  

  async sendLocationMessage(to, latitude, longitude, name, address) {
    // Sends a location (map pin) to a recipient.

    const data = {
      messaging_product: 'whatsapp',
      to,
      type: 'location',  // Type of message - location.
      location: {
        latitude: latitude,  // Latitude coordinates.
        longitude: longitude,  // Longitude coordinates.
        name: name,  // Location name.
        address: address  // Location address.
      }
    }
    await sendToWhatsApp(data);  // Sends the location data.
  };
}

export default new WhatsAppService();  
// Exports an instance of WhatsAppService, so it can be used directly without instantiation.
