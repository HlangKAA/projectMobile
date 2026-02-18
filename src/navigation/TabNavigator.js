
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import Dashboard from '../screens/Dashboard';
import Timetable from '../screens/Timetable';
import Planner from '../screens/Planner';
import Profile from '../screens/Profile';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Dashboard') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Timetable') {
                        iconName = focused ? 'calendar' : 'calendar-outline';
                    } else if (route.name === 'Planner') {
                        iconName = focused ? 'list' : 'list-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#006D6D',
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
                tabBarStyle: {
                    height: 60,
                    paddingBottom: 10,
                    paddingTop: 10,
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    position: 'absolute',
                    borderTopWidth: 0,
                    elevation: 5,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 5,
                }
            })}
        >
            <Tab.Screen name="Dashboard" component={Dashboard} options={{ tabBarLabel: 'หน้าหลัก' }} />
            <Tab.Screen name="Timetable" component={Timetable} options={{ tabBarLabel: 'ตารางเรียน' }} />
            <Tab.Screen name="Planner" component={Planner} options={{ tabBarLabel: 'แผนการเรียน' }} />
            <Tab.Screen name="Profile" component={Profile} options={{ tabBarLabel: 'โปรไฟล์' }} />
        </Tab.Navigator>
    );
};

export default TabNavigator;
