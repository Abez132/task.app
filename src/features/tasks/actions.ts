import { loadTasks, saveTasks } from './storage';
import type { Task, TaskDraft, TaskUpdate } from './types';

type TaskListUpdate<T> = (tasks: Task[]) => { tasks: Task[]; result: T };

let writeQueue: Promise<void> = Promise.resolve();

function updateStoredTasks<T>(update: TaskListUpdate<T>): Promise<T> {
  const operation = writeQueue.then(async () => {
    const tasks = await loadTasks();
    const { tasks: updatedTasks, result } = update(tasks);
    await saveTasks(updatedTasks);
    return result;
  });

  writeQueue = operation.then(
    () => undefined,
    () => undefined
  );

  return operation;
}

function cleanTitle(title: string): string {
  const cleanedTitle = title.trim();

  if (!cleanedTitle) {
    throw new Error('A task title is required.');
  }

  return cleanedTitle;
}

function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createTask(draft: TaskDraft): Promise<Task> {
  const now = new Date().toISOString();
  const task: Task = {
    id: createId(),
    title: cleanTitle(draft.title),
    notes: draft.notes?.trim() ?? '',
    dueDate: draft.dueDate ?? null,
    priority: draft.priority,
    completed: false,
    createdAt: now,
    updatedAt: now,
  };

  return updateStoredTasks((tasks) => ({ tasks: [task, ...tasks], result: task }));
}

export function editTask(id: string, changes: TaskUpdate): Promise<Task> {
  return updateStoredTasks((tasks) => {
    const taskIndex = tasks.findIndex((task) => task.id === id);
    if (taskIndex === -1) {
      throw new Error('Task not found.');
    }

    const currentTask = tasks[taskIndex];
    const updatedTask: Task = {
      ...currentTask,
      title: changes.title === undefined ? currentTask.title : cleanTitle(changes.title),
      notes: changes.notes === undefined ? currentTask.notes : changes.notes.trim(),
      dueDate: changes.dueDate === undefined ? currentTask.dueDate : changes.dueDate,
      priority: changes.priority === undefined ? currentTask.priority : changes.priority,
      updatedAt: new Date().toISOString(),
    };
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex] = updatedTask;

    return { tasks: updatedTasks, result: updatedTask };
  });
}

export function setTaskCompleted(id: string, completed: boolean): Promise<Task> {
  return updateStoredTasks((tasks) => {
    const taskIndex = tasks.findIndex((task) => task.id === id);
    if (taskIndex === -1) {
      throw new Error('Task not found.');
    }

    const updatedTask: Task = {
      ...tasks[taskIndex],
      completed,
      updatedAt: new Date().toISOString(),
    };
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex] = updatedTask;

    return { tasks: updatedTasks, result: updatedTask };
  });
}

export function deleteTask(id: string): Promise<void> {
  return updateStoredTasks((tasks) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    if (updatedTasks.length === tasks.length) {
      throw new Error('Task not found.');
    }

    return { tasks: updatedTasks, result: undefined };
  });
}
