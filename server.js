import { createServer } from 'vite';

async function startServer() {
  try {
    const server = await createServer({
      configFile: './vite.config.ts',
      root: process.cwd(),
      server: {
        port: 3000,
        host: true
      }
    });

    await server.listen();
    console.log('\n🚀 Soni Navratri Khata SaaS Server running at:');
    server.printUrls();
  } catch (e) {
    console.error('Error starting server:', e);
  }
}

startServer();
