import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { config } from './config';

app.listen(config.PORT, () => {
  console.log(`🚀 API running on http://localhost:${config.PORT}`);
});