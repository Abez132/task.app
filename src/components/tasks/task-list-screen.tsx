import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTasks } from '@/features/tasks/task-provider';
import type { Task } from '@/features/tasks/types';

import { TaskEditorModal } from './task-editor-modal';

type TaskListScreenProps = {
  showCompleted?: boolean;
};

export function TaskListScreen({ showCompleted = false }: TaskListScreenProps) {
  const insets = useSafeAreaInsets();
  const { tasks, isLoading, error, reloadTasks, changeTaskCompletion } = useTasks();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const visibleTasks = useMemo(
    () => tasks.filter((task) => task.completed === showCompleted),
    [tasks, showCompleted]
  );
  const remainingCount = tasks.filter((task) => !task.completed).length;

  function openNewTask() {
    setEditingTask(null);
    setIsEditorOpen(true);
  }

  function openTask(task: Task) {
    setEditingTask(task);
    setIsEditorOpen(true);
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <FlatList
        data={visibleTasks}
        keyExtractor={(task) => task.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 104 }]}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.eyebrow}>{showCompleted ? 'YOUR PROGRESS' : 'TASK MANAGER'}</Text>
            <View style={styles.headingRow}>
              <View style={styles.headingCopy}>
                <Text style={styles.title}>{showCompleted ? 'Completed' : 'My tasks'}</Text>
                <Text style={styles.subtitle}>
                  {showCompleted
                    ? `${visibleTasks.length} task${visibleTasks.length === 1 ? '' : 's'} finished`
                    : remainingCount === 0
                      ? 'A clear list is a good place to start.'
                      : `${remainingCount} task${remainingCount === 1 ? '' : 's'} to focus on`}
                </Text>
              </View>
              {!showCompleted && remainingCount > 0 && (
                <Pressable
                  onPress={openNewTask}
                  disabled={isLoading}
                  accessibilityRole="button"
                  accessibilityLabel="Add a task"
                  style={({ pressed }) => [
                    styles.addButton,
                    isLoading && styles.disabledAction,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.addButtonText}>＋</Text>
                </Pressable>
              )}
            </View>

            {!showCompleted && (
              <View style={styles.summaryCard}>
                <View style={styles.summaryMark} />
                <View style={styles.summaryCopy}>
                  <Text style={styles.summaryTitle}>Make today count</Text>
                  <Text style={styles.summaryText}>
                    {tasks.length === 0
                      ? 'Add your first task and build momentum.'
                      : `${tasks.length - remainingCount} completed · ${remainingCount} remaining`}
                  </Text>
                </View>
              </View>
            )}

            {error && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
                <Pressable
                  onPress={() => void reloadTasks()}
                  accessibilityRole="button"
                  style={styles.retryButton}
                >
                  <Text style={styles.retryText}>Retry</Text>
                </Pressable>
              </View>
            )}

            <Text style={styles.sectionTitle}>{showCompleted ? 'Finished tasks' : 'Your list'}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TaskRow
            task={item}
            onOpen={() => openTask(item)}
            onToggle={() => void changeTaskCompletion(item.id, !item.completed).catch(() => undefined)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator color="#5146A5" />
              <Text style={styles.emptyTitle}>Loading tasks</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              {showCompleted ? (
                <View style={styles.emptyIcon}>
                  <Text style={styles.emptyIconText}>✓</Text>
                </View>
              ) : (
                <Pressable
                  onPress={openNewTask}
                  disabled={isLoading}
                  accessibilityRole="button"
                  accessibilityLabel="Add your first task"
                  style={({ pressed }) => [styles.emptyIcon, pressed && styles.pressed]}
                >
                  <Text style={styles.emptyIconText}>＋</Text>
                </Pressable>
              )}
              <Text style={styles.emptyTitle}>
                {showCompleted ? 'No completed tasks yet' : 'Nothing on your list yet'}
              </Text>
              <Text style={styles.emptyText}>
                {showCompleted
                  ? 'Finished tasks will appear here.'
                  : 'Add a task to get started. You can keep it simple and add details later.'}
              </Text>
            </View>
          )
        }
      />

      <TaskEditorModal
        visible={isEditorOpen}
        task={editingTask}
        onClose={() => setIsEditorOpen(false)}
      />
    </SafeAreaView>
  );
}

