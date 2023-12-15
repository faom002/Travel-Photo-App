import React, { useEffect, useState } from "react";
import { View, FlatList, TouchableOpacity, Text, RefreshControl } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import { Image } from "expo-image";
import { collection, getDocs } from "@firebase/firestore";
import {db} from "../db/firebase";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

interface Database {
  id: string;
  caption: string;
  image: string;
  username: string;
}

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, route }) => {
  const [tasks, setTasks] = useState<Database[]>([]);
  const { user } = route.params;
 const [refreshing, setRefreshing] = useState(false);




 const onRefresh = async () => {
    setRefreshing(true);

    try {
      const tasksCollection = collection(db, "image_collection");
      const tasksSnapshot = await getDocs(tasksCollection);

      const tasksData = tasksSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Database[];

      setTasks(tasksData);
    } catch (error) {
      console.error("Error getting tasks", error);
    }

    setRefreshing(false);
  };






  useEffect(() => {
    const getTasks = async () => {
      try {
        const tasksCollection = collection(db, "image_collection");
        const tasksSnapshot = await getDocs(tasksCollection);

        const tasksData = tasksSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Database[];

        setTasks(tasksData);
      } catch (error) {
        console.error("Error getting tasks", error);
      }
    };

    getTasks();
  }, []);

  return (
    <View>
      <FlatList className="bg-white"
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
            <TouchableOpacity className="mb-5" onPress={() => navigation.navigate("Detail", { photo: item })}>
              <View className="border-t p-3">
              <View className="flex-row">
              <Image source={{ uri: item.image }} className="w-5 h-5 rounded-full" />
              <Text className="pl-2 pt-0.5 font-bold text-md">{item.username}</Text>
              </View>
              </View>
                
              <Image source={{ uri: item.image }} className="w-full h-96" />
              <View className="flex-row mt-3 ml-2 mr-20">
              <Text className="font-bold">{item.username}: </Text>
              <Text>{item.caption}</Text>
              </View>
            </TouchableOpacity>
        )}
         refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

    </View>
  );
};

export default HomeScreen;
