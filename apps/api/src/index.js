import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(here, '../.env') });
const { default: app } = await import('./server.js');
const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`Centralized Secret Vault API listening on ${port}`));
