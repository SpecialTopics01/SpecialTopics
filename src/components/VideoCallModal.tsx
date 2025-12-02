import React, { useEffect, useState, useRef } from 'react';
import { PhoneOffIcon, MicIcon, MicOffIcon, VideoIcon, VideoOffIcon } from 'lucide-react';
import { Button } from './Button';
import type { CallState } from '../types/webrtc';
interface VideoCallModalProps {
  callState: CallState;
  onEndCall: () => void;
}
export function VideoCallModal({
  callState,
  onEndCall
}: VideoCallModalProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  // Set up local video stream
  useEffect(() => {
    if (localVideoRef.current && callState.localStream) {
      localVideoRef.current.srcObject = callState.localStream;
    }
  }, [callState.localStream]);
  // Set up remote video stream
  useEffect(() => {
    if (remoteVideoRef.current && callState.remoteStream) {
      remoteVideoRef.current.srcObject = callState.remoteStream;
    }
  }, [callState.remoteStream]);
  const toggleMute = () => {
    if (callState.localStream) {
      const audioTrack = callState.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };
  const toggleVideo = () => {
    if (callState.localStream) {
      const videoTrack = callState.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };
  const getStatusText = () => {
    switch (callState.status) {
      case 'initiating':
        return 'Initializing call...';
      case 'ringing':
        return `Calling ${callState.teamName}...`;
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return 'Connected';
      default:
        return '';
    }
  };
  if (callState.status === 'idle') return null;
  return <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Remote Video (Main) */}
      <div className="flex-1 relative bg-gray-900">
        {callState.remoteStream ? <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">👤</span>
              </div>
              <p className="text-lg font-medium">{getStatusText()}</p>
            </div>
          </div>}

        {/* Local Video (Picture-in-Picture) */}
        <div className="absolute top-4 right-4 w-32 h-40 md:w-48 md:h-60 bg-gray-800 rounded-lg overflow-hidden shadow-2xl border-2 border-white">
          {callState.localStream && !isVideoOff ? <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror" /> : <div className="w-full h-full flex items-center justify-center bg-gray-700">
              <VideoOffIcon className="w-8 h-8 text-gray-400" />
            </div>}
        </div>

        {/* Call Info */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
          <p className="text-sm font-medium">{callState.teamName}</p>
          <p className="text-xs text-gray-300">{getStatusText()}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 p-6">
        <div className="max-w-md mx-auto flex items-center justify-center gap-4">
          <button onClick={toggleMute} className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'}`}>
            {isMuted ? <MicOffIcon className="w-6 h-6 text-white" /> : <MicIcon className="w-6 h-6 text-white" />}
          </button>

          <button onClick={onEndCall} className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors">
            <PhoneOffIcon className="w-8 h-8 text-white" />
          </button>

          <button onClick={toggleVideo} className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'}`}>
            {isVideoOff ? <VideoOffIcon className="w-6 h-6 text-white" /> : <VideoIcon className="w-6 h-6 text-white" />}
          </button>
        </div>
      </div>

      <style>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>;
}