import path from 'path';
import { google } from 'googleapis';

const sheets = google.sheets('v4');

async function addRowToSheet(auth, spreadsheetId, values) {
    try {
        const response = await sheets.spreadsheets.values.append({
            auth: auth,
            spreadsheetId: spreadsheetId,
            range: 'reservas',
            valueInputOption: 'RAW',   // <-- Correct parameter placement
            insertDataOption: 'INSERT_ROWS',  // <-- Correct parameter placement
            requestBody: {
                values: [values],
            }
        });
        return response.data;

    } catch (error) {
        console.error('Error adding row to sheet:', error);
    }
}

const appendToSheet = async (data) => {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: path.join(process.cwd(), 'src/credentials/', 'credentials.json'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });

        const authClient = await auth.getClient();
        const spreadsheetId = '15_gPbp4Z2rN66nSJQmUV8i0e3NMaUbPHq0pbo2xVdfc';

        await addRowToSheet(authClient, spreadsheetId, data);

        return 'Datos correctamente agregados';

    } catch (error) {
        console.error('Error appending to sheet:', error);
    }
}

export default appendToSheet;
