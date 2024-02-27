import express, { Request, Response } from 'express';
import router from './auth';
import bodyParser from 'body-parser';
const cors = require('cors');

const app = express();
const PORT = 3000;

const corsOption = {
    origin: ['http://localhost:3000'],
};

app.use(bodyParser.json());
app.use(cors(corsOption));
app.use(express.json()); // Для парсинга JSON-запросов
app.use(router); // Используем ваш роутер как middleware



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});