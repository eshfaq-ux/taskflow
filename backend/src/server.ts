import 'dotenv/config';
import app from './app';
import { initDb } from './db/database';

const PORT = parseInt(process.env.PORT ?? '3001', 10);

initDb();

app.listen(PORT, () => {
  console.log(`TaskFlow backend running on http://localhost:${PORT}`);
});
