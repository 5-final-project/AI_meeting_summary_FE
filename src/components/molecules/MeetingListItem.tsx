import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Sparkles, X } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Meeting } from '../../App';

// Define the props based on the Meeting type and interaction needs
type MeetingListItemProps = {
    meeting: Meeting;
    menuOpenId: string | null;
    onSelect: (id: string) => void;
    onMenuToggle: (id: string) => void;
    onDelete: (id: string) => void;
};

const MeetingListItem: React.FC<MeetingListItemProps> = ({
    meeting,
    menuOpenId,
    onSelect,
    onMenuToggle,
    onDelete,
}) => {
    return (
        <motion.div
            layout // Animate layout changes
            className={`rounded-xl p-4 relative transition-all duration-200 cursor-pointer border
        ${meeting.isSelected
                    ? 'bg-blue-50 border-blue-200 shadow-md'
                    : 'bg-white border-gray-200 hover:bg-gray-50 hover:shadow-sm'}`}
            onClick={() => onSelect(meeting.id)}
        >
            <div className="flex justify-between items-start">
                <div className="flex-1 mr-2">
                    <h3 className="font-semibold text-gray-900 text-base mb-1">{meeting.title}</h3>
                    <div className="flex items-center text-xs text-gray-500 mt-1 space-x-2 mb-2">
                        <Clock size={12} />
                        <span>{format(meeting.date, 'yyyy.MM.dd', { locale: ko })}</span>
                    </div>

                    {/* Insight Score Bar */}
                    {meeting.insightScore && (
                        <div className="mt-2 flex items-center group">
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <motion.div
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${meeting.insightScore}%` }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                />
                            </div>
                            <div className="ml-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Sparkles size={14} className="text-amber-500 mr-1" />
                                <span className="text-xs font-medium text-gray-700">{meeting.insightScore}</span>
                            </div>
                        </div>
                    )}
                </div>
                <button
                    className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-gray-100 mt-[-4px]"
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering onSelect
                        onMenuToggle(meeting.id);
                    }}
                >
                    <X size={18} />
                </button>

                {/* Delete Menu */}
                <AnimatePresence>
                    {menuOpenId === meeting.id && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-10 bg-white shadow-xl rounded-lg py-1.5 z-20 w-28 text-sm border border-gray-100"
                        >
                            <button className="w-full text-left px-3 py-1.5 text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent triggering onSelect
                                    onDelete(meeting.id);
                                }}
                            >
                                <X size={14} />
                                <span>삭제</span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default MeetingListItem;
