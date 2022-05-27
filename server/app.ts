import express from 'express';
import { Config } from './utils/config';
import apiRoutes from './api/apiRoutes';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api', apiRoutes);

app.listen(Config.port, () => console.log(`Server listening on port ${Config.port}`));

export default app;