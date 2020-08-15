import { Router } from 'express';
import { registerController as controller } from '../controllers';

const router = Router();

router.post('/user', controller.registerUser);
router.post('/client', controller.registerClient);

export default router;