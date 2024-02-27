import { Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();
const SECRET_KEY = 'secret_key'; // Используйте безопасный ключ в производственной среде

const users = new Map(); // Для демонстрации используем Map

// Эндпоинт главной страницы, который также выполняет аутентификацию
router.post('/authenticate', (req: Request, res: Response) => {
    // Предполагается, что отпечаток передается через параметры запроса или куки
    const fingerprint = req.body.fingerprint;

    if (!fingerprint) {
        return res.status(400).send('Fingerprint is required');
    }

    let userData = users.get(fingerprint);

    if (!userData) {
        // Первая аутентификация пользователя
        userData = {
          isAuthorized: false,
        };
        users.set(fingerprint, userData);
    }

    const token = jwt.sign({ fingerprint }, SECRET_KEY, { expiresIn: '24h' });
    res.json({ token });

    //res.status(403).send('Please authorize to continue using the service');
    
  });

  router.post('/authorize', (req: Request, res: Response) => {
    const { fingerprint, username } = req.body; // Получаем fingerprint и данные пользователя
  
    const userData = users.get(fingerprint);
    if (userData && username) {
      userData.isAuthorized = true;
      users.set(fingerprint, userData);
      res.send('User is now authorized');
    } else {
      res.status(400).send('Invalid fingerprint or username');
    }
  });

export default router;
