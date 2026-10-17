import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { createTask, deleteTask, editTask, setTaskCompleted } from './actions';
import { loadTasks } from './storage';
import type { Task, TaskDraft, TaskUpdate } from './types';

type TaskContextValue = {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  reloadTasks: () => Promise<void>;
  addTask: (draft: TaskDraft) => Promise<Task>;
  updateTask: (id: string, changes: TaskUpdate) => Promise<Task>;
  changeTaskCompletion: (id: string, completed: boolean) => Promise<Task>;
  removeTask: (id: string) => Promise<void>;
};

const TaskContext = createContext<TaskContextValue | null>(null);

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

export function TaskProvider({ children }: PropsWithChildren) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reloadTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const savedTasks = await loadTasks();
      setTasks(savedTasks);
    } catch (loadError) {
      setError(errorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadTasks();
  }, [reloadTasks]);

  const addTask = useCallback(async (draft: TaskDraft): Promise<Task> => {
    setError(null);
    try {
      const task = await createTask(draft);
      setTasks((currentTasks) => [task, ...currentTasks]);
      return task;
    } catch (actionError) {
      setError(errorMessage(actionError));
      throw actionError;
    }
  }, []);

  const updateTask = useCallback(
    async (id: string, changes: TaskUpdate): Promise<Task> => {
      setError(null);
      try {
        const updatedTask = await editTask(id, changes);
        setTasks((currentTasks) =>
          currentTasks.map((task) => (task.id === id ? updatedTask : task))
        );
        return updatedTask;
      } catch (actionError) {
        setError(errorMessage(actionError));
        throw actionError;
      }
    },
    []
  );

  const changeTaskCompletion = useCallback(
    async (id: string, completed: boolean): Promise<Task> => {
      setError(null);
      try {
        const updatedTask = await setTaskCompleted(id, completed);
        setTasks((currentTasks) =>
          currentTasks.map((task) => (task.id === id ? updatedTask : task))
        );
        return updatedTask;
      } catch (actionError) {
        setError(errorMessage(actionError));
        throw actionError;
      }
    },
    []
  );

  const removeTask = useCallback(async (id: string): Promise<void> => {
    setError(null);
    try {
      await deleteTask(id);
      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id));
    } catch (actionError) {
      setError(errorMessage(actionError));
      throw actionError;
    }
  }, []);

  const value = useMemo(
    () => ({
      tasks,
      isLoading,
      error,
      reloadTasks,
      addTask,
      updateTask,
      changeTaskCompletion,
      removeTask,
    }),
    [
      tasks,
      isLoading,
      error,
      reloadTasks,
      addTask,
      updateTask,
      changeTaskCompletion,
      removeTask,
    ]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks(): TaskContextValue {
  const context = useContext(TaskContext);
  if (context === null) {
    throw new Error('useTasks must be used within a TaskProvider.');
  }

  return context;
}
