import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWebRTC } from '../hooks/useWebRTC';
import { useEmergencyTeams } from '../hooks/useEmergencyTeams';
import { Button } from '../components/Button';
import { VideoCallModal } from '../components/VideoCallModal';
import { PhoneIncomingIcon, UsersIcon, FileTextIcon, ActivityIcon, PhoneIcon, PhoneOffIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { CallLog, Profile } from '../types/database';
interface IncomingCall {
  id: string;
  callerId: string;
  callerName: string;
  teamId: string;
  teamName: string;
  offerSignal: any;
}

interface ActiveCall {
  id: string;
  callerName: string;
  teamName: string;
  startTime: string;
  duration: string;
}

export function AdminDashboard() {
  const {
    profile,
    signOut
  } = useAuth();

  console.log('AdminDashboard: Current profile:', profile);
  const { callState, answerCall, endCall } = useWebRTC();

  console.log('AdminDashboard callState:', callState);
  const { teams } = useEmergencyTeams();
  const [incomingCalls, setIncomingCalls] = useState<IncomingCall[]>([]);
  const [activeCalls, setActiveCalls] = useState<ActiveCall[]>([]);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [stats, setStats] = useState({
    incomingCalls: 0,
    activeCalls: 0,
    todaysReports: 0,
    totalCitizens: 0
  });

  // Set admin online status
  useEffect(() => {
    if (profile?.id && profile.user_type === 'admin') {
      console.log('AdminDashboard: Setting admin online, team:', profile.team);

      // Set online when component mounts
      supabase.from('profiles').update({
        is_online: true,
        last_seen: new Date().toISOString()
      }).eq('id', profile.id).then(({ error }) => {
        if (error) {
          console.error('Error setting admin online:', error);
        } else {
          console.log('Admin set online successfully');
        }
      });

      // Set offline when component unmounts (logout)
      return () => {
        supabase.from('profiles').update({
          is_online: false,
          last_seen: new Date().toISOString()
        }).eq('id', profile.id).then(() => {
          console.log('Admin set offline');
        });
      };
    }
  }, [profile?.id, profile?.user_type]);

  // Subscribe to incoming call signals
  useEffect(() => {
    if (!profile?.id) return;

    console.log('AdminDashboard: Setting up call signal subscription for admin:', profile.id, 'team:', profile.team);

    const channel = supabase
      .channel(`admin-calls-${profile.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'call_signals',
        filter: `receiver_id=eq.${profile.id}`
      }, async (payload) => {
        const signal = payload.new;
        console.log('Admin received signal:', signal);
        console.log('Signal is for me (receiver_id):', signal.receiver_id === profile.id);

        if (signal.type === 'offer') {
          console.log('Processing incoming call offer');

          // Get caller info
          const { data: callerProfile, error: callerError } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', signal.caller_id)
            .single();

          if (callerError) {
            console.error('Error fetching caller profile:', callerError);
          }

          // Get team info
          const team = teams.find(t => t.id === signal.team_id);
          console.log('Team found:', team);

          const incomingCall: IncomingCall = {
            id: signal.call_id,
            callerId: signal.caller_id,
            callerName: callerProfile?.full_name || 'Unknown Caller',
            teamId: signal.team_id,
            teamName: team?.name || 'Emergency Team',
            offerSignal: signal.signal,
            timestamp: Date.now()
          };

          console.log('Adding incoming call:', incomingCall);
          setIncomingCalls(prev => [...prev, incomingCall]);

          // Auto-remove after 30 seconds if not answered
          setTimeout(() => {
            console.log('Auto-removing unanswered call:', signal.call_id);
            setIncomingCalls(prev => prev.filter(call => call.id !== signal.call_id));
          }, 30000);
        }
      })
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });
      console.log('Admin call subscription set up for receiver_id:', profile.id);

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, teams]);

  // Load stats and active calls on mount
  useEffect(() => {
    loadStats();
    loadActiveCalls();
    loadDebugInfo();

    // Refresh active calls every 30 seconds
    const interval = setInterval(() => {
      loadActiveCalls();
      loadDebugInfo();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDebugInfo = async () => {
    try {
      // Check emergency teams
      const { data: teams, error: teamsError } = await supabase
        .from('emergency_teams')
        .select('*')
        .eq('type', 'rescue');

      // Check admin profiles
      const { data: admins, error: adminsError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'admin');

      // Check online admins
      const { data: onlineAdmins, error: onlineError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'admin')
        .eq('is_online', true);

      setDebugInfo({
        rescueTeams: teams || [],
        allAdmins: admins || [],
        onlineAdmins: onlineAdmins || [],
        teamsError: teamsError?.message,
        adminsError: adminsError?.message,
        onlineError: onlineError?.message
      });
    } catch (error) {
      console.error('Error loading debug info:', error);
    }
  };

  const loadStats = async () => {
    try {
      // Get total citizens
      const { count: citizenCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_type', 'citizen');

      // Get today's call logs
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: todayCalls } = await supabase
        .from('call_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // Get active calls (connected but not ended)
      const { count: activeCalls } = await supabase
        .from('call_logs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'connected');

      // Get incoming calls (initiated but not connected)
      const { count: incomingCallsCount } = await supabase
        .from('call_logs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'initiated');

      setStats({
        incomingCalls: incomingCallsCount || 0,
        activeCalls: activeCalls || 0,
        todaysReports: todayCalls || 0,
        totalCitizens: citizenCount || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadActiveCalls = async () => {
    try {
      const { data: calls, error } = await supabase
        .from('call_logs')
        .select(`
          id,
          start_time,
          profiles!call_logs_caller_id_fkey(full_name),
          emergency_teams(name)
        `)
        .eq('status', 'connected')
        .eq('receiver_id', profile?.id);

      if (error) throw error;

      const formattedCalls: ActiveCall[] = calls.map(call => {
        const startTime = new Date(call.start_time);
        const now = new Date();
        const durationMs = now.getTime() - startTime.getTime();
        const minutes = Math.floor(durationMs / 60000);
        const seconds = Math.floor((durationMs % 60000) / 1000);
        const duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        return {
          id: call.id,
          callerName: call.profiles?.full_name || 'Unknown',
          teamName: call.emergency_teams?.name || 'Emergency Team',
          startTime: call.start_time,
          duration
        };
      });

      setActiveCalls(formattedCalls);
    } catch (error) {
      console.error('Error loading active calls:', error);
    }
  };

  const handleAcceptCall = async (call: IncomingCall) => {
    console.log('Admin accepting call:', call);
    try {
      // Remove from incoming calls immediately to hide the popup
      setIncomingCalls(prev => prev.filter(c => c.id !== call.id));

      // Answer the call - this will start the WebRTC connection
      await answerCall(call.id, call.callerId, call.offerSignal);
      console.log('Call answered successfully, video modal should show');
    } catch (error) {
      console.error('Error accepting call:', error);
      // If there's an error, show the call again
      setIncomingCalls(prev => [...prev, call]);
    }
  };

  const handleRejectCall = async (callId: string) => {
    console.log('Admin rejecting call:', callId);
    try {
      // Update call log status to missed
      await supabase
        .from('call_logs')
        .update({ status: 'missed' })
        .eq('id', callId);

      // Remove from incoming calls
      setIncomingCalls(prev => prev.filter(c => c.id !== callId));
      console.log('Call rejected successfully');
    } catch (error) {
      console.error('Error rejecting call:', error);
      // Still remove from UI even if database update fails
      setIncomingCalls(prev => prev.filter(c => c.id !== callId));
    }
  };

  const testDatabaseConnection = async () => {
    console.log('Testing database connection...');

    // Check emergency teams
    const { data: teams, error: teamsError } = await supabase
      .from('emergency_teams')
      .select('*')
      .eq('type', 'rescue');

    console.log('Rescue teams:', teams, 'Error:', teamsError);

    // Check all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    console.log('All profiles:', profiles, 'Error:', profilesError);

    // Check online admins
    const { data: onlineAdmins, error: onlineError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_type', 'admin')
      .eq('is_online', true);

    console.log('Online admins:', onlineAdmins, 'Error:', onlineError);

    // Check recent call logs
    const { data: calls, error: callsError } = await supabase
      .from('call_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    console.log('Recent calls:', calls, 'Error:', callsError);

      // Test sending a call signal
    if (profile?.id) {
      console.log('Testing call signal send...');
      const testCallId = 'test-' + Date.now();
      await supabase.from('call_signals').insert({
        call_id: testCallId,
        caller_id: profile.id, // Using self as caller for test
        receiver_id: profile.id, // Should receive it
        team_id: teams?.[0]?.id || 'test-team',
        type: 'offer',
        signal: { test: true, timestamp: Date.now() }
      }).then(({ error }) => {
        console.log('Test signal sent, error:', error);
      });
    }

    // Also test the incoming call popup directly
    console.log('Testing incoming call popup...');
    const testCall: IncomingCall = {
      id: 'test-popup-' + Date.now(),
      callerId: 'test-caller',
      callerName: 'Test Caller',
      teamId: 'test-team',
      teamName: 'Test Emergency Team',
      offerSignal: { test: true },
      timestamp: Date.now()
    };
    setIncomingCalls(prev => [...prev, testCall]);
    console.log('Test incoming call added to state');
  };
  return <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">👮 Admin Portal</h1>
            <p className="text-blue-100 text-sm">
              {profile?.full_name} •{' '}
              {profile?.team && profile.team.charAt(0).toUpperCase() + profile.team.slice(1)}{' '}
              Team
            </p>
          </div>
          <Button variant="ghost" onClick={signOut} className="text-white hover:bg-blue-700">
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Status Banner */}
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-green-500 w-3 h-3 rounded-full mr-3 animate-pulse"></div>
              <div>
                <h2 className="text-green-800 text-xl font-bold">
                  Online & Ready
                </h2>
                <p className="text-green-700">
                  You are available to receive emergency calls from citizens
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-600 font-medium">Team: {profile?.team}</p>
              <p className="text-xs text-green-500">Status: Available</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <PhoneIncomingIcon className="w-8 h-8 text-blue-600" />
              <span className="text-3xl font-bold text-gray-900">{stats.incomingCalls}</span>
            </div>
            <p className="text-gray-600 text-sm font-medium">Incoming Calls</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <ActivityIcon className="w-8 h-8 text-green-600" />
              <span className="text-3xl font-bold text-gray-900">{stats.activeCalls}</span>
            </div>
            <p className="text-gray-600 text-sm font-medium">Active Calls</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <FileTextIcon className="w-8 h-8 text-purple-600" />
              <span className="text-3xl font-bold text-gray-900">{stats.todaysReports}</span>
            </div>
            <p className="text-gray-600 text-sm font-medium">Today's Reports</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <UsersIcon className="w-8 h-8 text-orange-600" />
              <span className="text-3xl font-bold text-gray-900">{stats.totalCitizens}</span>
            </div>
            <p className="text-gray-600 text-sm font-medium">Total Citizens</p>
          </div>
        </div>

        {/* Messenger-Style Incoming Call Overlay */}
        {incomingCalls.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 w-full relative overflow-hidden">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 opacity-50"></div>

              <div className="relative text-center">
                {/* Ringing Animation */}
                <div className="relative mb-6">
                  <div className="w-28 h-28 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto shadow-lg relative z-10">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-inner">
                      <PhoneIncomingIcon className="w-10 h-10 text-blue-600" />
                    </div>
                  </div>

                  {/* Animated rings */}
                  <div className="absolute inset-0 rounded-full border-4 border-blue-300 animate-ping opacity-75"></div>
                  <div className="absolute inset-1 rounded-full border-2 border-blue-400 animate-ping opacity-50" style={{animationDelay: '0.2s'}}></div>
                  <div className="absolute inset-2 rounded-full border-2 border-blue-500 animate-ping opacity-25" style={{animationDelay: '0.4s'}}></div>
                </div>

                {/* Call Info */}
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Emergency Call</h2>
                <p className="text-xl text-gray-700 mb-1 font-semibold">{incomingCalls[0].callerName}</p>
                <p className="text-sm text-blue-600 mb-2 font-medium">{incomingCalls[0].teamName}</p>
                <p className="text-xs text-gray-500 mb-6">🚨 Emergency Services</p>

                {/* Countdown Timer */}
                <div className="mb-6">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.max(0, 30 - Math.floor((Date.now() - (incomingCalls[0] as any).timestamp || 0) / 1000))}s
                  </div>
                  <div className="text-xs text-gray-500">Auto-decline in</div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-6 justify-center">
                  <button
                    onClick={() => handleRejectCall(incomingCalls[0].id)}
                    className="w-20 h-20 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg shadow-red-500/50 hover:scale-105"
                  >
                    <PhoneOffIcon className="w-10 h-10 text-white" />
                  </button>

                  <button
                    onClick={() => handleAcceptCall(incomingCalls[0])}
                    className="w-20 h-20 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg shadow-green-500/50 hover:scale-105"
                  >
                    <PhoneIcon className="w-10 h-10 text-white" />
                  </button>
                </div>

                <div className="flex justify-between text-xs text-gray-400 mt-4 px-4">
                  <span>Decline</span>
                  <span>Accept</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Calls */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Recent Calls
            </h3>
            <div className="text-center py-12">
              <PhoneIncomingIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No recent calls</p>
              <p className="text-gray-400 text-sm mt-2">
                Emergency calls will appear here
              </p>
            </div>
          </div>

          {/* Call Logs */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Call Logs</h3>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
            <div className="text-center py-12">
              <FileTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No call logs yet</p>
              <p className="text-gray-400 text-sm mt-2">
                Call history will be recorded here
              </p>
            </div>
          </div>
        </div>

        {/* Monthly Reports Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Monthly Reports</h3>
            <Button variant="primary" size="sm">
              Generate Report
            </Button>
          </div>
          <p className="text-gray-600 mb-4">
            View aggregated incident data and statistics
          </p>
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">No reports generated yet</p>
          </div>
        </div>

        {/* Active Calls Management */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Active Calls</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadActiveCalls}>
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={testDatabaseConnection}>
                Debug DB
              </Button>
            </div>
          </div>
          {activeCalls.length > 0 ? (
            <div className="space-y-4">
              {activeCalls.map((call) => (
                <div key={call.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{call.callerName}</p>
                      <p className="text-sm text-gray-600">{call.teamName}</p>
                      <p className="text-xs text-gray-500">
                        Duration: {call.duration}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-green-700 font-medium">Active</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ActivityIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No active calls</p>
              <p className="text-gray-400 text-sm mt-2">
                Active emergency calls will appear here
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Video Call Modal */}
      <VideoCallModal callState={callState} onEndCall={endCall} />

      {/* Debug Panel */}
      <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg max-w-md max-h-96 overflow-auto text-xs">
        <h3 className="font-bold mb-2">Debug Info</h3>
        <div className="space-y-1">
          <div>Rescue Teams: {debugInfo.rescueTeams?.length || 0}</div>
          <div>All Admins: {debugInfo.allAdmins?.length || 0}</div>
          <div>Online Admins: {debugInfo.onlineAdmins?.length || 0}</div>
          <div>Rescue Admins: {debugInfo.allAdmins?.filter((a: any) => a.team === 'rescue').length || 0}</div>
          <div>Online Rescue Admins: {debugInfo.onlineAdmins?.filter((a: any) => a.team === 'rescue').length || 0}</div>
          {debugInfo.rescueTeams?.filter((team: any) => team.name.includes('Adtuyon')).map((team: any) => (
            <div key={team.id} className="ml-2 text-green-300">- {team.name} ✅</div>
          ))}
          {debugInfo.allAdmins?.filter((a: any) => a.team === 'rescue').map((admin: any) => (
            <div key={admin.id} className="ml-2 text-yellow-300">
              Admin: {admin.full_name} ({admin.is_online ? 'ONLINE' : 'OFFLINE'})
            </div>
          ))}
          <div className="mt-2 pt-2 border-t border-gray-600">
            <div className="text-red-300 font-bold">To fix the issue:</div>
            <div>1. Run SQL from database/add-call-signals-table.sql</div>
            <div>2. Create admin account at /admin with "rescue" team</div>
            <div>3. Login as admin and stay online</div>
            <div>4. Test call from citizen dashboard</div>
          </div>
        </div>
      </div>
    </div>;
}