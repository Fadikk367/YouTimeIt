import { Router, Request } from 'express';
import { servicesController as controller } from '../controllers';
import { authUser } from '../middlewares/authUser';
import { authRole } from '../middlewares/authRole';
import { Role } from '../models/common';

const router = Router();

router.get('/', controller.getAllServices);
router.get('/:serviceId', controller.getSingleService);
router.post('/', authRole(Role.USER), controller.createService);
router.put('/:serviceId', authRole(Role.USER), controller.updateService);
router.delete('/:serviceId', authRole(Role.USER), controller.deleteService);

export default router;