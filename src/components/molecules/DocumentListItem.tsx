import React from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Document } from '../../App'; // Import Document type from App.tsx

// REMOVED local Document type definition

type DocumentListItemProps = {
    doc: Document;
    index: number; // For animation delay
};

const DocumentListItem: React.FC<DocumentListItemProps> = ({ doc, index }) => {
    // Function to get color based on document type
    const getTypeColorClasses = (type: string) => {
        switch (type) {
            case 'marketing': return 'bg-red-50 text-red-500';
            case 'product': return 'bg-blue-50 text-blue-500';
            case 'finance': return 'bg-green-50 text-green-500';
            default: return 'bg-gray-100 text-gray-500';
        }
    };

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
                <div className={`p-2 rounded-lg ${getTypeColorClasses(doc.type)}`}>
                    <FileText size={18} />
                </div>
                <div className="flex-1">
                    <h3 className="font-medium text-gray-800 text-sm truncate">{doc.title}</h3>
                    {/* Conditionally render date */}
                    {doc.date && (
                        <p className="text-xs text-gray-500">{format(doc.date, 'yyyy.MM.dd', { locale: ko })}</p>
                    )}
                </div>
                {/* Score Indicator - Use score instead of relevanceScore */}
                {doc.score !== undefined && ( // Check if score exists
                    <div className="flex flex-col items-center ml-2">
                        {/* Display score, maybe formatted differently if needed */}
                        <div className="text-xs font-semibold text-blue-600">{doc.score.toFixed(2)}</div>
                        {/* Optional: Adjust progress bar logic if needed, e.g., scale score if it's not 0-1 */}
                        <div className="w-8 h-1 bg-gray-200 rounded-full mt-0.5">
                            <div className="h-1 bg-blue-500 rounded-full" style={{ width: `${Math.min(doc.score * 100, 100)}%` }}></div> {/* Assuming score is 0-1 */}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default DocumentListItem;
