import React, { useEffect, useState } from 'react';
import { getAllMeetings, getMeeting } from '../api/meeting';

interface Meeting {
  meeting_id: string;
  title: string;
  meeting_date: string;
  created_at: string;
}

export const MeetingHistory: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      const result = await getAllMeetings();
      // API may return { meetings: [...] } or an array directly
      const list = Array.isArray(result) ? result : result.meetings;
      setMeetings(list || []);
    } catch (error) {
      console.error('Failed to load meetings:', error);
    }
  };

  const handleMeetingSelect = async (meetingId: string) => {
    try {
      const meeting = await getMeeting(meetingId);
      setSelectedMeeting(meeting);
    } catch (error) {
      console.error('Failed to load meeting details:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">회의 히스토리</h2>

      <div className="space-y-2">
        {meetings.map((meeting) => (
          <div
            key={meeting.meeting_id}
            onClick={() => handleMeetingSelect(meeting.meeting_id)}
            className="cursor-pointer p-3 rounded-lg border hover:bg-gray-50"
          >
            <h3 className="font-medium">{meeting.title}</h3>
            <p className="text-sm text-gray-500">
              {new Date(meeting.meeting_date).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {selectedMeeting && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">회의 상세 정보</h3>

          {/* Related Documents */}
          {selectedMeeting.documents && (
            <div className="mb-4">
              <h4 className="font-semibold">관련 문서</h4>
              {selectedMeeting.documents.map((doc: any) => (
                <div key={doc.document_id} className="ml-2 mt-1 text-sm">
                  <p>{doc.document_title}</p>
                  <p className="text-xs text-gray-500">유사도: {doc.similarity_score}</p>
                </div>
              ))}
            </div>
          )}

          {/* Key Insights */}
          {selectedMeeting.insights && (
            <div className="mb-4">
              <h4 className="font-semibold">핵심 인사이트</h4>
              {selectedMeeting.insights.map((insight: any) => (
                <div key={insight.insight_id} className="ml-2 mt-1 text-sm">
                  <p>{insight.insight_text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Final Report */}
          {selectedMeeting.report && (
            <div className="mb-4">
              <h4 className="font-semibold">최종 보고서</h4>
              <p className="whitespace-pre-line text-sm">
                {selectedMeeting.report.report_content}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};