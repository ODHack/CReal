import { db, storage } from '../utils/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const uploadImageToStorage = async (file: File) => {
  const storageRef = ref(storage, `images/${file.name}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return url;
};

export const addReportToFirestore = async (title: string, description: string, position: { lat: number; lng: number } | null, imageUrl: string | null) => {
  return addDoc(collection(db, 'reports'), {
    title,
    description,
    position,
    imageUrl,
    timestamp: new Date()
  });
};
