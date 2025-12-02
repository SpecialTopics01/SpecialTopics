export interface CallSignal {
  id: string;
  caller_id: string;
  receiver_id: string;
  team_id: string;
  type: 'offer' | 'answer' | 'ice-candidate' | 'end-call';
  signal: any;
  created_at: string;
}
export type CallStatus = 'idle' | 'initiating' | 'ringing' | 'connecting' | 'connected' | 'ended' | 'rejected';
export interface CallState {
  status: CallStatus;
  callId: string | null;
  remoteUserId: string | null;
  teamId: string | null;
  teamName: string | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  startTime: Date | null;
}