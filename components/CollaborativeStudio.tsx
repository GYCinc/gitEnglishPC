import React, { useState } from 'react';
import { Rnd } from 'react-rnd';

interface CollaborativeStudioProps {
  // Props to be used for future integration, for now mocked
}

const CollaborativeStudio: React.FC<CollaborativeStudioProps> = () => {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([
    { sender: 'System', text: 'Welcome to the session!' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setMessages([...messages, { sender: 'You', text: inputValue }]);
    setInputValue('');
  };

  const simulateApiCall = (action: string) => {
    console.log(`API Call: ${action}`);
    // Simulate async operation
    setTimeout(() => {
        alert(`${action} successful (simulated)`);
    }, 500);
  };

  return (
    <div className="flex h-screen w-full bg-slate-900 text-white overflow-hidden font-casual">
      {/* Split Screen Layout */}

      {/* Left Panel: Tutor/Host View */}
      <div className="flex-1 flex flex-col border-r border-slate-700 relative">
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-neutral-gray-200">Tutor / Host View</h2>
            <div className="flex gap-2">
                <button
                    onClick={() => { setActiveTool('Screen Share'); simulateApiCall('StartScreenShare'); }}
                    className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-500 text-sm font-bold"
                >
                    Share Screen
                </button>
                <button
                    onClick={() => { setActiveTool('Upload'); simulateApiCall('UploadFile'); }}
                    className="px-3 py-1 bg-green-600 rounded hover:bg-green-500 text-sm font-bold"
                >
                    Upload File
                </button>
                <button
                    onClick={() => { setActiveTool('Poll'); simulateApiCall('StartPoll'); }}
                    className="px-3 py-1 bg-purple-600 rounded hover:bg-purple-500 text-sm font-bold"
                >
                    Start Poll
                </button>
            </div>
        </div>

        <div className="flex-grow relative bg-slate-200 overflow-hidden">
             {/* Placeholder for Shared Whiteboard */}
             <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                <div className="text-center">
                    <p className="text-2xl font-bold mb-2">Shared Whiteboard Area</p>
                    <p>Collaborative content goes here</p>
                    {activeTool && <p className="mt-4 text-blue-600 font-bold">Active Tool: {activeTool}</p>}
                </div>
             </div>
        </div>
      </div>

      {/* Right Panel: Participant View & Chat */}
      <div className="w-1/3 min-w-[300px] flex flex-col bg-slate-800">
         <div className="p-4 border-b border-slate-700">
            <h2 className="text-xl font-bold text-neutral-gray-200">Participant View</h2>
         </div>

         {/* Video Feed Placeholders (Optional/Hidden per request "no video needed", but request said "placeholders for participant video feeds")
             The user said "no video needed in my case" but the prompt description said "includes placeholders for participant video feeds".
             I will interpret "no video needed in my case" as "do not implement functional video, maybe just a placeholder or remove it".
             The prompt says "New Component... Participant View: ... includes placeholders for participant video feeds...".
             But the user preamble says "can you add something like this but no video needed in my case?".
             I will SKIP the video placeholders to respect the user's specific override.
         */}

         <div className="flex-grow flex flex-col p-4">
             <div className="flex-grow bg-slate-900 rounded-lg p-4 overflow-y-auto mb-4 border border-slate-700 space-y-2">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}>
                        <span className="text-xs text-slate-400 mb-1">{msg.sender}</span>
                        <div className={`px-3 py-2 rounded-lg max-w-[85%] ${msg.sender === 'You' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
             </div>

             <form onSubmit={handleSendMessage} className="flex gap-2">
                 <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="flex-grow p-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-blue-500"
                    placeholder="Type a message..."
                 />
                 <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-bold transition-colors">
                     Send
                 </button>
             </form>
         </div>
      </div>
    </div>
  );
};

export default CollaborativeStudio;
