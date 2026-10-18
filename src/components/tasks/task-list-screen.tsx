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
            <Text style={styles.eyebrow}>{showCompleted ? 'YOUR PROGRESS' : 'FOCUS · TASKS'}</Text>
            <View style={styles.headingRow}>
              <View style={styles.headingCopy}>
                <Text style={styles.title}>{showCompleted ? 'Completed' : 'My tasks'}</Text>
                <Text style={styles.subtitle}>
                  {showCompleted
                    ? `${visibleTasks.length} task${visibleTasks.length === 1 ? '' : 's'} finished`
                    : remainingCount === 0
                      ? 'A little progress, every day.'
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
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{remainingCount}</Text>
                  <Text style={styles.statTitle}>To do</Text>
                  <Text style={styles.statCaption}>Keep your focus</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{tasks.length - remainingCount}</Text>
                  <Text style={styles.statTitle}>Completed</Text>
                  <Text style={styles.statCaption}>Small wins add up</Text>
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
                {showCompleted ? 'Finished tasks will appear here.' : 'Tap the plus to add your first task.'}
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
  safeArea: { flex: 1, backgroundColor: '#0C0C10' },
  listContent: { width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: 22 },
  header: { paddingTop: 14 },
  eyebrow: { color: '#92929D', fontSize: 11, fontWeight: '800', letterSpacing: 1.8 },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 10 },
  headingCopy: { flex: 1 },
  title: { color: '#F7F7F8', fontSize: 34, lineHeight: 42, fontWeight: '800' },
  subtitle: { color: '#96969F', fontSize: 15, lineHeight: 21, marginTop: 4 },
  addButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#26262C',
  },
  addButtonText: { color: '#FFFFFF', fontSize: 28, lineHeight: 32, fontWeight: '400' },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 28,
  },
  statCard: {
    minHeight: 144,
    flex: 1,
    justifyContent: 'flex-end',
    padding: 18,
    borderRadius: 24,
    backgroundColor: '#242429',
    borderWidth: 1,
    borderColor: '#303036',
  },
  statValue: { color: '#F6F6F7', fontSize: 36, lineHeight: 40, fontWeight: '800' },
  statTitle: { color: '#F1F1F3', fontSize: 16, fontWeight: '700', marginTop: 10 },
  statCaption: { color: '#9999A3', fontSize: 12, marginTop: 4 },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    marginTop: 18,
    borderRadius: 14,
    backgroundColor: '#34201F',
  },
  errorText: { flex: 1, color: '#FFB4AA', fontSize: 14, lineHeight: 20 },
  retryButton: { minHeight: 44, minWidth: 54, alignItems: 'center', justifyContent: 'center' },
  retryText: { color: '#FFB4AA', fontWeight: '700', fontSize: 14 },
  sectionTitle: { color: '#F1F1F3', fontSize: 18, fontWeight: '700', marginBottom: 14 },
  taskCard: {
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: '#202025',
    borderWidth: 1,
    borderColor: '#303036',
  },
  checkbox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#55555F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: '#E9E9EE', borderColor: '#E9E9EE' },
  checkmark: { color: '#17171B', fontSize: 20, fontWeight: '700' },
  taskDetails: { flex: 1, minHeight: 58, justifyContent: 'center', paddingVertical: 4 },
  taskTitle: { color: '#F2F2F4', fontSize: 16, lineHeight: 22, fontWeight: '600' },
  taskTitleDone: { color: '#777780', textDecorationLine: 'line-through' },
  taskNotes: { color: '#A0A0AA', fontSize: 13, lineHeight: 18, marginTop: 3 },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 7 },
  priority: { overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8, fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  priority_low: { color: '#B8E4C7', backgroundColor: '#1D3527' },
  priority_medium: { color: '#F0D49E', backgroundColor: '#3A3020' },
  priority_high: { color: '#F3B5B5', backgroundColor: '#3A2425' },
  dueDate: { color: '#A0A0AA', fontSize: 12 },
  separator: { height: 10 },
  emptyState: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 44, paddingBottom: 30 },
  emptyIcon: {
    width: 66,
    height: 66,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#242429',
    borderWidth: 1,
    borderColor: '#414149',
    marginBottom: 16,
  },
  emptyIconText: { color: '#F4F4F5', fontSize: 30, fontWeight: '500' },
  emptyTitle: { color: '#F4F4F5', fontSize: 17, fontWeight: '700', textAlign: 'center' },
  emptyText: { maxWidth: 300, color: '#92929D', fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 8 },
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
