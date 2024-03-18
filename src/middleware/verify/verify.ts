import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
require("dotenv").config();

export function verifyToken(req: Request, res: Response, next: NextFunction) {
    // Извлекаем токен из заголовка Authorization
    const bearerHeader = req.headers['authorization'];
    if (!bearerHeader) {
        return res.status(403).send('A token is required for authentication');
    }

    const token = bearerHeader.split(' ')[1]; // Получаем токен из заголовка

    try {
        // Верифицируем токен
        const decoded = jwt.verify(token, process.env.SECRET_KEY as string);
        req.user = decoded; // Сохраняем расшифрованные данные пользователя в объект запроса
    } catch (err) {
        return res.status(401).send('Invalid Token');
    }
    return next(); // Передаем управление следующему обработчику
}
