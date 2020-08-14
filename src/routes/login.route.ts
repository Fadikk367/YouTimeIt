import { Router } from 'express';
import { loginController as controller } from '../controllers';

const router = Router();

router.get('/', controller.login);

export default router;