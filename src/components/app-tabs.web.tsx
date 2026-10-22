import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { Pressable, Text, View, StyleSheet } from 'react-native';

import { AppColors, MaxContentWidth, Spacing } from '@/constants/theme';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton>Tasks</TabButton>
          </TabTrigger>
          <TabTrigger name="explore" href="/explore" asChild>
            <TabButton>Done</TabButton>
          </TabTrigger>
          <TabTrigger name="progress" href="/progress" asChild>
            <TabButton>Progress</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  const label = typeof children === 'string' ? children : 'Tasks';
  const icon = label === 'Tasks' ? '▤' : label === 'Done' ? '✓' : '▥';

  return (
    <Pressable {...props} accessibilityRole="tab" style={({ pressed }) => pressed && styles.pressed}>
      <View style={styles.tabButtonView}>
        <Text style={[styles.tabIcon, isFocused && styles.tabIconFocused]}>{icon}</Text>
        {isFocused && <Text style={styles.tabLabel}>{label}</Text>}
      </View>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  return (
    <View {...props} style={styles.tabListContainer}>
      <View style={styles.innerContainer}>
        {props.children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    width: '100%',
    bottom: 12,
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
    backgroundColor: '#0C0C10',
    borderWidth: 1,
    borderColor: '#1B1B20',
  },
  pressed: {
    opacity: 0.7,
  },
  tabButtonView: { minWidth: 68, minHeight: 48, paddingHorizontal: 10, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7 },
  tabIcon: { color: '#686872', fontSize: 22, lineHeight: 25 },
  tabIconFocused: { color: AppColors.peach },
  tabLabel: { color: AppColors.peach, fontSize: 12, fontWeight: '700' },
});
