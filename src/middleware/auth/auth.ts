import { Request, Response, Router } from 'express';
import { sha256 } from 'js-sha256';

require("dotenv").config();

import jwt from 'jsonwebtoken';
const crypto = require('crypto');

const router = Router();
const users = new Map(); 

// Эндпоинт главной страницы, который также выполняет аутентификацию
router.post('/authenticate', (req: Request, res: Response) => {
    // Предполагается, что отпечаток передается через параметры запроса или куки
    const fingerprint = req.body.fingerprint;
    const signature = req.body.signature;

    if (!fingerprint) return res.status(400).send('Fingerprint is required');
    if (!signature) return res.status(400).send('Signature is required');

    //logging authentification
    console.log("Logging authentification: fingerprint: " + fingerprint);

    if(!calculateSignature(fingerprint, signature)) {
      return res.status(400).send('Invalid signature');
    }

    let userData = users.get(fingerprint);

    if (!userData) {
        // Первая аутентификация пользователя
        userData = {
          isAuthorized: false,
        };
        users.set(fingerprint, userData);
    }

    const token = jwt.sign({ fingerprint }, process.env.SECRET_KEY as string, { expiresIn: '24h' });
    res.json({ token });
    
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

  // Маршрут для проверки токена
  router.post('/verify-token', (req, res) => {
    const { token } = req.body;
    if (!token) {
      return res.status(403).json({ message: 'A token is required for authentication' });
    }

    jwt.verify(token, process.env.SECRET_KEY as string, (err: any, decoded: any) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid Token', error: err.message });
      }

      // Токен действителен
      return res.json({ isValid: true });
    });
  });

  
  function calculateSignature(fingerprint: string, signature: string ): boolean {
    const hash = sha256(fingerprint + process.env.CLIENT_KEY as string);
    return hash === signature;
  }

export default router;
