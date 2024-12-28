import OpenAI from "openai";
import config from "../config/env.js";

const client = new OpenAI({
    apiKey: config.OPENAI_API_KEY,
});

const openAIService = async (message) => {
    try {
        const response = await client.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `${config.PROMPT}`
                },
                { role: 'user', content: message }
            ],
            model: 'gpt-4o'
        });

        // Log the response to verify its structure
        console.log(response);

        // Correctly access the 'content' property
        return response.choices[0].message.content;

    } catch (error) {
        console.error(error);
    }
}

export default openAIService;
