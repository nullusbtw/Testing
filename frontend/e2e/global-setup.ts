import { FullConfig } from '@playwright/test';


async function globalSetup(config: FullConfig<any, any>) {
  const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:5173';
    if (!baseURL) throw new Error('baseURL не определён');

  console.log(`Проверка сервера: ${baseURL}`);
  
  let retries = 30;
  while (retries > 0) {
    try {
      const response = await fetch(`${baseURL}/api/health`);
      if (response.ok) {
        console.log('Сервер готов');
        return;
      }
    } catch {}
    
    retries--;
    await new Promise(r => setTimeout(r, 2000));
  }
  
  throw new Error(`Не удалось подключиться к ${baseURL}`);
}

export default globalSetup;
