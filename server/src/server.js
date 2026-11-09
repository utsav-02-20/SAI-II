import app from './app.js';
import { env } from './config/env.js';

const PORT = env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[Express API] Running on http://localhost:${PORT}`);
  console.log(`[Express API] Health check at http://localhost:${PORT}/api/health`);
});
