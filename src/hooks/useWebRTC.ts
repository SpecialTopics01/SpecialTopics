import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { CallState, CallStatus } from '../types/webrtc';
import type { EmergencyTeam } from '../types/database';
const ICE_SERVERS = {
  iceServers: [{
    urls: 'stun:stun.l.google.com:19302'
  }, {
    urls: 'stun:stun1.l.google.com:19302'
  }]
};
export function useWebRTC() {
  const {
    user
  } = useAuth();
  const [callState, setCallState] = useState<CallState>({
    status: 'idle',
    callId: null,
    remoteUserId: null,
    teamId: null,
    teamName: null,
    localStream: null,
    remoteStream: null,
    startTime: null
  });
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<any>(null);

  // Initialize media stream
  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setCallState(prev => ({
        ...prev,
        localStream: stream
      }));
      return stream;
    } catch (error: any) {
      console.error('Error accessing media devices:', error);

      // Provide specific error messages
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        throw new Error('Camera or microphone permission denied. Please allow access in your browser settings.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        throw new Error('No camera or microphone found. Please connect a device and try again.');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        throw new Error('Camera or microphone is already in use by another application.');
      } else {
        throw new Error('Could not access camera/microphone: ' + error.message);
      }
    }
  };

  // Create peer connection
  const createPeerConnection = (isInitiator: boolean, stream: MediaStream) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionRef.current = pc;

    // Add local stream tracks to peer connection
    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });

    // Handle remote stream
    pc.ontrack = event => {
      const remoteStream = event.streams[0];
      setCallState(prev => ({
        ...prev,
        status: 'connected',
        remoteStream,
        startTime: new Date()
      }));
    };

    // Handle ICE candidates
    pc.onicecandidate = async event => {
      if (event.candidate && callState.callId && user) {
        try {
          await supabase.from('call_signals').insert({
            call_id: callState.callId,
            caller_id: user.id,
            receiver_id: callState.remoteUserId,
            type: 'ice-candidate',
            signal: {
              candidate: event.candidate
            }
          });
        } catch (error) {
          console.error('Error sending ICE candidate:', error);
        }
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        endCall();
      }
    };
    return pc;
  };

  // Initiate call (Citizen side)
  const initiateCall = async (team: EmergencyTeam, receiverId: string) => {
    if (!user) {
      throw new Error('You must be logged in to make a call');
    }
    if (!receiverId || receiverId === 'admin-user-id') {
      throw new Error('No admin available for this team. Please try again later.');
    }
    try {
      setCallState(prev => ({
        ...prev,
        status: 'initiating'
      }));
      const stream = await initializeMedia();

      // Create call log
      const {
        data: callLog,
        error: callError
      } = await supabase.from('call_logs').insert({
        caller_id: user.id,
        receiver_id: receiverId,
        team_id: team.id,
        status: 'initiated'
      }).select().single();
      if (callError) {
        console.error('Database error:', callError);
        throw new Error('Failed to create call log. Please check your connection and try again.');
      }

      // Update state with call info
      setCallState(prev => ({
        ...prev,
        status: 'ringing',
        callId: callLog.id,
        remoteUserId: receiverId,
        teamId: team.id,
        teamName: team.name
      }));

      // Create peer connection
      const pc = createPeerConnection(true, stream);

      // Create and send offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await supabase.from('call_signals').insert({
        call_id: callLog.id,
        caller_id: user.id,
        receiver_id: receiverId,
        team_id: team.id,
        type: 'offer',
        signal: {
          sdp: offer
        }
      });

      // Subscribe to signals from receiver
      subscribeToSignals(callLog.id, receiverId);
    } catch (error: any) {
      console.error('Error initiating call:', error);
      setCallState(prev => ({
        ...prev,
        status: 'idle'
      }));

      // Stop any media streams that were started
      if (callState.localStream) {
        callState.localStream.getTracks().forEach(track => track.stop());
      }
      throw error;
    }
  };

  // Answer call (Admin side)
  const answerCall = async (callId: string, callerId: string, offerSignal: any) => {
    if (!user) return;
    try {
      setCallState(prev => ({
        ...prev,
        status: 'connecting',
        callId,
        remoteUserId: callerId
      }));
      const stream = await initializeMedia();

      // Create peer connection
      const pc = createPeerConnection(false, stream);

      // Set remote description (offer)
      await pc.setRemoteDescription(new RTCSessionDescription(offerSignal.sdp));

      // Create and send answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await supabase.from('call_signals').insert({
        call_id: callId,
        caller_id: callerId,
        receiver_id: user.id,
        type: 'answer',
        signal: {
          sdp: answer
        }
      });

      // Update call log
      await supabase.from('call_logs').update({
        status: 'connected'
      }).eq('id', callId);

      // Subscribe to signals from caller
      subscribeToSignals(callId, callerId);
    } catch (error) {
      console.error('Error answering call:', error);
      throw error;
    }
  };

  // Subscribe to call signals
  const subscribeToSignals = (callId: string, remoteUserId: string) => {
    const channel = supabase.channel(`call:${callId}`).on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'call_signals',
      filter: `call_id=eq.${callId}`
    }, async payload => {
      const signal = payload.new;
      const pc = peerConnectionRef.current;
      if (!pc) return;

      // Only process signals from the remote user
      if (signal.caller_id === remoteUserId || signal.receiver_id === remoteUserId) {
        try {
          if (signal.type === 'answer') {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.signal.sdp));
          } else if (signal.type === 'ice-candidate') {
            if (signal.signal.candidate) {
              await pc.addIceCandidate(new RTCIceCandidate(signal.signal.candidate));
            }
          } else if (signal.type === 'end-call') {
            endCall();
          }
        } catch (error) {
          console.error('Error processing signal:', error);
        }
      }
    }).subscribe();
    channelRef.current = channel;
  };

  // End call
  const endCall = useCallback(async () => {
    // Clean up peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Stop local stream
    if (callState.localStream) {
      callState.localStream.getTracks().forEach(track => track.stop());
    }

    // Unsubscribe from channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Update call log if there was an active call
    if (callState.callId && callState.startTime) {
      const duration = Math.floor((Date.now() - callState.startTime.getTime()) / 1000);
      await supabase.from('call_logs').update({
        status: 'ended',
        end_time: new Date().toISOString(),
        duration
      }).eq('id', callState.callId);
    }

    // Send end-call signal
    if (callState.callId && user) {
      await supabase.from('call_signals').insert({
        call_id: callState.callId,
        caller_id: user.id,
        receiver_id: callState.remoteUserId,
        type: 'end-call',
        signal: {}
      });
    }
    setCallState({
      status: 'idle',
      callId: null,
      remoteUserId: null,
      teamId: null,
      teamName: null,
      localStream: null,
      remoteStream: null,
      startTime: null
    });
  }, [callState, user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (callState.localStream) {
        callState.localStream.getTracks().forEach(track => track.stop());
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);
  return {
    callState,
    initiateCall,
    answerCall,
    endCall
  };
}