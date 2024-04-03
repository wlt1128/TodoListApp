import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MapScreen from './src/MapScreen';
import TodoListScreen from './src/TodoListScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Todos" component={TodoListScreen} />
        <Tab.Screen name="MapScreen" component={MapScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
