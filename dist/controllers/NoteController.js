"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoteController = void 0;
const Note_1 = __importDefault(require("../models/Note"));
class NoteController {
    static createNote = async (req, res) => {
        const { content } = req.body;
        const note = new Note_1.default();
        console.log(note);
        note.content = content;
        note.createdBy = req.user.id;
        note.task = req.task.id;
        req.task.notes.push(note.id);
        try {
            await Promise.allSettled([note.save(), req.task.save()]);
            res.send('Note Created successfully');
        }
        catch (error) {
            res.status(500).json({ error: 'Ups! Something went wrong' });
        }
    };
    static getTaskNotes = async (req, res) => {
        try {
            const notes = await Note_1.default.find({ task: req.task.id });
            res.json(notes);
        }
        catch (error) {
            res.status(500).json({ error: 'Ups! Something went wrong' });
        }
    };
    static deleteNote = async (req, res) => {
        const { noteId } = req.params;
        const note = await Note_1.default.findById(noteId);
        if (!note) {
            const error = new Error('Cannot find the note');
            res.status(404).json({ error: error.message });
            return;
        }
        if (note.createdBy.toString() !== req.user.id.toString()) {
            const error = new Error('Action not authorized for this user');
            res.status(401).json({ error: error.message });
            return;
        }
        req.task.notes = req.task.notes.filter((note) => note.toString() !== noteId.toString());
        try {
            await Promise.allSettled([note.deleteOne(), req.task.save()]);
            res.send('Note deleted successfully');
        }
        catch (error) {
            res.status(500).json({ error: 'Ups! Something went wrong' });
        }
    };
}
exports.NoteController = NoteController;
//# sourceMappingURL=NoteController.js.map