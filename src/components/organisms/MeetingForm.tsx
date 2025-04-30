import React from 'react';
import { motion } from 'framer-motion';
import { Users, Building, FileText } from 'lucide-react';

export type MeetingInfo = {
    title: string;
    department: string;
    participants: string;
};

type MeetingFormProps = {
    meetingInfo: MeetingInfo;
    onMeetingInfoChange: (info: MeetingInfo) => void;
    isValid: boolean;
};

const MeetingForm: React.FC<MeetingFormProps> = ({
    meetingInfo,
    onMeetingInfoChange,
    isValid
}) => {
    const handleChange = (field: keyof MeetingInfo) => (e: React.ChangeEvent<HTMLInputElement>) => {
        onMeetingInfoChange({
            ...meetingInfo,
            [field]: e.target.value
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8"
        >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">회의 정보 입력</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <FileText size={16} className="mr-2" />
                            회의 제목
                        </label>
                        <input
                            type="text"
                            value={meetingInfo.title}
                            onChange={handleChange('title')}
                            placeholder="예: 제품 개발 전략 회의"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <Building size={16} className="mr-2" />
                            참여 부서
                        </label>
                        <input
                            type="text"
                            value={meetingInfo.department}
                            onChange={handleChange('department')}
                            placeholder="예: 개발팀, 기획팀"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <Users size={16} className="mr-2" />
                            참여 인원
                        </label>
                        <input
                            type="text"
                            value={meetingInfo.participants}
                            onChange={handleChange('participants')}
                            placeholder="예: 홍길동, 김철수"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                    </div>
                </div>
                {!isValid && (
                    <p className="mt-4 text-sm text-red-500">
                        모든 필드를 입력해주세요.
                    </p>
                )}
            </div>
        </motion.div>
    );
};

export default MeetingForm; 