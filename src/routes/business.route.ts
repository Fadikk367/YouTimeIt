import { Router } from 'express';
import { businessController as controller } from '../controllers';

const router = Router();

router.post('/:businessId/register/client', controller.registerClient);


export default router;