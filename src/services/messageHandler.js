import whatsappService from './whatsappService.js';
import appendToSheet from './googleSheetsService.js';
import openAIService from './openAIService.js';

class MessageHandler {
  constructor() {
    // Estados para manejar flujos de agendamiento y asistente
    this.appointmentState = {};
    this.assistantState = {};
  }

  // Maneja los mensajes entrantes de WhatsApp
  async handleIncomingMessage(message, senderInfo) {
    const incomingMessage = message?.text?.body.toLowerCase().trim();  // Normaliza el texto entrante
    if (message?.type === 'text') {
      if (this.isGreeting(incomingMessage)) {
        // Responde a mensajes de saludo
        await this.sendWelcomeMessage(message.from, message.id, senderInfo);
        await this.sendWelcomeMenu(message.from);
      } else if (incomingMessage === 'media') {
        // Envía un mensaje multimedia
        await this.sendMedia(message.from);
      } else if (this.appointmentState[message.from]) {
        // Continúa el flujo de agendamiento
        await this.handleAppointmentFlow(message.from, incomingMessage);
      } else if (this.assistantState[message.from]) {
        // Continúa el flujo del asistente virtual
        await this.handleAssistantFlow(message.from, incomingMessage);
      } else {
        // Maneja cualquier otra opción de menú
        await this.handleMenuOption(message.from, incomingMessage);
      }
      await whatsappService.markAsRead(message.id);  // Marca el mensaje como leído
    } else if (message?.type === 'interactive') {
      // Maneja respuestas interactivas (botones)
      const option = message?.interactive?.button_reply?.id;
      await this.handleMenuOption(message.from, option);
      await whatsappService.markAsRead(message.id);
    }
  }

  // Determina si un mensaje es un saludo
  isGreeting(message) {
    return ["hola", "hello", "hi", "buenas tardes"].includes(message);
  }

  // Obtiene el nombre del remitente
  getSenderName(senderInfo) {
    return senderInfo.profile?.name || senderInfo.wa_id;
  }

  // Envía un mensaje de bienvenida personalizado
  async sendWelcomeMessage(to, messageId, senderInfo) {
    const firstName = this.getSenderName(senderInfo).split(' ')[0];
    await whatsappService.sendMessage(to, `Hola ${firstName}, bienvenido/a a MEDPET, tu tienda de mascotas online, ¿En qué puedo ayudarte hoy?`, messageId);
  }

  // Envía el menú interactivo principal
  async sendWelcomeMenu(to) {
    await whatsappService.sendInteractiveButtons(to, "Elige una Opción", [
      { type: 'reply', reply: { id: 'option_agendar', title: 'Agendar' } },
      { type: 'reply', reply: { id: 'option_consultar', title: 'Consultar' } },
      { type: 'reply', reply: { id: 'option_ubicacion', title: 'Ubicación' } }
    ]);
  }

  // Maneja las opciones del menú principal
  async handleMenuOption(to, option) {
    let response;
    switch (option) {
      case 'option_agendar':
        this.appointmentState[to] = { step: 'name' };  // Inicia el flujo de agendamiento
        response = 'Por favor ingresa tu nombre:';
        break;
      case 'option_consultar':
        this.assistantState[to] = { step: 'question' };  // Inicia el flujo del asistente virtual
        response = 'Por favor realiza tu consulta';
        break;
      case 'option_ubicacion':
        response = 'Te esperamos en nuestra sucursal';
        await this.sendLocation(to);  // Envía la ubicación
        break;
      case 'option_emergencia':
        response = 'Si esto es una emergencia te invitamos a enviarnos un mensaje a nuestra línea de atención';
        await this.sendContact(to);  // Envía información de contacto
        break;
      default:
        response = 'Lo siento, no entendí tu selección, por favor selecciona una de las opciones';
    }
    await whatsappService.sendMessage(to, response);
  }

  // Envía un mensaje multimedia (video)
  async sendMedia(to) {
    await whatsappService.sendMediaMessage(to, 'video', 'https://s3.amazonaws.com/gndx.dev/medpet-video.mp4', '¡Esto es un video!');
  }

  // Completa el flujo de agendamiento y guarda los datos en Google Sheets
  completeAppointment(to) {
    const { name, petName, petType, reason } = this.appointmentState[to];
    delete this.appointmentState[to];
    appendToSheet([to, name, petName, petType, reason, new Date().toISOString()]);
    return `Gracias por agendar tu cita. 
*Resumen de tu Cita:*
*Nombre:* ${name}
*Nombre de la Mascota:* ${petName}
*Tipo de Mascota:* ${petType}
*Razón de Consulta:* ${reason}
Nos pondremos en contacto contigo pronto para confirmar la fecha y hora de tu cita`;
  }

  // Maneja el flujo de agendamiento paso a paso
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
        break;
      default:
        response = 'Lo siento, no entendí tu mensaje. Por favor, responde a la pregunta anterior.';
    }
    await whatsappService.sendMessage(to, response);
  }

  // Maneja el flujo del asistente virtual (consulta)
  async handleAssistantFlow(to, message) {
    const response = await openAIService(message);
    delete this.assistantState[to];
    await whatsappService.sendMessage(to, response);
    await whatsappService.sendInteractiveButtons(to, "¿La respuesta fue de tu ayuda?", [
      { type: 'reply', reply: { id: 'option_si', title: "Si, gracias" } },
      { type: 'reply', reply: { id: 'option_new_question', title: "Nueva pregunta" } },
      { type: 'reply', reply: { id: 'option_emergencia', title: "Emergencia" } }
    ]);
  }

  // Envía la información de contacto
  async sendContact(to) {
    await whatsappService.sendContactMessage(to, {
      addresses: [{ street: "123 Calle de las Mascotas", city: "Ciudad", country: "País", type: "WORK" }],
      emails: [{ email: "contacto@medpet.com", type: "WORK" }],
      name: { formatted_name: "MedPet Contacto", first_name: "MedPet" },
      phones: [{ phone: "+1234567890", wa_id: "1234567890", type: "WORK" }],
      urls: [{ url: "https://www.medpet.com", type: "WORK" }]
    });
  }

  // Envía la ubicación de la tienda
  async sendLocation(to) {
    await whatsappService.sendLocationMessage(to, 6.2071694, -75.574607, 'Platzi Medellin', 'Cra. 43A #5A -113, El Poblado, Medellín, Antioquia');
  }
}

export default new MessageHandler();
