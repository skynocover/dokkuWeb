import 'dotenv/config';
import express from 'express';
import next from 'next';

import { ssh } from './routers/ssh';

const dev = process.env.NODE_ENV !== 'production';

const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.get('/test', (req, res) => {});
  app.use('/api', ssh);

  app.get('*', (req, res) => {
    return nextHandler(req, res);
  });

  const port = process.env.PORT || 8080;
  app.listen(port, () => {
    console.log(new Date(), `🚀 Server is running at port ${port}`);
  });
});
