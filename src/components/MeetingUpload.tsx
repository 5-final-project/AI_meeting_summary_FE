// src/components/MeetingUpload.tsx

import React, { useState } from 'react';
import { uploadMeeting } from '../api/meeting';

interface MeetingUploadProps {
  onUploadComplete: (meetingId: string) => void;
}

export const MeetingUpload: React.FC<MeetingUploadProps> = ({ onUploadComplete }) => {
  const [title, setTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile) return;

    setIsUploading(true);
    try {
      const result = await uploadMeeting(
        audioFile,
        title,
        meetingDate,
        (documents) => {
          // 관련 문서 UI 업데이트
          console.log('Documents updated:', documents);
        },
        (insights) => {
          // 인사이트 UI 업데이트
          console.log('Insights updated:', insights);
        },
        (report) => {
          // 보고서 UI 업데이트
          console.log('Report updated:', report);
        }
      );
      onUploadComplete(result.meeting_id);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="회의 제목"
        required
      />
      <input
        type="datetime-local"
        value={meetingDate}
        onChange={(e) => setMeetingDate(e.target.value)}
        required
      />
      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
        required
      />
      <button type="submit" disabled={isUploading}>
        {isUploading ? '업로드 중...' : '업로드'}
      </button>
    </form>
  );
};