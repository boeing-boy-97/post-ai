import app from './app';
import { config } from './config';
import { logger } from './utils/logger';

const PORT = config.port || 8000;

app.listen(PORT, '0.0.0.0', () => {
  logger.info('🚀 Social Media Scheduler Backend API running at http://0.0.0.0:%d', PORT);
  logger.info('Database: SQLite / PostgreSQL via Prisma ORM');
});

// Also listen on port 4000 if different from PORT for full dual compatibility
if (PORT !== 4000) {
  try {
    app.listen(4000, '0.0.0.0', () => {
      logger.info('🚀 Secondary listener active at http://0.0.0.0:4000');
    });
  } catch (e) {
    // Port 4000 in use or optional
  }
}
