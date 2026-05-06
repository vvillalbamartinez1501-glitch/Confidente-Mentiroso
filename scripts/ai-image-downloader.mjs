import { google } from 'googleapis';
import fetch from 'node-fetch';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

// Configuración
const DRIVE_FOLDER_ID = '1KJGPCtZgBC8gxZolBR-JqCIwNX5V0mQT';
const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

// 1. Función para obtener palabras clave inteligentes desde un prompt
// Aquí puedes integrar una llamada a una IA para "traducir" tu prompt
async function getKeywordsFromPrompt(userPrompt) {
    console.log(`Interpretando prompt: "${userPrompt}"...`);
    // Simulación: Si el prompt es "memes", devuelve términos de búsqueda efectivos
    if (userPrompt.toLowerCase().includes('meme')) return ['funny memes', 'internet culture'];
    if (userPrompt.toLowerCase().includes('icónicos')) return ['historical moments', 'cinema icons'];
    return [userPrompt];
}

// 2. Buscar imágenes en Unsplash
async function fetchImages(keywords) {
    const query = keywords.join(' ');
    const url = `https://api.unsplash.com/search/photos?query=${query}&per_page=5&client_id=${UNSPLASH_ACCESS_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.results.map(img => ({ url: img.urls.regular, name: `${img.id}.jpg` }));
}

// 3. Subir directamente a Google Drive
async function uploadToDrive(imageUrl, fileName) {
    const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT),
        scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });
    const response = await fetch(imageUrl);
    
    const fileMetadata = {
        name: fileName,
        parents: [DRIVE_FOLDER_ID],
    };

    const media = {
        mimeType: 'image/jpeg',
        body: response.body,
    };

    await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id',
    });
    console.log(`✓ Imagen ${fileName} guardada en Drive.`);
}

// Función principal ejecutable
export async function runDownloader(prompt) {
    try {
        const keywords = await getKeywordsFromPrompt(prompt);
        const images = await fetchImages(keywords);
        for (const img of images) {
            await uploadToDrive(img.url, img.name);
        }
        console.log("¡Descarga y sincronización completada!");
    } catch (error) {
        console.error("Error en el proceso:", error);
    }
}

// Ejecución manual desde terminal: node scripts/ai-image-downloader.mjs "momentos de pelicula"
if (process.argv[2]) {
    runDownloader(process.argv[2]);
}