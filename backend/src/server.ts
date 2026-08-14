import 'dotenv/config';
import app from './app';
import { initDb } from './db/database';

const PORT = parseInt(process.env.PORT ?? '3001', 10);

async function start() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`TaskFlow backend running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to initialise database:', err);
    process.exit(1);
  }
}

start();
