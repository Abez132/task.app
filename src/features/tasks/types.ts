export type TaskPriority = 'low' | 'medium' | 'high';

export type Task = {
  id: string;
  title: string;
  notes: string;
  dueDate: string | null;
  priority: TaskPriority;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};
