import React from 'react';
import { motion } from 'framer-motion'; // Removed AnimatePresence
import { RefreshCw, Share2, FileText } from 'lucide-react';
import DocumentList from './DocumentList'; // Import the DocumentList organism

// Define Document type (can be moved to a shared types file later)
type Document = {
    id: string;
    title: string;
    date: Date;
    type: string;
    relevanceScore?: number;
};

type RightSidebarProps = {
    showDocumentPanel: boolean;
    documents: Document[];
    onReset: () => void;
    getDocumentNodeSize: (score?: number) => number; // Pass the function as a prop
};

const RightSidebar: React.FC<RightSidebarProps> = ({
    showDocumentPanel,
    documents,
    onReset,
    getDocumentNodeSize,
}) => {
    return (
        <motion.div
            initial={{ x: '100%', width: '18rem' }} // Slightly wider sidebar
            animate={{ x: showDocumentPanel ? 0 : '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-white border-l border-gray-200 p-4 flex flex-col h-full fixed right-0 top-0 bottom-0 w-72 shadow-lg z-10" // Added shadow
        >
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">관련 문서</h2>
                <button
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium flex items-center border border-gray-200"
                    onClick={onReset} // Use the passed handler
                >
                    <RefreshCw size={14} className="mr-1.5" />
                    <span>초기화</span>
                </button>
            </div>

            {/* Use DocumentList Organism */}
            <DocumentList documents={documents} />

            {/* 3D Document Network Placeholder */}
            <div className="mt-auto border-t border-gray-200 pt-4">
                <h3 className="text-base font-semibold text-gray-700 mb-3 flex items-center">
                    <Share2 size={16} className="mr-2 text-purple-500" />
                    문서 네트워크 (3D)
                </h3>
                <div className="h-40 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 flex items-center justify-center relative overflow-hidden">
                    {/* Simple 2D representation */}
                    <p className="text-xs text-gray-400 absolute top-2 left-2 z-10">3D 시각화 영역</p>
                    {documents.length > 0 ? (
                        <div className="relative w-full h-full flex items-center justify-center p-4">
                            {documents.map((doc, index) => {
                                // 문서마다 다양한 색상을 적용하기 위한 색상 배열
                                const documentColors = [
                                    { bg: 'bg-red-200', border: 'border-red-300', icon: 'text-red-600' },
                                    { bg: 'bg-blue-200', border: 'border-blue-300', icon: 'text-blue-600' },
                                    { bg: 'bg-green-200', border: 'border-green-300', icon: 'text-green-600' },
                                    { bg: 'bg-purple-200', border: 'border-purple-300', icon: 'text-purple-600' },
                                    { bg: 'bg-yellow-200', border: 'border-yellow-300', icon: 'text-yellow-600' },
                                    { bg: 'bg-pink-200', border: 'border-pink-300', icon: 'text-pink-600' },
                                    { bg: 'bg-indigo-200', border: 'border-indigo-300', icon: 'text-indigo-600' },
                                    { bg: 'bg-teal-200', border: 'border-teal-300', icon: 'text-teal-600' }
                                ];
                                
                                // 문서 인덱스에 따라 색상 선택 (순환)
                                const colorIndex = index % documentColors.length;
                                const color = documentColors[colorIndex];
                                
                                return (
                                    <motion.div
                                        key={doc.id}
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{
                                            opacity: 0.8,
                                            scale: 1,
                                            x: (Math.random() - 0.5) * 80, // Random position
                                            y: (Math.random() - 0.5) * 50,
                                        }}
                                        transition={{ delay: 0.5 + index * 0.1, type: 'spring', stiffness: 100 }}
                                        className={`absolute rounded-full border-2 ${color.border} flex items-center justify-center ${color.bg}`}
                                        style={{
                                            width: `${getDocumentNodeSize(doc.relevanceScore)}px`,
                                            height: `${getDocumentNodeSize(doc.relevanceScore)}px`,
                                        }}
                                        title={`${doc.title} (Relevance: ${Math.round((doc.relevanceScore || 0) * 100)}%)`}
                                    >
                                        <FileText size={getDocumentNodeSize(doc.relevanceScore) * 0.4} className={`${color.icon} opacity-70`} />
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400">문서 없음</p>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default RightSidebar;
