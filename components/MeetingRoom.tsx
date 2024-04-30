import React, { useState } from 'react';
import { PaginatedGridLayout, SpeakerLayout, CallParticipantsList, CallControls, CallStatsButton } from '@stream-io/video-react-sdk';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, LayoutList } from 'lucide-react';
import Loader from './Loader';
import EndCallButton from './EndCallButton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { cn } from '@/lib/utils'; // Assuming cn function is imported from a custom utility file
type Attendee = {
  id: string;
  joinTime: number;
  exitTime: number | null;
};
type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';
const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get('personal');
  const router = useRouter();
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  console.log("Attendees:", attendees);


  const CallLayout = () => {
    switch (layout) {
      case 'grid':
        return <PaginatedGridLayout />;
      case 'speaker-right':
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  const generateReport = () => {
    if (attendees.length === 0) {
      // No attendees to generate report for
      console.log("No attendees to generate report for.");
      return;
    }
    // Format data into CSV format
    const csvData = [['Attendee ID', 'Join Time', 'Exit Time']];
    attendees.forEach((attendee) => {
      csvData.push([attendee.id, new Date(attendee.joinTime).toLocaleString(), attendee.exitTime ? new Date(attendee.exitTime).toLocaleString() : '']);
    });

    // Create CSV content
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    
    // Create a Blob object with CSV data
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    // Create a link element to trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'meeting_report.csv');
    document.body.appendChild(link);

    // Trigger the download
    link.click();

    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  };

  const handleUserJoin = (userId: string) => {
    // Add user to the list of attendees with join time
    const newAttendee = { id: userId, joinTime: Date.now(), exitTime: null };
    console.log("New attendee:", newAttendee);
    setAttendees((prevAttendees) => [...prevAttendees, newAttendee]);
    console.log("Updated attendees:", attendees);
  };
  
  
  const handleUserExit = (userId: string) => {
    // Find the user in the list of attendees and update their exit time
    setAttendees((prevAttendees) =>
      prevAttendees.map((attendee) =>
        attendee.id === userId ? { ...attendee, exitTime: Date.now() } : attendee
      )
    );
  };

  return (
    <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
      <div className="relative flex size-full items-center justify-center">
        <div className=" flex size-full max-w-[1000px] items-center">
          <CallLayout />
        </div>
        <div
          className={cn('h-[calc(100vh-86px)] hidden ml-2', {
            'show-block': showParticipants,
          })}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>

      {/* video layout and call controls */}
      <div className="fixed bottom-0 flex w-full items-center justify-center gap-5">
        <CallControls onLeave={() => router.push('/')} />

        <DropdownMenu>
          <div className="flex items-center">
            <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]  ">
              <LayoutList size={20} className="text-white" />
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent className="border-dark-1 bg-dark-1 text-white">
            {['Grid', 'Speaker-Left', 'Speaker-Right'].map((item, index) => (
              <div key={index}>
                <DropdownMenuItem
                  onClick={() =>
                    setLayout(item.toLowerCase() as CallLayoutType)
                  }
                >
                  {item}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="border-dark-1" />
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <CallStatsButton />
        <button onClick={() => setShowParticipants((prev) => !prev)}>
          <div className=" cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]  ">
            <Users size={20} className="text-white" />
          </div>
        </button>
        <button onClick={generateReport}>
          <div className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
            Generate Report
          </div>
        </button>
        {!isPersonalRoom && <EndCallButton />}
      </div>
    </section>
  );
};

export default MeetingRoom;
