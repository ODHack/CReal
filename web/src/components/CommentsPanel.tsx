import React, { useState } from 'react';
import { db } from '../utils/firebase'; // Firebase設定をインポート
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { MarkerData } from '../types/markerTypes';
import formatTimestamp from "../utils/formatTimestamp";
import { FaSpinner } from 'react-icons/fa';

interface CommentsPanelProps {
  selectedMarker: MarkerData;
  updateSelectedMarker: (updatedMarker: MarkerData) => void;
  handleMenuToggle: () => void;
}

const CommentsPanel: React.FC<CommentsPanelProps> = ({ selectedMarker, updateSelectedMarker, handleMenuToggle }) => {
  const [comment, setComment] = useState(''); // コメントの状態管理
  const [loading, setLoading] = useState(false);

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  };

  const handleCommentSubmit = async () => {
    setLoading(true);

    if (comment.trim() === '') return; // 空のコメントは送信しない

    const newComment = {
      id: Date.now().toString(), // 一意の ID を生成（サンプルとして現在のタイムスタンプを使用）
      text: comment,
      timestamp: Timestamp.now()
    };

    try {
      // Firestoreの "reports" コレクション内の該当するマーカーを更新
      const markerDocRef = doc(db, 'reports', selectedMarker.id); // `reports` コレクションの該当するドキュメント参照を取得
      await updateDoc(markerDocRef, {
        comments: [...selectedMarker.comments, newComment] // コメントの配列を更新
      });

      // UI 更新のために selectedMarker を更新
      updateSelectedMarker({
        ...selectedMarker,
        comments: [...selectedMarker.comments, newComment] // コメントの配列を更新
      });

      setComment(''); // 送信後に入力欄をクリア
    } catch (error) {
      console.error('Error updating marker comments: ', error);
    }

    setLoading(false);
  };

  return (
    <div className="menu" style={{ position: 'absolute', right: 0, top: 0, width: '300px', height: '100%', backgroundColor: 'white' }}>
      <div className="text-gray-700 p-4" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <h3 className="text-lg font-bold mb-2">コメント</h3>
        <div className="comments-list mb-4" style={{ flex: 1, overflowY: 'auto', maxHeight: 'calc(100% - 150px)' }}>
          {selectedMarker.comments.length > 0 ? (
            selectedMarker.comments.map((comment) => (
              <div key={comment.id} className="comment-item border-b border-gray-300 py-2">
                <p className="text-gray-600 text-sm">{formatTimestamp(comment.timestamp)}</p>
                <p>{comment.text}</p>
              </div>
            ))
          ) : (
            <p>コメントはまだありません。</p>
          )}
        </div>
        <textarea
          value={comment}
          onChange={handleCommentChange}
          placeholder="コメントを入力してください..."
          className="w-full h-32 p-2 border rounded mb-2 bg-white text-gray-700"
        />
        <button
          onClick={handleCommentSubmit}
          className={`${loading ? 'bg-orange-500' : 'bg-blue-500 hover:bg-blue-700'} text-white px-4 py-2 rounded w-full mt-2 flex items-center justify-center`}
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              送信中...
            </>
          ) : (
            '送信'
          )}
        </button>
      </div>
    </div>
  );
};

export default CommentsPanel;
