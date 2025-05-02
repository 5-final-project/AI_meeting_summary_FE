import React from 'react';
import MeetingListItem from '../molecules/MeetingListItem'; // Import the molecule
import { Meeting } from '../../App'; // Import the Meeting type from App.tsx

// Define props for the sidebar
type MeetingListSidebarProps = {
    meetings: Meeting[];
    menuOpenId: string | null;
    onSelectMeeting: (id: string) => void;
    onToggleMenu: (id: string) => void;
    onDeleteMeeting: (id: string) => void;
};

const MeetingListSidebar: React.FC<MeetingListSidebarProps> = ({
    meetings,
    menuOpenId,
    onSelectMeeting,
    onToggleMenu,
    onDeleteMeeting,
}) => {
    return (
        <div className="w-72 bg-white border-r border-gray-200 p-4 flex flex-col shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-5 px-2">회의 목록</h2>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {meetings.map((meeting) => (
                    <MeetingListItem
                        key={meeting.id}
                        meeting={meeting}
                        menuOpenId={menuOpenId}
                        onSelect={onSelectMeeting}
                        onMenuToggle={onToggleMenu}
                        onDelete={onDeleteMeeting}
                    />
                ))}
            </div>
        </div>
    );
};

export default MeetingListSidebar;
