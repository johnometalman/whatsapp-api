import whatsappService from './whatsappService.js';

class MessageHandler {
  async handleIncomingMessage(message) {
    if (message?.type === 'text') {
      const incommingMessage = message.text.body.toLowerCase().trim();

      if(this.isGreeting(incommingMessage)){
        await this.sendWelcomeMessage(message.from, message.id)
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

  async sendWelcomeMessage(to, messageId) {
    const welcomeMessage = "Hola, bienvenido a nuestro servicio de veterinaria online. " + 
    "¿En qué puedo ayudarte hoy?";
    await whatsappService.sendMessage(to, welcomeMessage, messageId);
  }
}

export default new MessageHandler();