function TaskRow({
  task,
  onOpen,
  onToggle,
}: {
  task: Task;
  onOpen: () => void;
  onToggle: () => void;
}) {
  return (
    <View style={styles.taskCard}>
      <Pressable
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityLabel={`${task.completed ? 'Reopen' : 'Complete'} ${task.title}`}
        accessibilityState={{ checked: task.completed }}
        style={({ pressed }) => [styles.checkbox, task.completed && styles.checkboxChecked, pressed && styles.pressed]}
      >
        {task.completed && <Text style={styles.checkmark}>✓</Text>}
      </Pressable>
      <Pressable
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={`Edit task: ${task.title}`}
        style={({ pressed }) => [styles.taskDetails, pressed && styles.pressed]}
      >
        <Text numberOfLines={2} style={[styles.taskTitle, task.completed && styles.taskTitleDone]}>
          {task.title}
        </Text>
        {!!task.notes && <Text numberOfLines={2} style={styles.taskNotes}>{task.notes}</Text>}
        <View style={styles.taskMeta}>
        <Text
          style={[
            styles.priority,
            task.priority === 'low'
              ? styles.priority_low
              : task.priority === 'high'
                ? styles.priority_high
                : styles.priority_medium,
          ]}
        >
          {task.priority}
        </Text>
          {!!task.dueDate && <Text style={styles.dueDate}>Due {task.dueDate}</Text>}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F7FB' },
  listContent: { width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: 22 },
  header: { paddingTop: 14 },
  eyebrow: { color: '#716BA0', fontSize: 12, fontWeight: '800', letterSpacing: 1.6 },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 10 },
  headingCopy: { flex: 1 },
  title: { color: '#1B1B2A', fontSize: 32, lineHeight: 39, fontWeight: '800' },
  subtitle: { color: '#737588', fontSize: 15, lineHeight: 21, marginTop: 4 },
  addButton: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#29246C',
  },
  addButtonText: { color: '#FFFFFF', fontSize: 28, lineHeight: 32, fontWeight: '400' },
  summaryCard: {
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    marginTop: 24,
    marginBottom: 28,
    borderRadius: 22,
    backgroundColor: '#EAE9F8',
  },
  summaryMark: { width: 8, height: 48, borderRadius: 4, backgroundColor: '#5146A5' },
  summaryCopy: { flex: 1 },
  summaryTitle: { color: '#28244E', fontSize: 16, fontWeight: '700' },
  summaryText: { color: '#666483', fontSize: 13, lineHeight: 18, marginTop: 4 },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    marginTop: 18,
    borderRadius: 14,
    backgroundColor: '#FDECEA',
  },
  errorText: { flex: 1, color: '#8E251E', fontSize: 14, lineHeight: 20 },
  retryButton: { minHeight: 44, minWidth: 54, alignItems: 'center', justifyContent: 'center' },
  retryText: { color: '#8E251E', fontWeight: '700', fontSize: 14 },
  sectionTitle: { color: '#262738', fontSize: 18, fontWeight: '700', marginBottom: 14 },
  taskCard: {
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEEF3',
  },
  checkbox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#C6C5D5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: '#5146A5', borderColor: '#5146A5' },
  checkmark: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  taskDetails: { flex: 1, minHeight: 58, justifyContent: 'center', paddingVertical: 4 },
  taskTitle: { color: '#242536', fontSize: 16, lineHeight: 22, fontWeight: '600' },
  taskTitleDone: { color: '#86879A', textDecorationLine: 'line-through' },
  taskNotes: { color: '#77798B', fontSize: 13, lineHeight: 18, marginTop: 3 },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 7 },
  priority: { overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8, fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  priority_low: { color: '#276749', backgroundColor: '#E4F4EB' },
  priority_medium: { color: '#8A5B16', backgroundColor: '#FFF1D7' },
  priority_high: { color: '#A33232', backgroundColor: '#FCE7E7' },
  dueDate: { color: '#7D7F90', fontSize: 12 },
  separator: { height: 10 },
  emptyState: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 44, paddingBottom: 30 },
  emptyIcon: {
    width: 66,
    height: 66,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAE9F8',
    marginBottom: 16,
  },
  emptyIconText: { color: '#5146A5', fontSize: 30, fontWeight: '500' },
  emptyTitle: { color: '#292A3A', fontSize: 17, fontWeight: '700', textAlign: 'center' },
  emptyText: { maxWidth: 300, color: '#77798B', fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 8 },
  emptyAction: {
    minHeight: 50,
    paddingHorizontal: 20,
    marginTop: 18,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#29246C',
  },
  emptyActionText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  pressed: { opacity: 0.74 },
  disabledAction: { opacity: 0.5 },
});
