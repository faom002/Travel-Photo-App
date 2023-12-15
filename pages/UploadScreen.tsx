import React, { useState, useEffect } from 'react';
import { View, Image, Button, TextInput, ActivityIndicator, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from '@firebase/storage';
import { db, storage } from '../db/firebase';

import { useNavigation } from '@react-navigation/native';

interface ImagePickerResult {
  canceled: boolean;
  assets: Array<{
    assetId: string;
    base64: string | null;
    duration: number | null;
    exif: object | null;
    fileName: string;
    fileSize: number;
    height: number;
    type: string;
    uri: string;
    width: number;
  }>;
}

const UploadScreen = ({route}) => {
  const [selectedImage, setSelectedImage] = useState<ImagePickerResult | null>(null);
  const [captionName, setCaptionName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation();
 const {user} = route.params;
  useEffect(() => {
    return () => {
      setSelectedImage(null);
    };
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedImage(result);
      } else {
        console.log('Image picking cancelled');
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const addImageToFirebase = async () => {
    try {
      setLoading(true);

      if (!selectedImage) {
        console.log('Please select an image');
        return;
      }

      const response = await fetch(selectedImage.assets[0].uri);
      const blob = await response.blob();

      const storageRef = ref(storage, `images/${Date.now()}`);
      await uploadBytes(storageRef, blob);

      const downloadURL = await getDownloadURL(storageRef);

      if (!downloadURL) {
        console.error('Download URL is null');
        return;
      }

      const newTaskData = {
        caption: captionName,
        image: downloadURL,
        username: user.username,
      };

      const tasksCollection = collection(db, 'image_collection');
      await addDoc(tasksCollection, newTaskData);

      console.log('Image added to Firebase:', newTaskData);
      setCaptionName('');
    } catch (error) {
      console.error('Error adding image to Firebase', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToTakePic = () => {
    navigation.navigate('TakePic');
  };

  return (
    <View className='flex-1 justify-center items-center bg-white'>
      <Text className='text-gray-500 mr-40 text-xs'>New picture</Text>
      <View className='rounded-md mb-5 bg-gray-50 px-12 py-2'>
      <Button title="Take New Picture" onPress={navigateToTakePic} />
      </View>
      <Text className='text-gray-500 mr-36 text-xs'>Add from library</Text>
      <View className='bg-gray-50 rounded-md p-3'>

      <Button title="Add an Photo from Library" onPress={pickImage} />
      
      <TextInput
        placeholder="Enter Caption"
        value={captionName}
        onChangeText={(text) => setCaptionName(text)}
        className='mx-5 mb-5'
        />
      
      {selectedImage && (
        <Image
        source={{ uri: selectedImage.assets[0].uri }}
        style={{ width: 200, height: 200 }}
        />
        )}

      <Button title="Save and Upload Photo" onPress={addImageToFirebase} />

      {loading && <ActivityIndicator size="large" color="#0000ff" />}

        </View>
    </View>
  );
};

export default UploadScreen;

