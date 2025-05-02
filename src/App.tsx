import React, { useState, useEffect, useRef } from 'react';
import { Mic, Check, MicOff, Clock, Users, Award } from 'lucide-react'; // Removed Zap, Sparkles, BrainCircuit
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
// Removed MeetingListItem import
import MeetingListSidebar from './components/organisms/MeetingListSidebar'; // Import the new organism
import AppHeader from './components/organisms/AppHeader'; // Import AppHeader
import ProcessStepsBar from './components/organisms/ProcessStepsBar'; // Import ProcessStepsBar
import RightSidebar from './components/organisms/RightSidebar'; // Import RightSidebar
import RealtimeVisualization from './components/organisms/RealtimeVisualization'; // Import RealtimeVisualization
import MeetingForm, { MeetingInfo } from './components/organisms/MeetingForm';
import { getAllMeetings, getMeeting } from './api/meeting';

// Meeting 타입을 export하여 다른 컴포넌트에서 사용할 수 있게 함
export type Meeting = {
  id: string;
  title: string;
  date: Date;
  duration?: number; // duration을 선택적으로 변경
  isSelected: boolean;
  insightScore?: number; // 인사이트 점수 추가
};

type Document = {
  id: string;
  title: string;
  date: Date;
  type: string;
  relevanceScore?: number; // 연관성 점수 추가
};

type ProcessStep = {
  id: number;
  title: string;
  status: 'pending' | 'processing' | 'completed';
};

type KeyInsight = {
  id: string;
  text: string;
  timestamp: number;
  confidence: number;
};

