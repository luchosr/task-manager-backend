import { Router } from 'express';
import { body, param } from 'express-validator';
import { TaskController } from '../controllers/TaskController';
import { ProjectController } from '../controllers/ProjectController';
import { authenticate } from '../middleware/auth';
import { projectExists } from '../middleware/project';
import { handleInputErrors } from '../middleware/validation';
import {
  hasAuthorization,
  taskBelongsToProject,
  taskExists,
} from '../middleware/task';
import { TeamMemberController } from '../controllers/TeamController';
import { NoteController } from '../controllers/NoteController';

const router = Router();
router.use(authenticate);
router.post(
  '/',
  body('projectName').not().isEmpty().withMessage('Project name is required'),
  body('clientName').not().isEmpty().withMessage('Client name is required'),
  body('description').not().isEmpty().withMessage('Description is required'),
  handleInputErrors,
  ProjectController.createProject
);
router.get('/', ProjectController.getAllProjects);

router.get(
  '/:id',
  param('id').isMongoId().withMessage(' ID is not valid'),
  handleInputErrors,
  ProjectController.getProjectById
);

// Routes for Tasks
router.param('projectId', projectExists);

router.put(
  '/:projectId',
  param('projectId').isMongoId().withMessage(' ID is not valid'),
  body('projectName').not().isEmpty().withMessage('Project name is required'),
  body('clientName').not().isEmpty().withMessage('Client name is required'),
  body('description').not().isEmpty().withMessage('Description is required'),
  handleInputErrors,
  hasAuthorization,
  ProjectController.updateProject
);

router.delete(
  '/:projectId',
  param('projectId').isMongoId().withMessage(' ID is not valid'),
  handleInputErrors,
  hasAuthorization,
  ProjectController.deleteProject
);

router.post(
  '/:projectId/tasks',
  hasAuthorization,
  body('name').not().isEmpty().withMessage('Task name is required'),
  body('description').not().isEmpty().withMessage('Description is required'),
  TaskController.createTask
);

router.get('/:projectId/tasks', TaskController.getProjectTasks);

router.param('taskId', taskExists);
router.param('taskId', taskBelongsToProject);

router.get(
  '/:projectId/tasks/:taskId',
  param('taskId').isMongoId().withMessage('Task ID is not valid'),
  handleInputErrors,
  TaskController.getTaskById
);

router.put(
  '/:projectId/tasks/:taskId',
  hasAuthorization,
  param('taskId').isMongoId().withMessage('Task ID is not valid'),
  body('name').not().isEmpty().withMessage('Task name is required'),
  body('description').not().isEmpty().withMessage('Description is required'),
  handleInputErrors,
  TaskController.updateTask
);

router.delete(
  '/:projectId/tasks/:taskId',
  hasAuthorization,
  param('taskId').isMongoId().withMessage('Task ID is not valid'),
  handleInputErrors,
  TaskController.deleteTask
);

router.post(
  '/:projectId/tasks/:taskId/status',
  param('taskId').isMongoId().withMessage('Task ID is not valid'),
  body('status').not().isEmpty().withMessage('Status is required'),
  handleInputErrors,
  TaskController.updateTaskStatus
);

router.post(
  '/:projectId/team/find',
  body('email').isEmail().toLowerCase().withMessage('Email is not valid'),
  handleInputErrors,
  TeamMemberController.findMemberByEmail
);

router.get('/:projectId/team/', TeamMemberController.getProjectTeam);

router.post(
  '/:projectId/team/',
  body('id').isMongoId().withMessage('ID is not valid'),
  handleInputErrors,
  TeamMemberController.addMemberById
);

router.delete(
  '/:projectId/team/:userId',
  param('userId').isMongoId().withMessage('ID is not valid'),
  handleInputErrors,
  TeamMemberController.removeMemberById
);

router.post(
  '/:projectId/tasks/:taskId/notes',
  body('content').notEmpty().withMessage('Content is required'),
  handleInputErrors,
  NoteController.createNote
);

router.get('/:projectId/tasks/:taskId/notes', NoteController.getTaskNotes);

router.delete(
  '/:projectId/tasks/:taskId/notes/:noteId',
  param('noteId').isMongoId().withMessage('ID is not valid'),
  handleInputErrors,
  NoteController.deleteNote
);

export default router;
