import type { Request, Response } from 'express';
import Note, { INote } from '../models/Note';
import { Types } from 'mongoose';

type NoteParams = {
  noteId: Types.ObjectId;
};
export class NoteController {
  static createNote = async (req: Request<{}, {}, INote>, res: Response) => {
    const { content } = req.body;
    const note = new Note();

    console.log(note);
    note.content = content;
    note.createdBy = req.user.id;
    note.task = req.task.id;

    req.task.notes.push(note.id);

    try {
      await Promise.allSettled([note.save(), req.task.save()]);
      res.send('Note Created successfully');
    } catch (error) {
      res.status(500).json({ error: 'Ups! Something went wrong' });
    }
  };
  static getTaskNotes = async (req: Request, res: Response) => {
    try {
      const notes = await Note.find({ task: req.task.id });
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: 'Ups! Something went wrong' });
    }
  };

  static deleteNote = async (req: Request<NoteParams>, res: Response) => {
    const { noteId } = req.params;

    const note = await Note.findById(noteId);

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

    req.task.notes = req.task.notes.filter(
      (note) => note.toString() !== noteId.toString()
    );

    try {
      await Promise.allSettled([note.deleteOne(), req.task.save()]);
      res.send('Note deleted successfully');
    } catch (error) {
      res.status(500).json({ error: 'Ups! Something went wrong' });
    }
  };
}
