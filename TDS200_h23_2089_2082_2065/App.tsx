import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import TabBarView from './Routes';
import LoginScreen from './pages/LoginScreen';

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="LoginScreen">
          <Stack.Screen
            name="LoginScreen"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="TabBarView" component={TabBarView} options={{headerShown: false}} />
        </Stack.Navigator>
      </NavigationContainer>
  );
}
