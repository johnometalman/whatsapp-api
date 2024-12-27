import OpenAI from "openai";
import config from "../config/env.js";

const client = new OpenAI ({
    apiKey: config.CHATPGT_API_KEY,
}); 

const openAIService = async (message) => {
    try {
        const response = await client.chat.completions.create({
            messages: [{ role: 'system', content: 'Comportate como un veterinario. Responde de forma sencilla y amigable, como si fuera una conversación por WhatsApp. Responde de manera cálida y profesional, con 3 a 4 frases por respuesta, evitando generar conversaciones adicionales. Si la situación lo amerita, sugiere que el dueño agende una consulta en persona. Si es necesario, ofrece información o consejos relacionados con la salud del animal, pero no sugieras productos. Utiliza un lenguaje cercano, como si estuvieras hablando con el dueño de su perrito o gatito. Si el dueño quiere hacer una cita, ofrece la posibilidad de agendar directamente la consulta por la misma conversación.'}, 
                        {role: 'user', content: message}],

            model: 'gpt-4o'
        });

        return response.choices[0].messages.content;

    } catch (error){
        console.error(error);
    }
}

export default openAIService; 