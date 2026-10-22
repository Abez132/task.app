import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppColors } from '@/constants/theme';

export default function AppTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        sceneStyle: { backgroundColor: '#0C0C10' },
        tabBarBackground: () => <View style={{ flex: 1, backgroundColor: '#0C0C10', borderRadius: 26 }} />,
        tabBarStyle: {
          position: 'absolute',
          left: '10%',
          right: '10%',
          bottom: Math.max(insets.bottom, 10),
          backgroundColor: '#0C0C10',
          borderColor: '#1B1B20',
          borderWidth: 1,
          borderRadius: 26,
          marginHorizontal: 0,
          marginBottom: 0,
          height: 58,
          paddingTop: 3,
          paddingBottom: 3,
          overflow: 'hidden',
          elevation: 8,
        },
        tabBarActiveBackgroundColor: '#24113A',
        tabBarActiveTintColor: AppColors.peach,
        tabBarInactiveTintColor: '#686872',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 23, lineHeight: 26 }}>▤</Text>,
          tabBarLabel: ({ focused, color }) =>
            focused ? <Text style={{ color, fontSize: 11, fontWeight: '700' }}>Tasks</Text> : null,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Done',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 23, lineHeight: 26 }}>✓</Text>,
          tabBarLabel: ({ focused, color }) =>
            focused ? <Text style={{ color, fontSize: 11, fontWeight: '700' }}>Done</Text> : null,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 23, lineHeight: 26 }}>▥</Text>,
          tabBarLabel: ({ focused, color }) =>
            focused ? <Text style={{ color, fontSize: 11, fontWeight: '700' }}>Progress</Text> : null,
        }}
      />
    </Tabs>
  );
}
