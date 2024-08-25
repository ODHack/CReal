import React, { useEffect, useState } from 'react';
import { db, collection, doc, updateDoc } from '../utils/firebase';
import { getDocs, Timestamp } from 'firebase/firestore';
import formatTimestamp from "../utils/formatTimestamp";
import logo from '../assets/CRealLogo.jpg';

interface Report {
  id: string;
  title: string;
  description: string;
  content: string;
  imageUrl: string;
  timestamp: Timestamp;
  solved: boolean;
  disasterType: string;
  damageLevel: string;
  affectedArea: string;
  damageType: string;
  responseAction: string;
}

const Admin: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // Filter criteria states
  const [selectedDisasterType, setSelectedDisasterType] = useState<string>('');
  const [selectedDamageType, setSelectedDamageType] = useState<string>('');
  const [selectedDamageLevel, setSelectedDamageLevel] = useState<string>('');
  const [selectedAffectedArea, setSelectedAffectedArea] = useState<string>('');
  const [selectedResponseAction, setSelectedResponseAction] = useState<string>('');

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
        setFilteredReports(unsolvedReports);
      } catch (error) {
        console.error("Error fetching reports: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  useEffect(() => {
    const applyFilters = () => {
      let filtered = reports;

      if (selectedDisasterType) {
        filtered = filtered.filter(report => report.disasterType === selectedDisasterType);
      }
      if (selectedDamageType) {
        filtered = filtered.filter(report => report.damageType === selectedDamageType);
      }
      if (selectedDamageLevel) {
        filtered = filtered.filter(report => report.damageLevel === selectedDamageLevel);
      }
      if (selectedAffectedArea) {
        filtered = filtered.filter(report => report.affectedArea === selectedAffectedArea);
      }
      if (selectedResponseAction) {
        filtered = filtered.filter(report => report.responseAction === selectedResponseAction);
      }

      setFilteredReports(filtered);
    };

    applyFilters();
  }, [selectedDisasterType, selectedDamageType, selectedDamageLevel, selectedAffectedArea, selectedResponseAction, reports]);

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
        setFilteredReports(filteredReports.filter(report => report.id !== selectedReport.id));
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
    <div className="flex min-h-screen w-screen bg-gray-100">
      <div className="w-3/12 flex flex-col justify-start bg-gray-100">
        <div className="mt-8 flex justify-center mb-4">
          <img src={logo} alt="サービスのロゴ" className="w-32 h-auto" />
        </div>
        <div className="p-4 text-gray-700">
          <h2 className="text-xl font-semibold mb-2">フィルタ</h2>
          <div className="mb-4">
            <label className="block font-semibold mb-1">災害タイプ:</label>
            <select
              value={selectedDisasterType}
              onChange={(e) => setSelectedDisasterType(e.target.value)}
              className="border p-2 rounded w-full bg-white"
            >
              <option value="">すべて</option>
              <option value="地震">地震</option>
              <option value="大雨">大雨</option>
              <option value="台風">台風</option>
              <option value="雷">雷</option>
              <option value="雪害">雪害</option>
              <option value="火事">火事</option>
              <option value="土砂崩れ">土砂崩れ</option>
              <option value="その他">その他</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1">被害の程度:</label>
            <select
              value={selectedDamageLevel}
              onChange={(e) => setSelectedDamageLevel(e.target.value)}
              className="border p-2 rounded w-full bg-white"
            >
              <option value="">すべて</option>
              <option value="軽度">軽度</option>
              <option value="中程度">中程度</option>
              <option value="重大">重大</option>
              <option value="壊滅的">壊滅的</option>
              <option value="その他">その他</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1">被害の種類:</label>
            <select
              value={selectedDamageType}
              onChange={(e) => setSelectedDamageType(e.target.value)}
              className="border p-2 rounded w-full bg-white"
            >
              <option value="">すべて</option>
              <option value="建物損壊">建物損壊</option>
              <option value="インフラ障害">インフラ障害</option>
              <option value="停電">停電</option>
              <option value="水害">水害</option>
              <option value="交通障害">交通障害</option>
              <option value="通信障害">通信障害</option>
              <option value="その他">その他</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1">影響を受けたエリア:</label>
            <select
              value={selectedAffectedArea}
              onChange={(e) => setSelectedAffectedArea(e.target.value)}
              className="border p-2 rounded w-full bg-white"
            >
              <option value="">すべて</option>
              <option value="住宅地">住宅地</option>
              <option value="商業地">商業地</option>
              <option value="公共施設">公共施設</option>
              <option value="交通機関">交通機関</option>
              <option value="農業地域">農業地域</option>
              <option value="山間部">山間部</option>
              <option value="その他">その他</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1">求める対策や対応:</label>
            <select
              value={selectedResponseAction}
              onChange={(e) => setSelectedResponseAction(e.target.value)}
              className="border p-2 rounded w-full bg-white"
            >
              <option value="">すべて</option>
              <option value="救援活動">救援活動</option>
              <option value="避難指示">避難指示</option>
              <option value="復旧活動">復旧活動</option>
              <option value="支援物資">支援物資</option>
              <option value="警報発令">警報発令</option>
              <option value="通行止め">通行止め</option>
              <option value="その他">その他</option>
            </select>
          </div>
        </div>
      </div>
      <div className="pl-4 bg-white w-full">
        <ul className="flex flex-wrap gap-4 mt-8 mb-8">
          {filteredReports.map(report => (
            <li key={report.id} className="flex">
              <div className="flex flex-col justify-between bg-gray-50 p-4 rounded-lg shadow-md text-gray-700 w-80">
                <div>
                  <div className="flex items-center justify-center mb-4">
                    <img src={report.imageUrl} alt={report.title} className="w-48 h-48 object-cover rounded-lg" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">{report.title}</h2>
                  <p className="mb-2">発生日時: {formatTimestamp(report.timestamp)}</p>
                  <p className="mb-2">災害タイプ: {report.disasterType}</p>
                  <p className="mb-2">被害の種類: {report.damageType}</p>
                  <p className="mb-2">被害の程度: {report.damageLevel}</p>
                  <p className="mb-2">影響を受けたエリア: {report.affectedArea}</p>
                  <p className="mb-2">求める対応: {report.responseAction}</p>
                  <p className="mb-4">{report.description}</p>
                </div>
                <button
                  onClick={() => handleSolveClick(report)}
                  className="mt-auto bg-green-500 text-white p-2 rounded hover:bg-green-700 transition-colors duration-200"
                >
                  対応完了
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <p className="text-gray-700">本当に対応完了にしてよろしいでしょうか？</p>
              <div className="mt-4">
                <button
                  onClick={handleConfirmSolve}
                  className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded mr-2"
                >
                  対応完了
                </button>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default Admin;
