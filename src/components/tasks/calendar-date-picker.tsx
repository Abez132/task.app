import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppColors } from '@/constants/theme';

type CalendarDatePickerProps = {
  value: string;
  onChange: (date: string) => void;
};

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function parseDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

function toDateValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function makeMonthCells(month: Date): Array<number | null> {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstWeekday = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: Array<number | null> = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function CalendarDatePicker({ value, onChange }: CalendarDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(parseDate(value) ?? new Date())
  );
  const cells = useMemo(() => makeMonthCells(visibleMonth), [visibleMonth]);
  const selectedDate = parseDate(value);
  const selectedLabel = selectedDate
    ? selectedDate.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Choose a date';

  function toggleCalendar() {
    if (!isOpen) setVisibleMonth(startOfMonth(selectedDate ?? new Date()));
    setIsOpen((open) => !open);
  }

  function selectDay(day: number) {
    onChange(toDateValue(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day)));
    setIsOpen(false);
  }

  function moveMonth(amount: number) {
    setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + amount, 1));
  }

  function selectToday() {
    const today = new Date();
    onChange(toDateValue(today));
    setVisibleMonth(startOfMonth(today));
    setIsOpen(false);
  }

  return (
    <View>
      <View style={styles.fieldRow}>
        <Pressable
          onPress={toggleCalendar}
          accessibilityRole="button"
          accessibilityLabel={value ? `Due date, ${selectedLabel}` : 'Choose an optional due date'}
          accessibilityState={{ expanded: isOpen }}
          style={({ pressed }) => [styles.dateField, pressed && styles.pressed]}
        >
          <Text style={styles.calendarGlyph}>▦</Text>
          <Text style={[styles.dateText, !value && styles.placeholder]}>{selectedLabel}</Text>
          <Text style={styles.chevron}>{isOpen ? '⌃' : '⌄'}</Text>
        </Pressable>
        {!!value && (
          <Pressable
            onPress={() => onChange('')}
            accessibilityRole="button"
            accessibilityLabel="Clear due date"
            style={styles.clearButton}
          >
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        )}
      </View>

      {isOpen && (
        <View style={styles.calendar}>
          <View style={styles.monthHeader}>
            <Pressable
              onPress={() => moveMonth(-1)}
              accessibilityRole="button"
              accessibilityLabel="Previous month"
              style={styles.monthArrow}
            >
              <Text style={styles.arrowText}>‹</Text>
            </Pressable>
            <Text accessibilityLiveRegion="polite" style={styles.monthTitle}>
              {visibleMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </Text>
            <Pressable
              onPress={() => moveMonth(1)}
              accessibilityRole="button"
              accessibilityLabel="Next month"
              style={styles.monthArrow}
            >
              <Text style={styles.arrowText}>›</Text>
            </Pressable>
          </View>

          <View style={styles.calendarGrid}>
            {WEEKDAYS.map((weekday) => (
              <View key={weekday} style={styles.calendarCell}>
                <Text style={styles.weekday}>{weekday}</Text>
              </View>
            ))}
            {cells.map((day, index) => {
              const dateValue = day
                ? toDateValue(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day))
                : '';
              const selected = dateValue !== '' && dateValue === value;
              const today = dateValue !== '' && dateValue === toDateValue(new Date());
              return (
                <View key={`${visibleMonth.getFullYear()}-${visibleMonth.getMonth()}-${index}`} style={styles.calendarCell}>
                  {day ? (
                    <Pressable
                      onPress={() => selectDay(day)}
                      accessibilityRole="button"
                      accessibilityLabel={new Date(
                        visibleMonth.getFullYear(),
                        visibleMonth.getMonth(),
                        day
                      ).toLocaleDateString(undefined, {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                      accessibilityState={{ selected }}
                      style={[
                        styles.dayButton,
                        selected && styles.selectedDay,
                        today && !selected && styles.today,
                      ]}
                    >
                      <Text style={[styles.dayText, selected && styles.selectedDayText]}>{day}</Text>
                    </Pressable>
                  ) : (
                    <View style={styles.dayButton} />
                  )}
                </View>
              );
            })}
          </View>

          <Pressable onPress={selectToday} accessibilityRole="button" style={styles.todayButton}>
            <Text style={styles.todayButtonText}>Choose today</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateField: {
    flex: 1,
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 15,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#34343B',
    backgroundColor: '#202025',
  },
  calendarGlyph: { color: '#D0D0D6', fontSize: 19 },
  dateText: { flex: 1, color: '#F4F4F5', fontSize: 15 },
  placeholder: { color: '#888892' },
  chevron: { color: '#AAAAB3', fontSize: 20 },
  clearButton: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  clearText: { color: '#D0D0D6', fontSize: 14, fontWeight: '700' },
  calendar: {
    padding: 12,
    paddingHorizontal: 8,
    marginTop: 8,
    borderRadius: 16,
    backgroundColor: '#202025',
    borderWidth: 1,
    borderColor: '#34343B',
  },
  monthHeader: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  monthArrow: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 13 },
  arrowText: { color: '#E2E2E6', fontSize: 30, lineHeight: 34 },
  monthTitle: { color: '#F4F4F5', fontSize: 16, fontWeight: '700' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarCell: { width: '14.2857%', minHeight: 42, alignItems: 'center', justifyContent: 'center' },
  weekday: { color: '#92929D', fontSize: 11, fontWeight: '700' },
  dayButton: { width: 36, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 13 },
  selectedDay: { backgroundColor: AppColors.purple },
  today: { borderWidth: 1, borderColor: '#9A9AA4' },
  dayText: { color: '#E2E2E6', fontSize: 14 },
  selectedDayText: { color: '#FFFFFF', fontWeight: '700' },
  todayButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: 5 },
  todayButtonText: { color: '#E2E2E6', fontSize: 14, fontWeight: '700' },
  pressed: { opacity: 0.75 },
});
