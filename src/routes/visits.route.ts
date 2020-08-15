import { Router } from 'express';
import { visitsController as controller } from '../controllers';
import { authRole } from '../middlewares/authRole';
import { Role } from '../models/common';

const router = Router();

router.get('/', controller.getAllVisits);
router.get('/:visitId', controller.getSingleVisit);
router.post('/', authRole(Role.USER), controller.createVisit);
router.put('/:visitId', authRole(Role.USER), controller.updateVisit);
router.delete('/:visitId', authRole(Role.USER), controller.deleteVisit);

export default router;