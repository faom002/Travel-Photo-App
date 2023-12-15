import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from "react-native";
import { getDocs, collection, addDoc } from "firebase/firestore";
import { db, storage } from "../db/firebase";
import Modal from "react-native-modal";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { useNavigation } from "@react-navigation/native";
import { StackActions } from "@react-navigation/native";

interface Database {
  id: string;
  username: string;
  password: string;
}

const LoginScreen = () => {
  const [tasks, setTasks] = useState<Database[]>();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRegisterModalVisible, setRegisterModalVisible] = useState(false);

  const navigation = useNavigation();

  const toggleRegisterModal = () => {
    setRegisterModalVisible(!isRegisterModalVisible);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result);
      console.log("Selected image URI:", result.uri);
    } else {
      console.log("Image picking cancelled");
    }
  };

  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        console.error("Permission to access media library denied");
      }
    })();
  }, []);

  const fetchTasks = async () => {
    try {
      const tasksCollection = collection(db, "users");
      const tasksSnapshot = await getDocs(tasksCollection);

      const tasksData = tasksSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Database[];

      setTasks(tasksData);

      const matchingUser = tasksData.find(
        (doc) => doc.username === username && doc.password === password
      );

      if (matchingUser) {
        Alert.alert("Success", "Login successful");
        navigateToTabBar(matchingUser);
      } else {
        Alert.alert("Error", "Invalid username or password");
      }
    } catch (error) {
      console.error("Error getting tasks", error);
    }
  };

  const handleLogin = () => {
    fetchTasks();
  };

  const handleRegister = async () => {
    try {
      setLoading(true);

      if (!userImage) {
        console.log('Please select an image');
        return;
      }

      const response = await fetch(userImage.assets[0].uri);
      const blob = await response.blob();

      const storageRef = ref(storage, `user_images/${username}`);
      await uploadBytes(storageRef, blob);

      const imageDownloadURL = await getDownloadURL(storageRef);

      if (!imageDownloadURL) {
        console.error('Download URL is null');
        return;
      }

      const userRef = await addDoc(collection(db, 'users'), {
        username,
        password,
        image: imageDownloadURL,
      });

      console.log('User registered successfully:', userRef.id);

      toggleRegisterModal();
    } catch (error) {
      console.error('Error registering user with image', error);
      Alert.alert('Error', 'Failed to register user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const navigateToTabBar = (user: Database) => {
    navigation.dispatch(StackActions.replace("TabBarView", { user }));
  };

  return (
    <View className=" flex-1 justify-center">
      <View className="items-center">
        <Text className="text-3xl">Hello!</Text>
        <Text className="text-gray-400">
          Welcome to our travel photos app
        </Text>

        <View className="flex-row p-2 mb-3 border w-4/5 border-gray-500 rounded-md mt-5">
          <Image
            source={require("../assets/images/user.png")}
            className="w-4 h-4 mr-3"
          />
          <TextInput
            placeholder="Username"
            value={username.toLowerCase()}
            onChangeText={(text) => setUsername(text)}
            className=""
          />
        </View>

        <View className="flex-row p-2 mb-3 border w-4/5 border-gray-500 rounded-md">
          <Image
            source={require("../assets/images/lock.png")}
            className="w-4 h-4 mr-3"
          />
          <TextInput
            placeholder="Password"
            value={password.toLowerCase()}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry
            className=""
          />
        </View>

        <TouchableOpacity
          className="bg-blue-600 px-10 py-2 rounded-md mt-5"
          onPress={handleLogin}
        >
          <Text className="text-white">Login</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-center mt-1">
        <Text>Don't have an account? </Text>
        <TouchableOpacity onPress={toggleRegisterModal}>
          <Text className="text-blue-500">Register</Text>
        </TouchableOpacity>
      </View>

      <Modal isVisible={isRegisterModalVisible} className="my-3/12">
        <View className="flex-1 justify-center items-center bg-white rounded-2xl">
          <TouchableOpacity className="bg-blue-500 rounded-full px-3 py-2 absolute -translate-x-36 -translate-y-64" onPress={toggleRegisterModal}>
            <Text className="text-white">X</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={pickImage}>
            {userImage ? (
              <Image
                source={{ uri: userImage.assets[0].uri }}
                className="w-28 h-28 rounded-full"
              />
            ) : (
              <View className="w-28 h-28 rounded-full bg-gray-500" />
            )}
          </TouchableOpacity>

          <View className="flex-row p-2 mb-3 border w-4/5 border-gray-500 rounded-md mt-5">
            <Image
              source={require("../assets/images/user.png")}
              className="w-4 h-4 mr-3"
            />
            <TextInput
              placeholder="Username"
              value={username.toLowerCase()}
              onChangeText={(text) => setUsername(text)}
              className=""
            />
          </View>

          <View className="flex-row p-2 mb-3 border w-4/5 border-gray-500 rounded-md">
            <Image
              source={require("../assets/images/lock.png")}
              className="w-4 h-4 mr-3"
            />
            <TextInput
              placeholder="Password"
              value={password.toLowerCase()}
              onChangeText={(text) => setPassword(text)}
              secureTextEntry
              className=""
            />
          </View>

          <TouchableOpacity onPress={handleRegister}>
            <Text className="text-blue-500">Register</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default LoginScreen;

