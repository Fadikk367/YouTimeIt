import { Router } from 'express';
import { testAuth } from '../controllers';
import { authRole } from '../middlewares/authRole';
import { Role } from '../models/common';

const router = Router();


router.get('/', authRole(Role.USER), testAuth);



export default router;