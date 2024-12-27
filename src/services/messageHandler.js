import whatsappService from './whatsappService.js';
import appendToSheet from './googleSheetsService.js';

class MessageHandler {
  constructor() {
    this.appointmentState = {};
  }

  async handleIncomingMessage(message, senderInfo) {
    try {
      console.log('Incoming message:', message);
      console.log('Sender info:', senderInfo);

      const from = message.from; // Número del remitente

      // Verificar si el usuario está en el flujo de agendamiento
      if (this.appointmentState[from]) {
        const incomingMessage = message?.text?.body?.trim();
        await this.handleAppointmentFlow(from, incomingMessage);
        return; // Detener aquí, no procesar más
      }

      if (message?.type === 'text') {
        const incomingMessage = message.text.body.toLowerCase().trim();
        console.log('Incoming message text:', incomingMessage);

        if (this.isGreeting(incomingMessage)) {
          console.log('Greeting detected');
          await this.sendWelcomeMessage(from, message.id, senderInfo);
          await this.sendWelcomeMenu(from);
        } else if (incomingMessage === 'media') {
          console.log('Media request detected');
          await this.sendMedia(from);
        } else {
          console.log('Echo response');
          const response = `Echo: ${message.text.body}`;
          await whatsappService.sendMessage(from, response, message.id);
        }

        await whatsappService.markAsRead(message.id);
      } else if (message?.type === 'interactive') {
        const option = message?.interactive?.button_reply?.title.toLowerCase().trim();
        console.log('Interactive option:', option);
        await this.handleMenuOption(from, option);
        await whatsappService.markAsRead(message.id);
      }
    } catch (error) {
      console.error('Error handling incoming message:', error);
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
    const welcomeMessage = `Hola ${firstName}, bienvenido/a a MEDPET, tu tienda de mascotas online, ¿En qué puedo ayudarte hoy?`;
    await whatsappService.sendMessage(to, welcomeMessage, messageId);
  }

  async sendWelcomeMenu(to) {
    const menuMessage = "Elige una Opción";
    const buttons = [
      {
        type: 'reply',
        reply: { id: 'option_1', title: 'Agendar' }
      },
      {
        type: 'reply',
        reply: { id: 'option_2', title: 'Consultar' }
      },
      {
        type: 'reply',
        reply: { id: 'option_3', title: 'Ubicación' }
      }
    ];

    await whatsappService.sendInteractiveButtons(to, menuMessage, buttons);
  }

  async handleMenuOption(to, option) {
    let response;
    switch (option) {
      case 'agendar':
        this.appointmentState[to] = { step: 'name' }; // Iniciar flujo de agendamiento
        response = 'Por favor ingresa tu nombre:';
        break;

      case 'consultar':
        response = 'Consulta tu cita';
        break;

      case 'ubicación':
        response = 'Esta es nuestra Ubicación';
        break;

      default:
        response = 'Lo siento, no entendí tu selección, por favor selecciona una de las opciones';
    }

    await whatsappService.sendMessage(to, response);
  }

  async sendMedia(to) {
    const mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-video.mp4';
    const caption = '¡Esto es un video!';
    const type = 'video';

    await whatsappService.sendMediaMessage(to, type, mediaUrl, caption);
  }

  completeAppointment(to) {
    const appointment = this.appointmentState[to];
    delete this.appointmentState[to];

    const userData = [
      to,
      appointment.name,
      appointment.petName,
      appointment.petType,
      appointment.reason,
      new Date().toISOString()
    ]

    appendToSheet(userData);

    return `Gracias por agendar tu cita. 
    *Resumen de tu Cita:*
    
    *Nombre:* ${appointment.name}
    *Nombre de la Mascota:* ${appointment.petName}
    *Tipo de Mascota:* ${appointment.petType}
    *Razón de Consulta:* ${appointment.reason}
    
    Nos pondremos en contacto contigo pronto para confirmar la fecha y hora de tu cita`
  }

  async handleAppointmentFlow(to, message) {
    const state = this.appointmentState[to];
    let response;

    switch (state.step) {
      case 'name':
        state.name = message;
        state.step = 'petName';
        response = "Gracias, ahora, ¡Cuál es el nombre de tu mascota?";
        break;

      case 'petName':
        state.petName = message;
        state.step = 'petType';
        response = '¿Qué tipo de mascota es? (por ejemplo: perro, gato, huron, etc.)';
        break;

      case 'petType':
        state.petType = message;
        state.step = 'reason';
        response = '¿Cuál es el motivo de tu consulta?';
        break;

      case 'reason':
        state.reason = message;
        response = this.completeAppointment(to);
        delete this.appointmentState[to];
        break;

      default:
        response = 'Lo siento, no entendí tu mensaje. Por favor, responde a la pregunta anterior.';
    }
    await whatsappService.sendMessage(to, response);
  }


}

export default new MessageHandler();
