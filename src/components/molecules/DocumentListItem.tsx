import React from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

// Define Document type (can be moved to a shared types file later)
type Document = {
    id: string;
    title: string;
    date: Date;
    type: string;
    relevanceScore?: number;
};

type DocumentListItemProps = {
    doc: Document;
    index: number; // For animation delay
};

const DocumentListItem: React.FC<DocumentListItemProps> = ({ doc, index }) => {
    // 문서마다 다양한 색상을 적용하기 위한 색상 배열
    const documentColors = [
        { bg: 'bg-red-50', text: 'text-red-500' },
        { bg: 'bg-blue-50', text: 'text-blue-500' },
        { bg: 'bg-green-50', text: 'text-green-500' },
        { bg: 'bg-purple-50', text: 'text-purple-500' },
        { bg: 'bg-yellow-50', text: 'text-yellow-500' },
        { bg: 'bg-pink-50', text: 'text-pink-500' },
        { bg: 'bg-indigo-50', text: 'text-indigo-500' },
        { bg: 'bg-teal-50', text: 'text-teal-500' }
    ];
    
    // 문서 인덱스에 따라 색상 선택 (순환)
    const colorIndex = index % documentColors.length;
    const color = documentColors[colorIndex];

    return (
        <motion.div
            key={doc.id}
            layout
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="rounded-xl p-3 bg-white hover:bg-gray-50 border border-gray-200 transition-colors cursor-pointer shadow-sm"
        >
            <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${color.bg} ${color.text}`}>
                    <FileText size={18} />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-800 text-sm truncate overflow-hidden text-ellipsis whitespace-nowrap">{doc.title}</h3>
                    <p className="text-xs text-gray-500">{format(doc.date, 'yyyy.MM.dd', { locale: ko })}</p>
                </div>
                {/* Relevance Score Indicator */}
                {doc.relevanceScore && (
                    <div className="flex flex-col items-center ml-2">
                        <div className={`text-xs font-semibold ${color.text}`}>{Math.round(doc.relevanceScore * 100)}</div>
                        <div className="w-8 h-1 bg-gray-200 rounded-full mt-0.5">
                            <div className={`h-1 ${color.text.replace('text', 'bg')} rounded-full`} style={{ width: `${doc.relevanceScore * 100}%` }}></div>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default DocumentListItem;
