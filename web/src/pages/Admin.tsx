import React, { useEffect, useState } from 'react';
import { db, collection, doc, updateDoc } from '../utils/firebase';
import { getDocs, Timestamp } from 'firebase/firestore';
import formatTimestamp from "../utils/formatTimestamp";
import logo from '../assets/CRealLogo.jpg';

interface Report {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  timestamp: Timestamp;
  solved: boolean;
}

const Admin: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const reportsCollection = collection(db, 'reports');
        const reportSnapshot = await getDocs(reportsCollection);
        const reportList = reportSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Report[];

        // Filter reports to only include those where solved is false
        const unsolvedReports = reportList.filter(report => !report.solved);

        setReports(unsolvedReports);
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

  const handleSolveClick = (report: Report) => {
    setSelectedReport(report);
  };

  const handleConfirmSolve = async () => {
    if (selectedReport) {
      try {
        const reportRef = doc(db, 'reports', selectedReport.id);
        await updateDoc(reportRef, { solved: true });

        // Update the local state to remove the solved report
        setReports(reports.filter(report => report.id !== selectedReport.id));
      } catch (error) {
        console.error("Error updating report: ", error);
      } finally {
        setSelectedReport(null);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen w-screen">
      <div className="w-3/12 flex justify-center bg-gray-100">
        <img src={logo} alt="サービスのロゴ" className="w-32 h-auto object-contain" />
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
                <p className="mb-4">{report.content}</p>
                <button
                  onClick={handleMenuToggle}
                  className="bg-blue-500 text-white px-4 py-2 rounded w-full mt-2"
                >
                  コメントを表示
                </button>
                <button
                  onClick={() => handleSolveClick(report)}
                  className="bg-green-500 text-white px-4 py-2 rounded w-full mt-2"
                  disabled={report.solved}
                >
                  {report.solved ? "対応済み" : "対応完了"}
                </button>
              </div>
            </li>
          ))}
        </ul>
        {selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <p className="text-gray-700">本当に対応完了にしてよろしいでしょうか？</p>
              <div className="mt-4">
                <button
                  onClick={handleConfirmSolve}
                  className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                >
                  はい
                </button>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
