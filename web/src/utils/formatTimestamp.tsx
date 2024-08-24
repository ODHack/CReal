import { Timestamp } from 'firebase/firestore';

const formatTimeStamp = (timestamp: Timestamp | any) => {
  if (timestamp instanceof Timestamp) {
    const date = timestamp.toDate(); // Firestore Timestamp を Date に変換
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
  return ''; // Timestamp でない場合は空文字を返す
};

export default formatTimeStamp;
