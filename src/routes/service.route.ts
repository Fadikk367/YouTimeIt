import { Router, Request } from 'express';
import { servicesController as controller } from '../controllers';
import { authRole, authUser } from '../middlewares';
import { Role } from '../models/common';

const router = Router();

router.get('/:serviceId', controller.getServiceById);
router.post('/', authRole(Role.ADMIN), controller.createService);
router.put('/:serviceId', authRole(Role.ADMIN), controller.updateService);
router.delete('/:serviceId', authRole(Role.ADMIN), controller.deleteService);

export default router;