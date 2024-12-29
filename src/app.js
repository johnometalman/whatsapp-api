// Import the Express framework to create and manage the web server.
import express from 'express';

// Import configuration settings (like environment variables) from the 'env.js' file.
import config from './config/env.js';

// Import the routes that handle webhook requests from the 'webhookRoutes.js' file.
import webhookRoutes from './routes/webhookRoutes.js';

// Create an Express application instance.
const app = express();

// Middleware that tells the app to automatically parse incoming JSON data.
// This makes it easier to handle requests that send data in JSON format.
app.use(express.json());

// Use the webhook routes for the root path ('/'). 
// This means that any request to '/' will be handled by webhookRoutes.
app.use('/', webhookRoutes);

// Create a basic GET endpoint for the root URL ('/').
// When someone visits the home page, they will see a simple text message.
app.get('/', (req, res) => {
  res.send(`<pre>Nothing to see here.
Checkout README.md to start.</pre>`);
});

// Start the server and listen for incoming requests on the port specified in the configuration file.
// Once the server starts, it logs a message to the console indicating the port.
app.listen(config.PORT, () => {
  console.log(`Server is listening on port:  ${config.PORT}`);
});
