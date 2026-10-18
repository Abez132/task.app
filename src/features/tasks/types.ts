export type TaskPriority = 'low' | 'medium' | 'high';

export type Task = {
  id: string;
  title: string;
  notes: string;
  dueDate: string | null;
  priority: TaskPriority;
  completed: boolean;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TaskDraft = Pick<Task, 'title' | 'priority'> &
  Partial<Pick<Task, 'notes' | 'dueDate'>>;

export type TaskUpdate = Partial<Pick<Task, 'title' | 'notes' | 'dueDate' | 'priority'>>;
