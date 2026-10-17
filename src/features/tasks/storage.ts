import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Task } from './types';

const TASKS_STORAGE_KEY = '@task-manager/tasks-v1';

/** Load the saved task list. An invalid saved value is surfaced to the caller. */
export async function loadTasks(): Promise<Task[]> {
  const storedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);

  if (storedTasks === null) {
    return [];
  }

  const parsedTasks: unknown = JSON.parse(storedTasks);

  if (!Array.isArray(parsedTasks)) {
    throw new Error('Saved tasks have an invalid format.');
  }

  return parsedTasks as Task[];
}

/** Replace the saved task list with the latest in-memory list. */
export async function saveTasks(tasks: Task[]): Promise<void> {
  await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
}
