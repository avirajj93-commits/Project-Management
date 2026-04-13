import express from 'express';
import { getuserWorkspaces } from '../controllers/workspaceControllers.js';
import { addMember } from '../controllers/workspaceControllers.js';
const workspaceRouter = express.Router();
workspaceRouter.get('/', getuserWorkspaces);
workspaceRouter.post('/add-member', addMember);

export default workspaceRouter