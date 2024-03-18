// types/express/index.d.ts
import 'express';

declare module 'express' {
  export interface Request {
    user?: any; // Или используйте более конкретный тип вместо any, если у вас есть определенная структура данных пользователя
  }
}