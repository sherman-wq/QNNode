import { Router } from "express";
import multer from "multer";
import fs from 'fs';
import schedule from 'node-schedule';
import path from 'path';
import { Request } from 'express';




const uploadsRouter = Router();

type Session = {
  files: string[];
  createdAt: Date;
};

const sessions = new Map<string, Session>();

const storage = multer.diskStorage({
  // ...

    destination: function (req, file, cb) {
      const fingerprint = req.user.fingerprint;
      const dirPath = path.join('./', 'uploads', fingerprint);

      fs.mkdir(dirPath, { recursive: true }, (err) => {
        if (err) {
          return cb(err, dirPath);
        }
        if(!sessions.has(fingerprint)) {
          sessions.set(fingerprint, { files: [], createdAt: new Date() });
        }
        cb(null, dirPath);
      });
    },
  filename: function (req, file, cb) {
    const fingerprint = req.user.fingerprint;
    const sessionData = sessions.get(fingerprint);
    const fileName = Date.now() + '-' + file.originalname;
    sessionData?.files.push(fileName);
    cb(null, fileName);
  }
});

const upload = multer({ storage });

// Маршрут для загрузки файла
uploadsRouter.post('/file', upload.single('file'), (req, res) => {
  if (req.file) {
    res.json({
      message: 'Файл успешно загружен',
      fileInfo: {
        originalName: req.file.originalname,
        storageName: req.file.filename,
        size: req.file.size
      }
    });
  } else {
    res.status(400).send('Ошибка загрузки файла');
  }
});

// Маршрут для загрузки нескольких файлов
uploadsRouter.post('/files', upload.array('files'), (req, res) => {
  if (Array.isArray(req.files)) {
    const filesInfo = req.files.map(file => ({
      originalName: file.originalname,
      storageName: file.filename,
      size: file.size
    }));
    res.json({
      message: `${req.files.length} файл(ов) успешно загружено`,
      filesInfo
    });
  } else {
    res.status(400).send('Ошибка загрузки файлов');
  }
});

// Рута для загрузки данных о файлах
uploadsRouter.get('/getfiles', async (req: Request<{ user: { fingerprint: string } }>, res) => {

  const userFingerprint = req.user.fingerprint;

  const folderPath = path.join('./', 'uploads', userFingerprint);

  const filesData = await getFolderInfo(folderPath);

  if (filesData && filesData instanceof Array) {
    res.json(filesData);
  } else {
    res.status(404).send('Ошибка получения данных о файлах');
    console.log(filesData.error);
  }
});

// Планировщик для удаления файлов и сессий
schedule.scheduleJob('0 0 * * *', () => {
  const now = new Date().getTime();
  for (const [fingerprint, sessionData] of sessions.entries()) {
    if (now - sessionData.createdAt.getTime() > 24*60*60*1000) {
      const path = `uploads/${fingerprint}`;
      fs.rmdir(path, { recursive: true }, (err) => {
        if (err) throw err;
        sessions.delete(fingerprint);
        console.log(`Session and files for ${fingerprint} were removed.`);
      });
    }
  }
});

async function getFolderInfo(folderPath: string) {
  try {
      // Проверяем, существует ли папка
      const stat = await fs.statSync(folderPath);

      if (!stat.isDirectory()) {
          throw new Error('Указанный путь не является папкой');
      }

      // Читаем содержимое папки
      const files = await fs.readdirSync(folderPath);

      const filesInfo = await Promise.all(files.map(async (file) => {
          const filePath = path.join(folderPath, file);
          const fileStat = await fs.statSync(filePath);
          
          return {
              name: file,
              size: fileStat.size // размер в байтах
          };
      }));

      return filesInfo;
  } catch (err: any) {
      // В случае ошибки (если папка не существует или другая ошибка файловой системы)
      return { error: err.message };
  }
}

export default uploadsRouter;