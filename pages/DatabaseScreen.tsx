import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { collection, getDocs } from 'firebase/firestore';
import db from '../db/firebase';

interface Database {
  id: string;
  name: string;
  image: string;
}

const DataBaseScreen = () => {
  const [tasks, setTasks] = useState<Database[]>();

  useEffect(() => {
    const getTasks = async () => {
      try {
        const tasksCollection = collection(db, 'tasks');
        const tasksSnapshot = await getDocs(tasksCollection);

        const tasksData = tasksSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Database[];

        setTasks(tasksData);
      } catch (error) {
        console.error('Error getting tasks', error);
      }
    };

    getTasks();
  }, []); 

  return (
    <View style={styles.container}>
      <Text>Firebase Database Screen</Text>
      {tasks && (
        <View style={styles.centeredContainer}>
          {tasks.map((task) => (
            <View key={task.id} style={styles.itemContainer}>
              <Text>{task.name}</Text>
              <Image source={{ uri: task.image }} style={styles.image} />
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centeredContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 100,
    height: 100,
  },
});

export default DataBaseScreen;
