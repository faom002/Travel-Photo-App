import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { db, storage } from '../db/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Modal from 'react-native-modal';  
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = ({ route }) => {
  const { user } = route.params;
  const [editedUser, setEditedUser] = useState({ ...user });
  const [isEditProfileModalVisible, setEditProfileModalVisible] = useState(false);
  const navigation = useNavigation();

  const toggleEditProfileModal = () => {
    setEditProfileModalVisible(!isEditProfileModalVisible);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setEditedUser({ ...editedUser, image: result.assets[0].uri });
    }
  };

 const handleLogout = () => {
    navigation.navigate('LoginScreen');
  };

  const saveChanges = async () => {
    try {
      const updatedUser = { ...editedUser };

      if (updatedUser.image) {
        const response = await fetch(updatedUser.image);
        const blob = await response.blob();
        const storageRef = ref(storage, `user_images/${updatedUser.username}`);
        await uploadBytes(storageRef, blob);

        const newImageDownloadURL = await getDownloadURL(storageRef);

        updatedUser.image = newImageDownloadURL;
      }

      Object.keys(updatedUser).forEach(
        (key) => updatedUser[key] === undefined && delete updatedUser[key]
      );

      await updateDoc(doc(db, 'users', user.id), updatedUser);

      console.log('User information updated successfully!');
      toggleEditProfileModal(); 
    } catch (error) {
      console.error('Error updating user information', error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

      <Text className='text-2xl font-bold'>Your Profile</Text>

      <Image source={{ uri: editedUser.image }} className='w-32 h-32 rounded-full mt-5' />
      
      <Text className='my-5'>Username: {editedUser.username}</Text>

      <TouchableOpacity onPress={toggleEditProfileModal}>
        <Text className='text-blue-500 mt-10'>Edit Profile</Text>
      </TouchableOpacity>

     <TouchableOpacity className="absolute bottom-5" onPress={handleLogout}>
        <Text className='text-red-500'>Log out</Text>
      </TouchableOpacity>


      <Modal isVisible={isEditProfileModalVisible}  className="my-3/12">
        <View className='flex-1 justify-center items-center bg-white rounded-2xl'>
          <TouchableOpacity className='bg-blue-500 rounded-full py-1 px-2  absolute -translate-x-36 -translate-y-64' onPress={toggleEditProfileModal}>
            <Text className='text-white'>X</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={pickImage}>
            {editedUser.image ? (
              <Image source={{ uri: editedUser.image }} style={{ width: 100, height: 100, borderRadius: 50 }} />
            ) : (
              <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: 'gray' }} />
            )}
          </TouchableOpacity>
          <View className='flex-row my-5'>
            <Text className='font-bold'> New Username: </Text>
            <TextInput
              placeholder="New Username"
              value={editedUser.username}
              onChangeText={(text) => setEditedUser({ ...editedUser, username: text })}
              className='w-24  bg-gray-100 p-1 text-gray-500 rounded-md'
              />
          </View>
          <View className='flex-row'>
            <Text className='font-bold'> New Password: </Text>
            <TextInput
              placeholder="New Password"
              value={editedUser.password}
              onChangeText={(text) => setEditedUser({ ...editedUser, password: text })}
              secureTextEntry
              className='w-24 bg-gray-100 p-1 text-gray-500 rounded-md'
            />
          </View>

          <TouchableOpacity onPress={saveChanges}>
            <Text className='text-blue-500 mt-5'>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default ProfileScreen;
