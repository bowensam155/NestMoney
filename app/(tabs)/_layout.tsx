import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Home, CreditCard, Target, BookOpen } from 'lucide-react-native';
import { Colors, Layout, Typography } from '@/constants/theme';

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.tabActive,
        tabBarInactiveTintColor: Colors.tabInactive,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          height: Layout.tabBarHeight,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: Typography.sizeLabel,
          fontWeight: Typography.weightMedium,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t('dashboard.title', 'Home'),
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={size} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="cards"
        options={{
          title: t('cards.title', 'Cards'),
          tabBarIcon: ({ color, size }) => (
            <CreditCard color={color} size={size} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: t('goals.title', 'Goals'),
          tabBarIcon: ({ color, size }) => (
            <Target color={color} size={size} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: t('learn.title', 'Learn'),
          tabBarIcon: ({ color, size }) => (
            <BookOpen color={color} size={size} strokeWidth={1.5} />
          ),
        }}
      />
    </Tabs>
  );
}
