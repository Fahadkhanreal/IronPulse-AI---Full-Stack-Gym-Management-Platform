import api from '@/lib/api';

export interface Trainer {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  image: string;
  bio?: string;
}

interface TrainersResponse {
  success: boolean;
  message: string;
  data: Trainer[];
}

interface TrainerResponse {
  success: boolean;
  message: string;
  data: Trainer;
}

export interface CreateTrainerInput {
  name: string;
  specialization: string;
  experience: number;
  image: string;
  bio?: string;
}

export interface UpdateTrainerInput {
  name?: string;
  specialization?: string;
  experience?: number;
  image?: string;
  bio?: string;
}

export const trainerService = {
  // Get all trainers (public)
  async getAllTrainers(): Promise<TrainersResponse> {
    return await api.get('/trainers');
  },

  // Get single trainer (public)
  async getTrainerById(id: string): Promise<TrainerResponse> {
    return await api.get(`/trainers/${id}`);
  },

  // Create trainer (admin only)
  async createTrainer(data: CreateTrainerInput): Promise<TrainerResponse> {
    return await api.post('/trainers', data);
  },

  // Update trainer (admin only)
  async updateTrainer(id: string, data: UpdateTrainerInput): Promise<TrainerResponse> {
    return await api.put(`/trainers/${id}`, data);
  },

  // Delete trainer (admin only)
  async deleteTrainer(id: string): Promise<TrainerResponse> {
    return await api.delete(`/trainers/${id}`);
  },
};
