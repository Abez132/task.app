import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTasks } from '@/features/tasks/task-provider';
import type { Task, TaskPriority } from '@/features/tasks/types';

import { CalendarDatePicker } from './calendar-date-picker';

type TaskEditorModalProps = {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
};

const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high'];

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function TaskEditorModal({ visible, task, onClose }: TaskEditorModalProps) {
  const { addTask, updateTask, removeTask } = useTasks();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setTitle(task?.title ?? '');
    setNotes(task?.notes ?? '');
    setDueDate(task?.dueDate ?? '');
    setPriority(task?.priority ?? 'medium');
    setError(null);
    setIsConfirmingDelete(false);
  }, [task, visible]);

  async function handleSave() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Add a title for this task.');
      return;
    }
    const trimmedDate = dueDate.trim();
    if (trimmedDate && !isValidDate(trimmedDate)) {
      setError('Enter a valid date in YYYY-MM-DD format.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const draft = {
        title: trimmedTitle,
        notes: notes.trim(),
        dueDate: trimmedDate || null,
        priority,
      };
      if (task) {
        await updateTask(task.id, draft);
      } else {
        await addTask(draft);
      }
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save this task.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!task) return;
    setIsSaving(true);
    setError(null);
    try {
      await removeTask(task.id);
      onClose();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Could not delete this task.');
    } finally {
      setIsSaving(false);
      setIsConfirmingDelete(false);
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.header}>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close task editor"
              style={styles.headerAction}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Text style={styles.headerTitle}>{task ? 'Edit task' : 'New task'}</Text>
            <View style={styles.headerAction} />
          </View>

          <ScrollView
            contentContainerStyle={styles.form}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.label}>Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="What needs to get done?"
              placeholderTextColor="#7C8190"
              style={styles.titleInput}
              maxLength={120}
              autoCapitalize="sentences"
              returnKeyType="done"
              accessibilityLabel="Task title"
            />

            <Text style={styles.label}>Notes</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Add a few details (optional)"
              placeholderTextColor="#7C8190"
              style={[styles.input, styles.notesInput]}
              multiline
              textAlignVertical="top"
              maxLength={1000}
              accessibilityLabel="Task notes"
            />

            <Text style={styles.label}>Due date</Text>
            <CalendarDatePicker value={dueDate} onChange={setDueDate} />

            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityRow}>
              {PRIORITIES.map((option) => {
                const selected = priority === option;
                return (
                  <Pressable
                    key={option}
                    onPress={() => setPriority(option)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    style={[styles.priorityButton, selected && styles.priorityButtonSelected]}
                  >
                    <Text style={[styles.priorityText, selected && styles.priorityTextSelected]}>
                      {option[0].toUpperCase() + option.slice(1)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}

            <Pressable
              onPress={() => void handleSave()}
              disabled={isSaving}
              accessibilityRole="button"
              style={[styles.saveButton, isSaving && styles.disabledButton]}
            >
              <Text style={styles.saveButtonText}>{isSaving ? 'Saving…' : 'Save task'}</Text>
            </Pressable>

            {task && !isConfirmingDelete && (
              <Pressable
                onPress={() => setIsConfirmingDelete(true)}
                accessibilityRole="button"
                style={styles.deleteButton}
              >
                <Text style={styles.deleteText}>Delete task</Text>
              </Pressable>
            )}

            {task && isConfirmingDelete && (
              <View style={styles.confirmDeletePanel}>
                <Text style={styles.confirmDeleteTitle}>Delete this task?</Text>
                <Text style={styles.confirmDeleteCopy}>This removes it from this device.</Text>
                <View style={styles.confirmActions}>
                  <Pressable
                    onPress={() => setIsConfirmingDelete(false)}
                    disabled={isSaving}
                    accessibilityRole="button"
                    style={styles.confirmCancel}
                  >
                    <Text style={styles.confirmCancelText}>Keep task</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => void handleDelete()}
                    disabled={isSaving}
                    accessibilityRole="button"
                    style={[styles.confirmDelete, isSaving && styles.disabledButton]}
                  >
                    <Text style={styles.confirmDeleteText}>{isSaving ? 'Deleting…' : 'Delete'}</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: '#F7F7FB' },
  header: {
    minHeight: 58,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E4E5EC',
  },
  headerAction: { minWidth: 64, minHeight: 48, justifyContent: 'center' },
  cancelText: { color: '#62677A', fontSize: 16 },
  headerTitle: { color: '#171A28', fontSize: 17, fontWeight: '700' },
  form: { width: '100%', maxWidth: 640, alignSelf: 'center', padding: 24, paddingBottom: 40 },
  label: { color: '#292D3B', fontSize: 14, fontWeight: '700', marginBottom: 8, marginTop: 20 },
  titleInput: {
    minHeight: 58,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    color: '#171A28',
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#E2E3EA',
  },
  input: {
    minHeight: 54,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    color: '#171A28',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E2E3EA',
  },
  notesInput: { minHeight: 120, paddingTop: 14 },
  priorityRow: { flexDirection: 'row', gap: 10 },
  priorityButton: {
    minHeight: 48,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E3EA',
  },
  priorityButtonSelected: { backgroundColor: '#29246C', borderColor: '#29246C' },
  priorityText: { color: '#62677A', fontSize: 14, fontWeight: '600' },
  priorityTextSelected: { color: '#FFFFFF' },
  error: { marginTop: 16, color: '#B42318', fontSize: 14, lineHeight: 20 },
  saveButton: {
    minHeight: 54,
    marginTop: 28,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#29246C',
  },
  disabledButton: { opacity: 0.55 },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  deleteButton: { minHeight: 50, marginTop: 10, alignItems: 'center', justifyContent: 'center' },
  deleteText: { color: '#B42318', fontSize: 15, fontWeight: '600' },
  confirmDeletePanel: { marginTop: 16, padding: 16, borderRadius: 16, backgroundColor: '#FDECEA' },
  confirmDeleteTitle: { color: '#6F1D1B', fontSize: 16, fontWeight: '700' },
  confirmDeleteCopy: { color: '#8E403A', fontSize: 14, marginTop: 5 },
  confirmActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  confirmCancel: {
    minHeight: 48,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  confirmCancelText: { color: '#514B5A', fontSize: 14, fontWeight: '700' },
  confirmDelete: {
    minHeight: 48,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#B42318',
  },
  confirmDeleteText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});
