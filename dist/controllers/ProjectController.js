"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectController = void 0;
const Project_1 = __importDefault(require("../models/Project"));
class ProjectController {
    static createProject = async (req, res) => {
        const project = new Project_1.default(req.body);
        project.manager = req.user.id;
        console.log(req.user);
        try {
            await project.save();
            res.send('Project Created');
        }
        catch (error) {
            console.log(error);
        }
    };
    static getAllProjects = async (req, res) => {
        try {
            const projects = await Project_1.default.find({
                $or: [
                    { manager: { $in: req.user.id } },
                    { team: { $in: req.user.id } },
                ],
            });
            res.json(projects);
        }
        catch (error) {
            console.log(error);
        }
    };
    static getProjectById = async (req, res) => {
        const { id } = req.params;
        try {
            const project = await Project_1.default.findById(id).populate('tasks');
            if (!project) {
                const error = new Error('Cannot find the project');
                res.status(404).json({ error: error.message });
                return;
            }
            if (project.manager.toString() !== req.user.id.toString() &&
                !project.team.includes(req.user.id)) {
                const error = new Error('User is not valid to do this action');
                res.status(401).json({ error: error.message });
                return;
            }
            res.json(project); // Enviar la respuesta pero no devolverla
        }
        catch (error) {
            console.log(error);
        }
    };
    static updateProject = async (req, res) => {
        try {
            req.project.clientName = req.body.clientName;
            req.project.projectName = req.body.projectName;
            req.project.description = req.body.description;
            await req.project.save();
            res.send('Project Updated');
        }
        catch (error) {
            console.log(error);
        }
    };
    static deleteProject = async (req, res) => {
        try {
            await req.project.deleteOne();
            res.send('Project Removed');
        }
        catch (error) {
            console.log(error);
        }
    };
}
exports.ProjectController = ProjectController;
//# sourceMappingURL=ProjectController.js.map