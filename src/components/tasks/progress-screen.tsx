import { useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppColors } from '@/constants/theme';

import { useTasks } from '@/features/tasks/task-provider';

function getDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const { tasks, isLoading } = useTasks();
  const completedTasks = useMemo(() => tasks.filter((task) => task.completed), [tasks]);
  const completionRate = tasks.length === 0 ? 0 : Math.round((completedTasks.length / tasks.length) * 100);

  const weeklyProgress = useMemo(() => {
    const today = new Date();
    const dates = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (6 - index));
      return {
        key: getDayKey(date),
        label: date.toLocaleDateString(undefined, { weekday: 'short' }),
        count: 0,
      };
    });
    const dateIndex = new Map(dates.map((day, index) => [day.key, index]));

    completedTasks.forEach((task) => {
      const completionTime = task.completedAt ?? task.updatedAt;
      const completedDate = new Date(completionTime);
      if (Number.isNaN(completedDate.getTime())) return;
      const index = dateIndex.get(getDayKey(completedDate));
      if (index !== undefined) dates[index].count += 1;
    });

    return dates;
  }, [completedTasks]);

  const maxDayCount = Math.max(1, ...weeklyProgress.map((day) => day.count));

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 104 }]}>
        <Text style={styles.eyebrow}>YOUR ACTIVITY</Text>
        <Text style={styles.title}>Progress</Text>
        <Text style={styles.subtitle}>A look at how far you’ve come.</Text>

        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color="#F4F4F5" />
          </View>
        ) : (
          <>
            <View style={styles.overviewCard}>
              <View style={styles.overviewTop}>
                <View>
                  <Text style={styles.cardEyebrow}>ALL TIME</Text>
                  <Text style={styles.overviewTitle}>Task completion</Text>
                </View>
                <Text style={styles.percent}>{completionRate}%</Text>
              </View>
              <View
                accessibilityRole="progressbar"
                accessibilityLabel={`${completionRate}% of tasks completed`}
                accessibilityValue={{ min: 0, max: 100, now: completionRate }}
                style={styles.progressTrack}
              >
                <View style={[styles.progressFill, { width: `${completionRate}%` }]} />
              </View>
              <Text style={styles.overviewCaption}>
                {completedTasks.length} of {tasks.length} tasks completed
              </Text>
            </View>

            <View style={styles.chartCard}>
              <View style={styles.chartHeading}>
                <View>
                  <Text style={styles.cardEyebrow}>LAST 7 DAYS</Text>
                  <Text style={styles.chartTitle}>Completed tasks</Text>
                </View>
                <Text style={styles.weekTotal}>
                  {weeklyProgress.reduce((total, day) => total + day.count, 0)}
                </Text>
              </View>
              {tasks.length === 0 ? (
                <Text style={styles.emptyCopy}>Your chart will grow as you complete tasks.</Text>
              ) : (
                <View style={styles.chart}>
                  <View pointerEvents="none" style={[styles.gridline, styles.gridlineTop]} />
                  <View pointerEvents="none" style={[styles.gridline, styles.gridlineMiddle]} />
                  <View pointerEvents="none" style={[styles.gridline, styles.gridlineBottom]} />
                  {weeklyProgress.map((day) => (
                    <View key={day.key} style={styles.barColumn}>
                      <Text style={styles.barValue}>{day.count || ''}</Text>
                      <View style={styles.barTrack}>
                        <View
                          style={[
                            styles.bar,
                            { height: `${Math.max(6, (day.count / maxDayCount) * 100)}%` },
                            day.count === 0 && styles.emptyBar,
                          ]}
                        />
                      </View>
                      <Text style={styles.dayLabel}>{day.label}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{tasks.length}</Text>
                <Text style={styles.statLabel}>Total tasks</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{tasks.length - completedTasks.length}</Text>
                <Text style={styles.statLabel}>Still to do</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0C0C10' },
  content: { width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: 22, paddingTop: 22 },
  eyebrow: { color: '#92929D', fontSize: 11, fontWeight: '800', letterSpacing: 1.8 },
  title: { color: '#F7F7F8', fontSize: 34, lineHeight: 42, fontWeight: '800', marginTop: 10 },
  subtitle: { color: '#96969F', fontSize: 15, lineHeight: 21, marginTop: 4 },
  loading: { minHeight: 260, alignItems: 'center', justifyContent: 'center' },
  overviewCard: { padding: 20, marginTop: 28, borderRadius: 24, backgroundColor: '#242429', borderWidth: 1, borderColor: '#303036' },
  overviewTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardEyebrow: { color: '#92929D', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  overviewTitle: { color: '#F3F3F5', fontSize: 16, fontWeight: '700', marginTop: 8 },
  percent: { color: '#F7F7F8', fontSize: 34, fontWeight: '800' },
  progressTrack: { height: 9, overflow: 'hidden', borderRadius: 8, backgroundColor: '#3A3A42', marginTop: 22 },
  progressFill: { height: '100%', borderRadius: 8, backgroundColor: AppColors.purple },
  overviewCaption: { color: '#A0A0AA', fontSize: 13, marginTop: 12 },
  chartCard: { minHeight: 284, padding: 20, marginTop: 14, borderRadius: 24, backgroundColor: '#242429', borderWidth: 1, borderColor: '#303036' },
  chartHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chartTitle: { color: '#F3F3F5', fontSize: 17, fontWeight: '700', marginTop: 8 },
  weekTotal: { color: '#F7F7F8', fontSize: 28, fontWeight: '800' },
  chart: { height: 178, position: 'relative', flexDirection: 'row', alignItems: 'stretch', justifyContent: 'space-between', gap: 8, marginTop: 18 },
  gridline: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#3A3A42' },
  gridlineTop: { top: 19 },
  gridlineMiddle: { top: 88 },
  gridlineBottom: { top: 157 },
  barColumn: { flex: 1, alignItems: 'center' },
  barValue: { height: 18, color: '#D9D9DF', fontSize: 11, fontWeight: '700' },
  barTrack: { width: '70%', flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: '68%', minHeight: 4, borderRadius: 8, backgroundColor: AppColors.peach },
  emptyBar: { backgroundColor: '#54545E' },
  dayLabel: { color: '#92929D', fontSize: 11, marginTop: 8 },
  emptyCopy: { color: '#92929D', fontSize: 14, lineHeight: 21, marginTop: 32 },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 14 },
  statCard: { minHeight: 100, flex: 1, justifyContent: 'center', padding: 18, borderRadius: 22, backgroundColor: '#1D1D22', borderWidth: 1, borderColor: '#303036' },
  statValue: { color: '#F5F5F7', fontSize: 26, fontWeight: '800' },
  statLabel: { color: '#9999A3', fontSize: 13, marginTop: 5 },
});
