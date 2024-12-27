import whatsappService from './whatsappService.js';
import appendToSheet from './googleSheetsService.js';
import openAIService from './openAIService.js';

class MessageHandler {
  constructor() {
    this.appointmentState = {};
    this.assistantState = {};
  }

  async handleIncomingMessage(message, senderInfo) {
    if (message?.type === 'text') {
      const incomingMessage = message.text.body.toLowerCase().trim();

      if(this.isGreeting(incomingMessage)){
        await this.sendWelcomeMessage(message.from, message.id, senderInfo);
        await this.sendWelcomeMenu(message.from);
      } 
      
      else if(incomingMessage === 'media') {
        await this.sendMedia(message.from);
      } 
      
      else if (this.appointmentState[message.from]) {
        await this.handleAppointmentFlow(message.from, incomingMessage);
      } 
      
      else if (this.assistantState[message.from]) {
        await this.handleAssistantFlow(message.from, incomingMessage);
      }     
      
      
      else {
        await this.handleMenuOption(message.from, incomingMessage);
      }
      await whatsappService.markAsRead(message.id);
    } 
    
      else if (message?.type === 'interactive') {
      const option = message?.interactive?.button_reply?.title.toLowerCase().trim();
      await this.handleMenuOption(message.from, option);
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
        this.assistantState[to] = { step: 'question' }; // Iniciar flujo de asistente
        response = 'Por favor realiza tu consulta';
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

  async handleAssistantFlow(to, message) {
    const state = this.assistantState[to];
    let response;

    const menuMessage = "¿La respuesta fue de tu ayuda?"
    const buttons = [
      {type: 'reply', reply: {id: 'option_4', title: "Si, gracias"} }, 
      {type: 'reply', reply: {id: 'option_5', title: "Nueva pregunta"}}, 
      {type: 'reply', reply: {id:'option_6', title: "Emergencia"}}

    ];

    if (state.step === 'question') {
      response = await openAIService(message);
    }

    delete this.assistantState[to]; 
    await whatsappService.sendMessage(to, response); 
    await whatsappService.sendInteractiveButtons(to, menuMessage, buttons);

  }


}

export default new MessageHandler();
