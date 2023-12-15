import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../pages/HomeScreen';
import DetailScreen from '../pages/DetailScreen';
import UploadScreen from '../pages/UploadScreen';
import TakePicScreen from '../pages/TakePicScreen';
import { RootStackParamList } from '../types';

const Stack = createStackNavigator<RootStackParamList>();

const HomeRoutes = ({ route }) => {
  const { user } = route.params;

  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        initialParams={{ user }}
      />
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        initialParams={{ user }}
      />
      <Stack.Screen 
        name="Upload" 
        component={UploadScreen}
        initialParams={{ user }}

      />
      <Stack.Screen name="TakePic" component={TakePicScreen}
         initialParams={{ user }}

      />
    </Stack.Navigator>
  );
};

export default HomeRoutes;

