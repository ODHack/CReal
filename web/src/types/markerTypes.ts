import { Timestamp } from 'firebase/firestore';

export interface Comment {
  id: string;
  text: string;
  timestamp: Timestamp;
}

export interface MarkerData {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  position: { lat: number; lng: number };
  comments: Comment[]; // コメントの配列
  solved: boolean;
  disasterType: string;
  damageLevel: string;
  affectedArea: string;
  damageType: string;
  // timestamp: Timestamp;
}

export interface EvacuationMarkerData {
  id: string;
  title: string;
  elvator1f: boolean,
  slope: boolean,
  brailleBlock: boolean,
  WheelchairToilet: boolean,
  position: { lat: number; lng: number };
}

export interface AEDMarkerData {
  id: string;
  title: string;
  place: string;
  position: { lat: number; lng: number };
}

export interface HospitalMarkerData {
  id: string;
  title: string;
  phone: string;
  numberOfBeds: number,
  tertiaryEmergency: boolean,
  position: {
    lat: number;
    lng: number;
  };
}