import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const PARENT_FOLDER_ID = '1KJGPCtZgBC8gxZolBR-JqCIwNX5V0mQT';
const OUTPUT_DIR = './lib/constants';
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'drive-catalog.json');

async function syncDrive() {
  console.log('🚀 Iniciando sincronización con Google Drive...');
  
  // Auth using Service Account from Environment Variable
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });

  const drive = google.drive({ version: 'v3', auth });

  try {
    // 1. List Subfolders (Categories)
    const folderRes = await drive.files.list({
      q: `'${PARENT_FOLDER_ID}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name)',
    });

    const folders = folderRes.data.files || [];
    const catalog = {};

    for (const folder of folders) {
      console.log(`📁 Procesando categoría: ${folder.name}...`);
      
      // 2. List Images in each subfolder
      const fileRes = await drive.files.list({
        q: `'${folder.id}' in parents and mimeType contains 'image/' and trashed = false`,
        fields: 'files(id, name, webContentLink)',
        pageSize: 1000,
      });

      const files = fileRes.data.files || [];
      
      catalog[folder.name] = files.map(file => ({
        id: file.id,
        name: file.name,
        // Direct link format for Drive images
        url: `https://docs.google.com/uc?export=download&id=${file.id}`
      }));
    }

    // Ensure directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Save JSON
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(catalog, null, 2));
    console.log(`✅ Catálogo generado con éxito en: ${OUTPUT_FILE}`);
    console.log(`📊 Resumen: ${Object.keys(catalog).length} categorías sincronizadas.`);

  } catch (error) {
    console.error('❌ Error durante la sincronización:', error);
    process.exit(1);
  }
}

syncDrive();
