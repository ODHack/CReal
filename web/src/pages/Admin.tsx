import React, { useEffect, useState } from 'react';
import { db, collection } from '../utils/firebase';
import { getDocs, Timestamp } from 'firebase/firestore';
import formatTimestamp from "../utils/formatTimeStamp";

interface Report {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  timestamp: Timestamp;
  [key: string]: any; // 他のフィールドを含める場合
}

const Admin: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const reportsCollection = collection(db, 'reports');
        const reportSnapshot = await getDocs(reportsCollection);
        const reportList = reportSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Report[];

        setReports(reportList);
      } catch (error) {
        console.error("Error fetching reports: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleMenuToggle = () => {
    setIsMenuVisible(!isMenuVisible);
  };


  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen w-screen">
    <div className="w-3/12 bg-gray-50 p-4 text-black flex justify-center">
      操作メニュー
    </div>
    <div className="pl-4 bg-white w-full">
      <h1>Reports</h1>
      <ul className="flex flex-wrap gap-4">
        {reports.map(report => (
            <li key={report.id} className="flex">
              <div className="bg-gray-50 p-4 rounded-lg shadow-md text-gray-700">
                <img src={report.imageUrl} alt={report.title} className="max-w-xs h-auto" />
                <p className="text-sm text-gray-500">{formatTimestamp(report.timestamp)}</p>
                <h2 className="text-xl font-semibold mb-2">{report.title}</h2>
                <p className="mb-4">{report.description}</p>
                <button
                  onClick={handleMenuToggle}
                  className="bg-blue-500 text-white px-4 py-2 rounded w-full mt-2"
                >
                  コメントを表示
                </button>
              </div>
            </li>
        ))}
      </ul>
    </div>

  </div>
  );
};

export default Admin;
