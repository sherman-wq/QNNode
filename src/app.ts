import express from 'express';
import router from './middleware/auth/auth';
import uploadsRouter from './middleware/upload/upload';
import { verifyToken } from './middleware/verify/verify';
import summaryRouter from './middleware/summary/summary';

const cors = require('cors');

const app = express();
const PORT = 3000;

const corsOption = {
    origin: ['http://localhost:4200']
};

app.use(cors(corsOption));

app.use(express.json()); // Для парсинга JSON-запросов
app.use(router); // Используем ваш роутер как middleware
app.use('/uploads', verifyToken, uploadsRouter);
app.use(verifyToken, summaryRouter);



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});