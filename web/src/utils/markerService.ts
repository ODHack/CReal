import { collection, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { MarkerData } from '../types/markerTypes';

export const fetchMarkersData = async (): Promise<MarkerData[]> => {
  const markersCollection = collection(db, 'reports');
  const markerSnapshot = await getDocs(markersCollection);
  const markerList: MarkerData[] = markerSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title || '',
      description: data.description || '',
      imageUrl: data.imageUrl || '',
      position: {
        lat: data.position.lat,
        lng: data.position.lng,
      },
      comments: data.comments || [],
    };
  });
  return markerList;
};
