import whatsappService from './whatsappService.js';

class MessageHandler {
  async handleIncomingMessage(message, senderInfo) {
    if (message?.type === 'text') {
      const incommingMessage = message.text.body.toLowerCase().trim();

      if(this.isGreeting(incommingMessage)){
        await this.sendWelcomeMessage(message.from, message.id, senderInfo);
        await this.sendWelcomeMenu(message.from); 
      } else {
        const response = `Echo: ${message.text.body}`;
        await whatsappService.sendMessage(message.from, response, message.id);
      }
      
      await whatsappService.markAsRead(message.id);
    }
  }

  isGreeting(message) {
    const greetings = ["hola", "hello", "hi", "buenas tardes"];
    return greetings.includes(message);
  }

  getSenderName(senderInfo) {
    return senderInfo.profile?.name || senderInfo.wa_id;
  }

  async sendWelcomeMessage(to, messageId, senderInfo) {
    const name = this.getSenderName(senderInfo);
    const firstName = name.split(' ')[0];
    const welcomeMessage = `Hola ${firstName}, bienvenido/a a MEDPET, tu tienda de mascotas online, ¿En qué puedo ayudarte hoy? `;
    await whatsappService.sendMessage(to, welcomeMessage, messageId);
  }


  async sendWelcomeMenu(to) {
    const menuMessage =  "Elige una Opción"
    const buttons = [
      {
        type: 'reply', reply: {id: 'option_1', title: 'Agendar'}
      },

      {
        type: 'reply', reply: {id: 'option_2', title: 'Consultar'}
      }, 

      {
        type: 'reply', reply: {id: 'option_3', title: 'Ubicación'}
      }
    ]; 

    await whatsappService.sendInteractiveButtons(to, menuMessage, buttons);
  }



}

export default new MessageHandler();