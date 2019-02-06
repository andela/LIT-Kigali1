import app from './app';
import { logger } from './helpers';

const { PORT = 3000 } = process.env;

app.listen(PORT, () => {
  logger.info(`Listening on port: ${PORT}`);
});
