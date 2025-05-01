// src/api/meeting.ts

interface MeetingData {
    meeting_id: string;
    title: string;
    meeting_date: string;
    stt_text: string;
  }
  
  interface Document {
    document_id: string;
    title: string;
    file_path: string;
    similarity_score: number;
  }
  
  interface Insight {
    insight_id: string;
    text: string;
  }
  
  interface Report {
    report_id: string;
    content: string;
  }
  
  export const uploadMeeting = async (
    audioFile: File,
    title: string,
    meetingDate: string,
    onDocumentsUpdate: (documents: Document[]) => void,
    onInsightsUpdate: (insights: Insight[]) => void,
    onReportUpdate: (report: Report) => void
  ): Promise<MeetingData> => {
    const formData = new FormData();
    formData.append('audio_file', audioFile);
    formData.append('title', title);
    formData.append('meeting_date', meetingDate);
  
    const response = await fetch('http://localhost:8000/api/meeting/upload', {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
  
    // WebSocket 연결 설정
    const ws = new WebSocket(`ws://localhost:8000/ws/${data.meeting_id}`);
  
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case 'documents':
          onDocumentsUpdate(message.data);
          break;
        case 'insights':
          onInsightsUpdate(message.data);
          break;
        case 'report':
          onReportUpdate(message.data);
          break;
      }
    };
  
    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };
  
    ws.onclose = () => {
      console.log('WebSocket Connection Closed');
    };
  
    return data;
  };
  
  export const getMeeting = async (meetingId: string) => {
    const response = await fetch(`http://localhost:8000/api/meeting/${meetingId}`);
    return await response.json();
  };
  
  export const getAllMeetings = async () => {
    const response = await fetch('http://localhost:8000/api/meetings');
    return await response.json();
  };