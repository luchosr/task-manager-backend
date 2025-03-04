import { Request, Response } from 'express';
import User from '../models/User';
import Project from '../models/Project';

export class TeamMemberController {
  static findMemberByEmail = async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await User.findOne({ email }).select('_id name email');

    if (!user) {
      const error = new Error('User not found');
      res.status(404).json({ error: error.message });
      return;
    }

    res.json(user);
  };

  static getProjectTeam = async (req: Request, res: Response) => {
    const project = await Project.findById(req.project.id).populate({
      path: 'team',
      select: 'id email name',
    });
    res.json(project.team);
  };

  static addMemberById = async (req: Request, res: Response) => {
    const { id } = req.body;

    const user = await User.findById(id).select('id ');

    if (!user) {
      const error = new Error('User not found');
      res.status(404).json({ error: error.message });
      return;
    }

    if (req.project.team.includes(user.id)) {
      const error = new Error('User already in the team');
      res.status(409).json({ error: error.message });
      return;
    }

    req.project.team.push(user.id);
    await req.project.save();

    res.send('Member added successfully');
  };

  static removeMemberById = async (req: Request, res: Response) => {
    const { userId } = req.params;

    if (!req.project.team.some((team) => team.toString() === userId)) {
      const error = new Error('User does not exist in the team');
      res.status(409).json({ error: error.message });
      return;
    }

    req.project.team = req.project.team.filter(
      (teamMember) => teamMember.toString() !== userId
    );
    await req.project.save();

    res.send('Member removed successfully');
  };
}
