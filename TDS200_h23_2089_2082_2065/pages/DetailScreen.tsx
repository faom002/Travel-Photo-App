import React, { useState, useRef, useEffect } from "react";
import { View, Text, Pressable, TextInput, ScrollView, Image, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { collection, getDocs, addDoc, query, where } from "@firebase/firestore";
import { db } from "../db/firebase";

interface ImageCollection {
  id: string;
  caption: string;
  image: string;
  username: string;
}

interface Comment {
  id: string;
  text: string;
  username: string;
}

interface DetailScreenProps {
  route: any;
}

const DetailScreen: React.FC<DetailScreenProps> = ({ route }) => {
  const { photo } = route.params;

  const [liked, setLiked] = useState(false);
  const [showCommentSection, setShowCommentSection] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const commentInputRef = useRef<TextInput>(null);
  const [imageCollection, setImageCollection] = useState<ImageCollection[]>([]);
  const [currentUser, setCurrentUser] = useState<ImageCollection | null>(null);
    const {user} = route.params;
  useEffect(() => {
    const getTasks = async () => {
      try {
        const tasksCollection = collection(db, "image_collection");
        const tasksSnapshot = await getDocs(tasksCollection);

        const tasksData = tasksSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ImageCollection[];

        setImageCollection(tasksData);

        const foundUser = tasksData.find((item) => item.id === photo.id);
        setCurrentUser(foundUser || null);

        const commentsQuery = query(
          collection(db, "comments"),
          where("imageId", "==", photo.id)
        );

        const commentsSnapshot = await getDocs(commentsQuery);
        const commentsData = commentsSnapshot.docs.map((doc) => doc.data()) as Comment[];

        setComments(commentsData);
      } catch (error) {
        console.error("Error getting tasks", error);
      }
    };

    getTasks();
  }, [photo.id]);

  const handleToggleCommentSection = () => {
    setShowCommentSection((prev) => !prev);
    if (!showCommentSection && commentInputRef.current) {
      commentInputRef.current.focus();
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim() !== "") {
      const newCommentObject: Comment = {
        id: String(Date.now()),
        text: newComment,
        username: currentUser ? user.username : "",
      };

      const commentsRef = collection(db, "comments");
      await addDoc(commentsRef, {
        imageId: photo.id,
        ...newCommentObject,
      });

      setComments((prevComments) => [...prevComments, newCommentObject]);
      setNewComment("");
    }
  };

  const showComment = () => {
    return (
      <View>
        {comments.slice().reverse().map((comment) => (
          <View className="pb-2" key={comment.id}>
            <Text>
              <Text className="font-bold">{comment.username}: </Text>
              {comment.text}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView>
      <View className="bg-white pb-32">
        <Text className="py-5 text-lg font-bold pl-2">
          {currentUser ? currentUser.username : ""}
        </Text>
        <Image className="w-full mx-auto h-96" source={{ uri: photo.image }} />

        <View className="flex-row pl-2 py-2 border-b border-black">
          <Pressable onPress={() => setLiked((isLiked) => !isLiked)}>
            <MaterialCommunityIcons
              name={liked ? "heart" : "heart-outline"}
              size={32}
              color={liked ? "red" : "black"}
            />
          </Pressable>
          <TouchableOpacity
            onPress={handleToggleCommentSection}
            className="pt-0.5 pl-2"
          >
            <MaterialCommunityIcons name={"comment-outline"} size={30} />
          </TouchableOpacity>
        </View>
        <View className="flex-row py-5 text-lg pl-2">
          <Text className="font-bold">
            {currentUser ? currentUser.username : ""}:
          </Text>
          <Text className="mr-20 ml-1">{photo.caption}</Text>
        </View>

        {showCommentSection && (
          <View className="pb-5 pl-2">
            <TextInput
              ref={commentInputRef}
              placeholder="Add a comment..."
              value={newComment}
              onChangeText={(text) => setNewComment(text)}
              onSubmitEditing={handleAddComment}
            />
          </View>
        )}
        <View className="pl-2">{showComment()}</View>
      </View>
    </ScrollView>
  );
};

export default DetailScreen;

