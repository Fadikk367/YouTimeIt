import { Router } from 'express';
import { registerController as controller } from '../controllers';

const router = Router();


router.post('/', controller.registerAdmin);

router.patch('/confirm/:token', controller.confirmRegistration);

export default router;