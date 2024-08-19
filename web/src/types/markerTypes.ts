export interface Comment {
  id: string;
  text: string;
  timestamp: Date;
}

export interface MarkerData {
  id: string;
  title: string;
  description: string;
  position: { lat: number; lng: number };
  comments: Comment[]; // コメントの配列
}