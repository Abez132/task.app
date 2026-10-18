import { DarkTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { TaskProvider } from '@/features/tasks/task-provider';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <TaskProvider>
        <AnimatedSplashOverlay />
        <AppTabs />
      </TaskProvider>
    </ThemeProvider>
  );
}
