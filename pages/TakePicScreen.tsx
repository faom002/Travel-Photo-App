import { StatusBar } from 'expo-status-bar';
import { TextInput, Text, View, SafeAreaView, Button, Image, ScrollView } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { Camera } from 'expo-camera';
import { shareAsync } from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { addDoc, collection } from '@firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from '@firebase/storage';
import { db, storage } from '../db/firebase';


export default function TakePicScreen({route}) {
  const cameraRef = useRef<Camera | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState<boolean | null>(null);
  const [photo, setPhoto] = useState<{ uri: string } | null>(null);
  const [savedPhotosArray, setSavedPhotosArray] = useState<{ uri: string }[]>([]);
  const [caption, setCaption] = useState('');

  const {user} = route.params;
 useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
      setHasCameraPermission(cameraPermission.status === 'granted');
      setHasMediaLibraryPermission(mediaLibraryPermission.status === 'granted');
    })();
  }, []);

  const renderImagesFromSavedImageArray = () => {
    return savedPhotosArray.map((savedPhoto, index) => (
      <Image
        key={index}
        className='w-12 h-12'
        source={{ uri: savedPhoto.uri }}
      />
    ));
  };

  if (hasCameraPermission === undefined) {
    return <Text>Requesting permission</Text>;
  } else if (!hasCameraPermission) {
    return <Text>Permission for the camera is not granted.</Text>;
  }

  const takePic = async () => {
    const options = {
      quality: 1,
      base64: false,
      exif: false,
    };

    const newPhoto = await cameraRef.current?.takePictureAsync(options);
    if (newPhoto) {
      setPhoto(newPhoto);
    }
  };

  const addImageToFirebase = async () => {
    try {
      if (!photo) {
        console.log('Please take a photo first');
        return;
      }

      const response = await fetch(photo.uri);
      const blob = await response.blob();

      const storageRef = ref(storage, `images/${Date.now()}`);
      await uploadBytes(storageRef, blob);

      const downloadURL = await getDownloadURL(storageRef);

      const newTaskData = {
        image: downloadURL,
        caption: caption,
        username: user.username,
      };

      const tasksCollection = collection(db, 'image_collection');
      await addDoc(tasksCollection, newTaskData);

      console.log('Image added to Firebase:', newTaskData);
      setPhoto(null);
    } catch (error) {
      console.error('Error adding image to Firebase', error);
    }
  };

  if (photo) {
    const sharePic = () => {
      shareAsync(photo.uri).then(() => setPhoto(null));
    };

    const savePhoto = () => {
      MediaLibrary.saveToLibraryAsync(photo.uri).then(() => {
        setSavedPhotosArray([...savedPhotosArray, photo]);
        console.log(savedPhotosArray);
        console.log(savedPhotosArray.length);
        addImageToFirebase();
        setPhoto(null);
      });
    };

    return (
      <SafeAreaView className='flex-1 justify-center items-center'>
        <Image className='items-stretch' source={{ uri: photo.uri }} />
        <Button title='Share' onPress={sharePic} />
        <TextInput
          placeholder="Enter caption..."
          onChangeText={(text) => setCaption(text)}
          value={caption}
        />
        {hasMediaLibraryPermission ? <Button title='Save' onPress={savePhoto} /> : undefined}
        <Button title='Discard' onPress={() => setPhoto(null)} />
        <ScrollView>
          <View className='flex-row flex-wrap'>
            {renderImagesFromSavedImageArray()}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <Camera className='flex-1 justify-center items-center' ref={cameraRef}>
      <View className="flex-1 justify-center items-center absolute bottom-5 bg-gray-100 rounded-md">
        <Button title='Take Photo' onPress={takePic} />
      </View>
      <StatusBar style='auto' />
    </Camera>
  );
}

