// webhookController.js

import config from '../config/env.js';  // Importa la configuración desde el archivo 'env.js'
import messageHandler from '../services/messageHandler.js';  // Importa el controlador de mensajes

class WebhookController {
  // Método para manejar los mensajes entrantes
  async handleIncoming(req, res) {
    // Extrae el mensaje y la información del remitente del cuerpo de la solicitud
    const message = req.body.entry?.[0]?.changes[0]?.value?.messages?.[0];
    const senderInfo = req.body.entry?.[0]?.changes[0]?.value?.contacts?.[0];

    // Si hay un mensaje, se maneja con el 'messageHandler'
    if (message) {
      await messageHandler.handleIncomingMessage(message, senderInfo);
    }

    // Responde con un estado 200 para confirmar que el mensaje fue recibido
    res.sendStatus(200);
  }

  // Método para verificar el webhook (usado en la configuración inicial de WhatsApp)
  verifyWebhook(req, res) {
    const mode = req.query['hub.mode'];  // Obtiene el modo del webhook
    const token = req.query['hub.verify_token'];  // Obtiene el token de verificación
    const challenge = req.query['hub.challenge'];  // Obtiene el desafío para la verificación

    // Si el modo es 'subscribe' y el token coincide con el que está configurado, se verifica el webhook
    if (mode === 'subscribe' && token === config.WEBHOOK_VERIFY_TOKEN) {
      // Envía el desafío como respuesta
      res.status(200).send(challenge);
      console.log('Webhook verified successfully!');  // Log de éxito
    } else {
      // Si la verificación falla, responde con un estado 403
      res.sendStatus(403);
    }
  }
}

export default new WebhookController();  // Exporta una nueva instancia del controlador para su uso en otros módulos
