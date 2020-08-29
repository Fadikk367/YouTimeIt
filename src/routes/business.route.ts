import { Router } from 'express';
import { businessController as controller } from '../controllers';
import { authUser, authRole } from '../middlewares';
import { Role } from '../models/common';


const router = Router({ mergeParams: true });


router.post('/:businessId/register/client', controller.registerClient);

router.get('/:businessId/visits', controller.getVisits);

router.get('/:businessId/services', controller.getServices);


export default router;