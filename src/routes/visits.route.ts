import { Router } from 'express';
import { visitsController as controller } from '../controllers';
import { authRole } from '../middlewares/authRole';
import { authUser } from '../middlewares/authUser';
import { Role } from '../models/common';

const router = Router();

// router.get('/', authUser, controller.getAllVisits);
router.get('/:visitId', authUser, authRole(Role.CLIENT, Role.ADMIN) ,controller.getVisitById);
router.post('/', authUser, authRole(Role.ADMIN), controller.createVisit);
// router.put('/:visitId', authUser, authRole(Role.USER), controller.updateVisit);
// router.delete('/:visitId', authUser, authRole(Role.USER), controller.deleteVisit);
// router.put('/:visitId/reserve', authUser, authRole(Role.GUEST, Role.CLIENT), controller.reserveVisit);
// router.put('/:visitId/cancel', authUser, authRole(Role.CLIENT), controller.cancelVisit);
// router.get('/confirm/:token', controller.confirmVisit);

export default router;