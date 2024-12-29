// sendToWhatsApp.js

import axios from 'axios';  // Importa axios para realizar solicitudes HTTP
import config from '../../config/env.js';  // Importa la configuración desde el archivo 'env.js'

// Función para enviar mensajes a WhatsApp usando la API
const sendToWhatsApp = async (data) => {
    // Construye la URL base para la API de WhatsApp
    const baseUrl = `${config.BASE_URL}/${config.API_VERSION}/${config.BUSINESS_PHONE}/messages`;

    // Configura las cabeceras para la solicitud, incluyendo el token de autorización
    const headers = {
        Authorization: `Bearer ${config.API_TOKEN}`  // El token de API para autenticación
    };

    try {
        // Realiza una solicitud POST a la API de WhatsApp
        const response = await axios({
            method: 'POST',  // Método HTTP para la solicitud
            url: baseUrl,  // URL para la solicitud
            headers: headers,  // Cabeceras para la solicitud
            data,  // Los datos (mensaje) que se enviarán
        });

        // Retorna la respuesta de la API
        return response.data;

    } catch (error) {
        // Si ocurre un error, lo imprime en la consola
        console.error(error);
    }
};

export default sendToWhatsApp;  // Exporta la función para su uso en otros módulos
