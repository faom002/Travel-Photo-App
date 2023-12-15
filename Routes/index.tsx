import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text } from "react-native";
import HomeRoutes from "./HomeRoutes";
import UploadScreen from "../pages/UploadScreen";
import ProfileScreen from "../pages/ProfileScreen";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

const TabBarView = ({ route }) => {
  const { user } = route.params;

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="TabBarHome"
        component={HomeRoutes}
        initialParams={{ user }}
        options={({ route }) => ({
          headerShown: route.name !== "TabBarHome",
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                top:6,
              }}
            >
              <MaterialCommunityIcons
                name={"home-outline"}
                size={28}
                color={"black"}
              />
            </View>
          ),
          tabBarLabel: () => (
          <View>
            <Text className="text-">Home</Text>
          </View>
          ),
        })}
      />

      <Tab.Screen
        name="Add Photo"
        component={UploadScreen}
        initialParams={{ user }}
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                top: 6,
              }}
            >
              <MaterialCommunityIcons
                name={"camera-plus-outline"}
                size={25}
                color={"black"}
              />
            </View>
          ),
          tabBarLabel: () => (
          <View>
            <Text>Add Photo</Text>
          </View>
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        initialParams={{ user }}
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              style={{ alignItems: "center", justifyContent: "center", top: 7 }}
            >
              <MaterialCommunityIcons
                name={"account-outline"}
                size={28}
                color={"black"}
              />
            </View>
          ),
          tabBarLabel: () => (
            <View>
              <Text>Profile</Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabBarView;