const App: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [processingStarted, setProcessingStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showDocumentPanel, setShowDocumentPanel] = useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeetingData, setSelectedMeetingData] = useState<any>(null);
  // 실시간 AI 관련 상태
  const [liveKeywords, setLiveKeywords] = useState<string[]>([]);
  const [keyInsights, setKeyInsights] = useState<KeyInsight[]>([]);
  const [sentimentData, setSentimentData] = useState<number[]>([]);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [aiHighlightMode, setAiHighlightMode] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);

  const [documents, setDocuments] = useState<Document[]>([]);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [PDFGenerating, setPDFGenerating] = useState(false);

  const steps: ProcessStep[] = [
    { id: 1, title: '녹음 내용 변환', status: 'pending' },
    { id: 2, title: '관련 문서 탐색', status: 'pending' },
    { id: 3, title: 'LLM 정리', status: 'pending' },
    { id: 4, title: '보고서 작성', status: 'pending' },
    { id: 5, title: '완료', status: 'pending' },
  ];

  const [processSteps, setProcessSteps] = useState<ProcessStep[]>(steps);
  const intervalRef = useRef<number | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null); // For waveform animation

  const [meetingInfo, setMeetingInfo] = useState<MeetingInfo>({
    title: '',
    department: '',
    participants: ''
  });

  const isMeetingInfoValid = () => {
    return meetingInfo.title.trim() !== '' && 
           meetingInfo.department.trim() !== '' && 
           meetingInfo.participants.trim() !== '';
  };

  const handleMeetingInfoChange = (info: MeetingInfo) => {
    setMeetingInfo(info);
  };

  // 음성 파형 시각화 효과 (requestAnimationFrame 사용)
  useEffect(() => {
    if (isRecording && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const renderWaveform = () => {
        if (!isRecording) return; // Stop animation if not recording

        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = 'rgba(59, 130, 246, 0.7)'; // Blue color

        const bars = 50; // Number of bars
        const barWidth = width / bars - 2; // Width of each bar with spacing
        const maxBarHeight = height * 0.8; // Max height relative to canvas height
        const centerY = height / 2;

        for (let i = 0; i < bars; i++) {
          // Simulate varying amplitude
          const amplitude = Math.random();
          const barHeight = amplitude * maxBarHeight + height * 0.1; // Add a base height
          const x = i * (barWidth + 2);
          const y = centerY - barHeight / 2;

          ctx.fillRect(x, y, barWidth, barHeight);
        }

        animationFrameRef.current = requestAnimationFrame(renderWaveform);
      };

      renderWaveform(); // Start the animation loop

      return () => {
        // Cleanup: cancel the animation frame when effect unmounts or recording stops
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        // Clear canvas on stop
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      };
    } else {
      // Ensure animation stops if isRecording becomes false
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Clear canvas if it exists
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, [isRecording]); // Rerun effect when isRecording changes

  // 실시간 키워드 & 감정 분석 효과
  useEffect(() => {
    let keywordTimer: number | null = null;
    let sentimentTimer: number | null = null;

    if (isRecording) {
      // TODO: 실제 서버 연동 시 구현 필요
      // 1. WebSocket 연결 설정
      // const ws = new WebSocket(`${WS_BASE_URL}/api/meetings/realtime-analysis`);
      // 
      // ws.onopen = () => {
      //   console.log('WebSocket 연결됨');
      // };
      // 
      // ws.onmessage = (event) => {
      //   const data = JSON.parse(event.data);
      //   
      //   // 실시간 키워드 업데이트
      //   if (data.type === 'keyword') {
      //     setLiveKeywords(prev => [...prev.slice(-5), data.keyword]);
      //   }
      //   
      //   // 실시간 감정 분석 업데이트
      //   if (data.type === 'sentiment') {
      //     setSentimentData(prev => [...prev.slice(-29), data.score]);
      //   }
      // };
      // 
      // ws.onerror = (error) => {
      //   console.error('WebSocket 에러:', error);
      // };
      // 
      // ws.onclose = () => {
      //   console.log('WebSocket 연결 종료');
      // };
      
      // 데모용 더미 데이터 생성 코드
      const keywordBank = [
        "목표 달성", "매출 증가", "사용자 경험", "개발 일정", "기능 개선",
        "프로토타입", "고객 피드백", "성능 최적화", "리소스 배분", "마케팅 전략"
      ];

      keywordTimer = window.setInterval(() => {
        if (Math.random() > 0.6) {
          const newKeyword = keywordBank[Math.floor(Math.random() * keywordBank.length)];
          setLiveKeywords(prev => [...prev.slice(-5), newKeyword]);
        }
      }, 1500);

      sentimentTimer = window.setInterval(() => {
        setSentimentData(prev => {
          const newValue = Math.random() * 0.6 + 0.4;
          return [...prev.slice(-29), newValue];
        });
      }, 800);

      return () => {
        if (keywordTimer) clearInterval(keywordTimer);
        if (sentimentTimer) clearInterval(sentimentTimer);
        // TODO: 실제 서버 연동 시 구현 필요
        // ws.close();
      };
    } else {
      setLiveKeywords([]);
    }
  }, [isRecording]);

  // Recording Timer
  useEffect(() => {
    if (isRecording) {
      intervalRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording]);

  // PDF Preview Scroll
  useEffect(() => {
    if (currentStep >= 5 && previewRef.current) {
      previewRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentStep, PDFGenerating]);

  const handleRecordToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      setProcessingStarted(true);
      startProcessingSteps();
      
      // TODO: 실제 서버 연동 시 구현 필요
      // 1. 녹음 중지 및 오디오 데이터 수집
      // mediaRecorder?.stop();
      // const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      
      // 2. FormData 생성 및 서버 전송
      // const formData = new FormData();
      // formData.append('audio', audioBlob);
      // formData.append('meetingInfo', JSON.stringify(meetingInfo));
      
      // 3. API 호출
      // try {
      //   const response = await fetch('${API_BASE_URL}/api/meetings/process', {
      //     method: 'POST',
      //     body: formData
      //   });
      //   const data = await response.json();
      //   // 서버로부터 받은 회의 ID 저장
      //   const meetingId = data.meetingId;
      // } catch (error) {
      //   setError('회의 데이터 전송 중 오류가 발생했습니다.');
      // }

      console.log('Sending meeting info to server:', meetingInfo);
    } else {
      // 녹음 전 회의 정보 입력 모달 표시
      setShowMeetingModal(true);
    }
  };

  // 모달에서 호출되는 실제 녹음 시작 로직
  const startRecording = () => {
    // 녹음 시작 시 회의 카드 생성
    const newMeeting: Meeting = {
      id: `meeting-${Date.now()}`, // 임시 ID 생성 (서버에서 실제 ID 부여 예정)
      title: meetingInfo.title,
      date: new Date(),
      isSelected: true, // 새 회의 카드를 선택 상태로 설정
    };
    
    // 새 회의를 목록에 추가하고 기존 선택된 회의는 선택 해제
    setMeetings(prev => [
      newMeeting,
      ...prev.map(meeting => ({
        ...meeting,
        isSelected: false // 기존 선택된 회의는 모두 선택 해제
      }))
    ]);
    
    // 녹음 상태 설정
    setIsRecording(true);
    setRecordingTime(0);
    setProcessingStarted(false);
    setCurrentStep(0);
    setPDFGenerating(false);
    setShowDocumentPanel(false);
    setShowAIInsights(false);
    setKeyInsights([]);
    setSentimentData([]);
    setLiveKeywords([]);
    setAiHighlightMode(false);
    setProcessSteps(steps.map(step => ({ ...step, status: 'pending' })));
    
    // 회의 정보 모달 닫기
    setShowMeetingModal(false);
  };

  const startProcessingSteps = () => {
    updateStepStatus(1, 'processing');
    setCurrentStep(1);

    // TODO: 실제 서버 연동 시 구현 필요
    // 1. STT 변환 상태 확인
    // const checkSTTStatus = async (meetingId: string) => {
    //   const response = await fetch(`${API_BASE_URL}/api/meetings/${meetingId}/stt-status`);
    //   return response.json();
    // };

    setTimeout(() => {
      updateStepStatus(1, 'completed');
      updateStepStatus(2, 'processing');
      setCurrentStep(2);

      // TODO: 실제 서버 연동 시 구현 필요
      // 2. 관련 문서 검색 결과 수신
      // const fetchRelatedDocuments = async (meetingId: string) => {
      //   const response = await fetch(`${API_BASE_URL}/api/meetings/${meetingId}/related-documents`);
      //   const documents = await response.json();
      //   setDocuments(documents);
      // };

      setDocuments([
        { id: 'd1', title: '마케팅_전략_보고서.pdf', date: new Date(2025, 3, 25), type: 'marketing', relevanceScore: 0.92 },
        { id: 'd2', title: '제품_개발_요약.pdf', date: new Date(2025, 3, 26), type: 'product', relevanceScore: 0.87 },
        { id: 'd3', title: '예산_분석_보고서.pdf', date: new Date(2025, 3, 22), type: 'finance', relevanceScore: 0.63 },
        { id: 'd4', title: '경쟁사_분석_자료.docx', date: new Date(2025, 3, 20), type: 'research', relevanceScore: 0.78 },
      ]);

      setTimeout(() => {
        updateStepStatus(2, 'completed');
        setShowDocumentPanel(true);
        updateStepStatus(3, 'processing');
        setCurrentStep(3);

        // TODO: 실제 서버 연동 시 구현 필요
        // 3. LLM 분석 결과 수신
        // const fetchLLMAnalysis = async (meetingId: string) => {
        //   const response = await fetch(`${API_BASE_URL}/api/meetings/${meetingId}/llm-analysis`);
        //   const analysis = await response.json();
        //   setKeyInsights(analysis.insights);
        //   // 추가 분석 데이터 설정...
        // };

        setTimeout(() => {
          updateStepStatus(3, 'completed');
          setShowAIInsights(true);
          setKeyInsights([
            { id: '1', text: "제품 출시 일정을 2주 앞당겨 6월 첫째 주로 변경", timestamp: 124, confidence: 0.92 },
            { id: '2', text: "사용자 테스트에서 발견된 UI 문제 해결이 최우선 과제", timestamp: 342, confidence: 0.87 },
            { id: '3', text: "마케팅 예산 15% 증액하여 소셜미디어 캠페인 강화", timestamp: 517, confidence: 0.95 }
          ]);
          updateStepStatus(4, 'processing');
          setCurrentStep(4);

          // TODO: 실제 서버 연동 시 구현 필요
          // 4. 보고서 생성 상태 확인
          // const checkReportStatus = async (meetingId: string) => {
          //   const response = await fetch(`${API_BASE_URL}/api/meetings/${meetingId}/report-status`);
          //   return response.json();
          // };

          setTimeout(() => {
            updateStepStatus(4, 'completed');
            updateStepStatus(5, 'processing');
            setPDFGenerating(true);
            setAiHighlightMode(true);
            setCurrentStep(5);

            // TODO: 실제 서버 연동 시 구현 필요
            // 5. 최종 보고서 다운로드
            // const downloadReport = async (meetingId: string) => {
            //   const response = await fetch(`${API_BASE_URL}/api/meetings/${meetingId}/report-download`);
            //   const blob = await response.blob();
            //   // 보고서 다운로드 처리...
            // };

            setTimeout(() => {
              updateStepStatus(5, 'completed');
              setMenuOpen(null);
            }, 2000);
          }, 4000);
        }, 5000);
      }, 5000);
    }, 2000);
  };

  const updateStepStatus = (stepId: number, status: 'pending' | 'processing' | 'completed') => {
    setProcessSteps(prev =>
      prev.map(step => step.id === stepId ? { ...step, status } : step)
    );
  };

  const handleMenuToggle = (id: string) => {
    setMenuOpen(menuOpen === id ? null : id);
  };

  const handleMeetingSelect = async (id: string) => {
    setMeetings(meetings.map(meeting => ({
      ...meeting,
      isSelected: meeting.id === id
    })));

    try {
      const data = await getMeeting(id);
      setSelectedMeetingData(data);

      // 관련 문서 처리
      const docs = (data.documents || []).map((doc: any) => ({
        id: doc.document_id,
        title: doc.document_title,
        date: new Date(data.meeting.meeting_date),
        type: inferDocumentType(doc.document_file_path),
        relevanceScore: doc.similarity_score,
      }));
      setDocuments(docs);
      setShowDocumentPanel(docs.length > 0);

      // 핵심 인사이트 처리
      const insights = (data.insights || []).map((ins: any, idx: number) => ({
        id: ins.insight_id || String(idx),
        text: ins.insight_text,
        timestamp: 0,
        confidence: 0.9,
      }));
      setKeyInsights(insights);
      setShowAIInsights(insights.length > 0);

      // 보고서
      if (data.report) {
        setPDFGenerating(false);
        setAiHighlightMode(false);
      }
    } catch (error) {
      console.error('회의 상세 정보 불러오기 실패:', error);
    }
  };

  // 파일 경로를 기반으로 문서 타입 추론 (단순 버전)
  const inferDocumentType = (path: string): string => {
    if (!path) return 'other';
    if (path.includes('marketing')) return 'marketing';
    if (path.includes('product')) return 'product';
    if (path.includes('finance')) return 'finance';
    return 'other';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Function to get color based on sentiment value
  const getSentimentColor = (value: number) => {
    if (value > 0.8) return 'bg-green-500';
    if (value > 0.6) return 'bg-blue-500';
    if (value > 0.4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Function to get size based on relevance score
  const getDocumentNodeSize = (score: number = 0.5) => {
    return 20 + score * 40; // Base size 20, max additional 40
  };

  // Add the delete handler function
  const handleDeleteMeeting = (id: string) => {
    setMeetings(prevMeetings => prevMeetings.filter(m => m.id !== id));
    setMenuOpen(null); // Close the menu after deleting
  };

  // Add the reset handler function
  const handleReset = () => {
    setIsRecording(false);
    setProcessingStarted(false);
    setCurrentStep(0);
    setPDFGenerating(false);
    setShowDocumentPanel(false);
    setShowAIInsights(false);
    setKeyInsights([]);
    setSentimentData([]);
    setLiveKeywords([]);
    setAiHighlightMode(false);
    setProcessSteps(steps.map(step => ({ ...step, status: 'pending' })));
    // Optionally re-select the current meeting or default
  };

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const result = await getAllMeetings();
        const list = Array.isArray(result) ? result : result.meetings;
        const mapped: Meeting[] = (list || []).map((m: any, idx: number) => ({
          id: m.meeting_id ?? m.id ?? String(idx),
          title: m.title,
          date: new Date(m.meeting_date || m.date || Date.now()),
          duration: m.duration ?? 0,
          isSelected: idx === 0, // 첫 번째 회의를 기본 선택
          insightScore: m.insightScore ?? undefined,
        }));
        setMeetings(mapped);
      } catch (error) {
        console.error('회의 목록 불러오기 실패:', error);
      }
    };

    fetchMeetings();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      {/* Use MeetingListSidebar Organism */}
      <MeetingListSidebar
        meetings={meetings}
        menuOpenId={menuOpen}
        onSelectMeeting={handleMeetingSelect}
        onToggleMenu={handleMenuToggle}
        onDeleteMeeting={handleDeleteMeeting}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col overflow-hidden relative transition-all duration-300 ${showDocumentPanel ? 'mr-72' : ''}`}>
        {/* Use AppHeader Organism */}
        <AppHeader
          isRecording={isRecording}
          recordingTime={recordingTime}
          processingStarted={processingStarted}
          aiHighlightMode={aiHighlightMode}
          onToggleAiHighlight={() => setAiHighlightMode(!aiHighlightMode)}
          formatTime={formatTime}
        />

        {/* Use ProcessStepsBar Organism */}
        <ProcessStepsBar processSteps={processSteps} />

        {/* Main Scrollable Area */}
        <div className="flex-1 p-6 lg:p-8 overflow-auto bg-gray-50">
          <div className="max-w-6xl mx-auto">

            {/* Show meeting form when not recording or processing */}
            {/* Meeting form moved to modal */}
            {/* 
            {!isRecording && !PDFGenerating && !processingStarted && (
              selectedMeetingData
                ? null
                : (
                  <MeetingForm
                    meetingInfo={meetingInfo}
                    onMeetingInfoChange={handleMeetingInfoChange}
                    isValid={isMeetingInfoValid()}
                  />
                )
            )}
            */}

            {/* Use RealtimeVisualization Organism */}
            {isRecording && (
              <RealtimeVisualization
                canvasRef={canvasRef}
                liveKeywords={liveKeywords}
              />
            )}

            {/* AI Insights Panel (Post-Recording) */}
            <AnimatePresence>
              {showAIInsights && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="mb-8"
                >
                  <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-2xl shadow-lg border border-blue-100 p-6">
                    <h2 className="text-xl font-semibold text-blue-800 mb-5 flex items-center">
                      <Award size={22} className="mr-2.5 text-blue-600" />
                      <span>AI 핵심 인사이트 요약</span>
                    </h2>

                    {/* Key Insights List */}
                    <div className="space-y-4 mb-6">
                      {keyInsights.map((insight, index) => (
                        <motion.div
                          key={insight.id}
                          initial={{ x: -30, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: index * 0.15, type: 'spring', stiffness: 150, damping: 20 }}
                          className="bg-white bg-opacity-80 backdrop-blur-sm rounded-xl p-4 border border-blue-200 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <div className="text-sm text-blue-700 font-medium flex items-center">
                              <Clock size={14} className="mr-1.5" />
                              <span>{formatTime(insight.timestamp)} 지점</span>
                            </div>
                            <div className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-xs font-semibold">
                              신뢰도: {Math.round(insight.confidence * 100)}%
                            </div>
                          </div>
                          <p className="text-gray-800 text-base">{insight.text}</p>
                        </motion.div>
                      ))}
                    </div>

                    {/* Sentiment Analysis Graph */}
                    <div className="mt-8">
                      <h3 className="text-base font-medium text-gray-700 mb-3">회의 분위기 타임라인</h3>
                      <div className="h-28 w-full bg-white rounded-lg p-4 border border-gray-200 flex items-end justify-start space-x-1 overflow-hidden">
                        {sentimentData.map((value, index) => (
                          <motion.div
                            key={index}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: `${value * 90}%`, opacity: 1 }} // Use percentage for responsiveness
                            transition={{ duration: 0.3, delay: index * 0.02 }}
                            className={`w-1.5 rounded-t ${getSentimentColor(value)}`}
                            title={`Sentiment: ${value.toFixed(2)}`} // Tooltip for value
                          />
                        ))}
                        {sentimentData.length === 0 && (
                          <p className="text-sm text-gray-400 self-center w-full text-center">감정 데이터 없음</p>
                        )}
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
                        <span>긍정적</span>
                        <span>중립</span>
                        <span>부정적</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Current Step Details */}
            <AnimatePresence>
              {processingStarted && !isRecording && currentStep > 0 && currentStep <= steps.length && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="mb-8"
                >
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">현재 진행 단계</h2>
                    {processSteps.filter(step => step.id === currentStep).map((step) => (
                      <div key={step.id} className="flex items-center mb-4">
                        <div
                          className={`flex items-center justify-center w-11 h-11 rounded-full mr-4 text-white
                            ${step.status === 'processing' ? 'bg-blue-500' : 'bg-green-500'}`}
                        >
                          {step.status === 'processing' ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                            />
                          ) : (
                            <Check size={22} strokeWidth={3} />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {step.title}
                            {step.status === 'processing' && (
                              <span className="ml-2 text-sm text-blue-600 font-medium animate-pulse">진행 중...</span>
                            )}
                            {step.status === 'completed' && (
                              <span className="ml-2 text-sm text-green-600 font-medium">완료</span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {step.id === 1 && "음성 데이터를 텍스트로 변환하고 있습니다."}
                            {step.id === 2 && "회의 내용과 관련된 문서를 탐색하고 분석합니다."}
                            {step.id === 3 && "AI 모델을 통해 회의 내용을 요약 및 정리합니다."}
                            {step.id === 4 && "분석된 내용을 바탕으로 보고서 초안을 작성 중입니다."}
                            {step.id === 5 && "최종 보고서 문서를 생성하고 있습니다."}
                          </p>
                        </div>
                      </div>
                    ))}
                    {/* Progress Bar */}
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-4">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                        initial={{ width: "0%" }}
                        animate={{
                          width: `${(currentStep / processSteps.length) * 100}%`
                        }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* PDF Preview Area */}
            <div
              ref={previewRef} // Ref for scrolling
              className={`bg-white rounded-2xl shadow-xl border border-gray-200 p-8 min-h-[600px] relative transition-all duration-300 ${aiHighlightMode ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`}
            >
              {/* Placeholder for initial state or when not generating */}
              {!isRecording && !PDFGenerating && !processingStarted && !selectedMeetingData?.report && (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
                    <Users size={56} className="text-gray-400 mb-4" />
                  </motion.div>
                  <p className="text-gray-600 text-lg font-medium mb-2">회의를 시작하려면 녹음 버튼을 누르세요.</p>
                  <p className="text-sm text-gray-400">녹음 후 AI가 자동으로 회의 내용을 분석하고 보고서를 생성합니다.</p>
                </div>
              )}

              {/* Content shown during PDF Generation */}
              {PDFGenerating && (
                <div className="relative prose prose-sm max-w-none">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className={`text-3xl font-bold text-gray-900 mb-2 ${aiHighlightMode ? 'text-blue-700' : ''}`}>제품 개발 미팅 보고서</h2>
                    <p className="text-gray-500 mb-8 text-base">{format(new Date(), 'yyyy년 M월 d일', { locale: ko })}</p>

                    {/* Placeholder Content with AI Highlight */}
                    <h3 className={`font-semibold mb-3 ${aiHighlightMode ? 'text-blue-600 bg-blue-50 px-1 rounded' : 'text-gray-800'}`}>주요 논의사항 요약</h3>
                    <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.0, delay: 0.5 }} className={`h-4 bg-gray-200 rounded mb-3 ${aiHighlightMode ? 'bg-blue-100' : ''}`} />
                    <motion.div initial={{ width: 0 }} animate={{ width: '90%' }} transition={{ duration: 1.0, delay: 0.7 }} className={`h-4 bg-gray-200 rounded mb-3 ${aiHighlightMode ? 'bg-blue-100' : ''}`} />
                    <motion.div initial={{ width: 0 }} animate={{ width: '95%' }} transition={{ duration: 1.0, delay: 0.9 }} className={`h-4 bg-gray-200 rounded mb-6 ${aiHighlightMode ? 'bg-blue-100' : ''}`} />

                    <h3 className={`font-semibold mb-4 ${aiHighlightMode ? 'text-blue-600 bg-blue-50 px-1 rounded' : 'text-gray-800'}`}>분기별 개발 진행률</h3>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.8, delay: 1.2 }}
                      className={`bg-gray-50 p-6 rounded-xl mb-6 border ${aiHighlightMode ? 'border-blue-200' : 'border-gray-200'}`}
                    >
                      {/* Placeholder Chart */}
                      <div className="h-48 w-full flex items-end justify-around pt-4 pb-6 px-4 space-x-4">
                        {[60, 90, 120, 80, 30].map((height, index) => (
                          <motion.div
                            key={index}
                            initial={{ height: 0 }}
                            animate={{ height: `${height / 150 * 100}%` }} // Relative height
                            transition={{ duration: 0.8, delay: 1.5 + index * 0.15, type: 'spring', bounce: 0.3 }}
                            className={`w-10 rounded-t-lg ${index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-blue-400' : index === 2 ? 'bg-green-500' : index === 3 ? 'bg-amber-500' : 'bg-red-500'} ${aiHighlightMode ? 'opacity-75' : ''}`}
                          />
                        ))}
                      </div>
                      <div className="flex justify-around px-2">
                        {['1분기', '2분기', '3분기', '4분기', '예상'].map((label, index) => (
                          <motion.span key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 2.0 + index * 0.1 }} className="text-xs text-gray-500">
                            {label}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>

                    <h3 className={`font-semibold mb-3 ${aiHighlightMode ? 'text-blue-600 bg-blue-50 px-1 rounded' : 'text-gray-800'}`}>다음 단계 및 액션 아이템</h3>
                    <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} transition={{ duration: 1.0, delay: 2.5 }} className={`h-4 bg-gray-200 rounded mb-3 ${aiHighlightMode ? 'bg-blue-100' : ''}`} />
                    <motion.div initial={{ width: 0 }} animate={{ width: '95%' }} transition={{ duration: 1.0, delay: 2.7 }} className={`h-4 bg-gray-200 rounded mb-3 ${aiHighlightMode ? 'bg-blue-100' : ''}`} />
                    <motion.div initial={{ width: 0 }} animate={{ width: '75%' }} transition={{ duration: 1.0, delay: 2.9 }} className={`h-4 bg-gray-200 rounded mb-3 ${aiHighlightMode ? 'bg-blue-100' : ''}`} />
                  </motion.div>
                </div>
              )}
              {/* 보고서 뷰어 */}
              {!isRecording && !PDFGenerating && selectedMeetingData?.report && (
                <div className="prose max-w-none">
                  <h2 className="text-2xl font-bold mb-4">최종 보고서</h2>
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                    {selectedMeetingData.report.report_content}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Recording Button */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
          <motion.button
            onClick={handleRecordToggle}
            className={`flex items-center justify-center w-16 h-16 rounded-full shadow-xl focus:outline-none focus:ring-4 transition-all duration-300
              ${isRecording
                ? 'bg-red-500 hover:bg-red-600 focus:ring-red-300'
                : 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-300'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            {isRecording ? (
              <MicOff size={28} className="text-white" />
            ) : (
              <Mic size={28} className="text-white" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Use RightSidebar Organism */}
      <RightSidebar
        showDocumentPanel={showDocumentPanel}
        documents={documents}
        onReset={handleReset}
        getDocumentNodeSize={getDocumentNodeSize}
      />

      {/* Meeting Info Modal */}
      <AnimatePresence>
        {showMeetingModal && (
          <>
            {/* 배경 블러 효과 레이어 */}
            <motion.div
              className="fixed inset-0 backdrop-blur-[2px] z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            
            {/* 모달 컨테이너 */}
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl shadow-2xl p-6 w-11/12 max-w-lg border border-gray-200 pointer-events-auto"
              >
                <MeetingForm
                  meetingInfo={meetingInfo}
                  onMeetingInfoChange={handleMeetingInfoChange}
                  isValid={isMeetingInfoValid()}
                />
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    onClick={() => setShowMeetingModal(false)}
                    className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700"
                  >
                    취소
                  </button>
                  <button
                    disabled={!isMeetingInfoValid()}
                    onClick={() => {
                      if (isMeetingInfoValid()) {
                        setShowMeetingModal(false);
                        startRecording();
                      }
                    }}
                    className={`px-4 py-2 rounded-lg ${
                      isMeetingInfoValid()
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    }`}
                  >
                    녹음 시작
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
