// googleSheetsService.js

import path from 'path';
import { google } from 'googleapis';

// Inicializa el servicio de Google Sheets
const sheets = google.sheets('v4');

// Añade una fila a la hoja de cálculo
async function addRowToSheet(auth, spreadsheetId, values) {
    try {
        const response = await sheets.spreadsheets.values.append({
            auth: auth,
            spreadsheetId: spreadsheetId,
            range: 'reservas',  // Rango donde se agregará la fila
            valueInputOption: 'RAW',  // Los datos se insertarán como están
            insertDataOption: 'INSERT_ROWS',  // Inserta nuevas filas sin sobrescribir
            requestBody: {
                values: [values],  // Datos a insertar
            }
        });
        return response.data;

    } catch (error) {
        console.error('Error adding row to sheet:', error);  // Manejo de errores
    }
}

// Función principal para agregar datos a la hoja
const appendToSheet = async (data) => {
    try {
        // Autenticación con Google Sheets usando credenciales
        const auth = new google.auth.GoogleAuth({
            keyFile: path.join(process.cwd(), 'src/credentials/', 'credentials.json'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets']  // Permisos necesarios
        });

        const authClient = await auth.getClient();  // Obtiene el cliente autenticado
        const spreadsheetId = '15_gPbp4Z2rN66nSJQmUV8i0e3NMaUbPHq0pbo2xVdfc';  // ID de la hoja de cálculo

        // Añade una nueva fila con los datos proporcionados
        await addRowToSheet(authClient, spreadsheetId, data);

        return 'Datos correctamente agregados';

    } catch (error) {
        console.error('Error appending to sheet:', error);  // Manejo de errores
    }
}

export default appendToSheet;
