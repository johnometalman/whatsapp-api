// openAIService.js

import OpenAI from "openai";
import config from "../config/env.js";

// Inicializa el cliente de OpenAI con la clave de API
const client = new OpenAI({
    apiKey: config.OPENAI_API_KEY,
});

// Servicio para manejar consultas a OpenAI
const openAIService = async (message) => {
    try {
        // Realiza una solicitud a la API de OpenAI para completar el chat
        const response = await client.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `${config.PROMPT}`  // Prompt del sistema desde la configuración
                },
                { 
                    role: 'user', 
                    content: message  // Mensaje del usuario
                }
            ],
            model: 'gpt-4o'  // Modelo de OpenAI a utilizar
        });

        // Imprime la respuesta para verificar la estructura
        console.log(response);

        // Retorna el contenido de la respuesta del modelo
        return response.choices[0].message.content;

    } catch (error) {
        console.error(error);  // Manejo de errores
    }
}

export default openAIService;
