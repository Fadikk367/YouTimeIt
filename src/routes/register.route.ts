import { Router } from 'express';
import { registerController as controller } from '../controllers';

const router = Router();

router.post('/', controller.registerAdmin);

export default router;