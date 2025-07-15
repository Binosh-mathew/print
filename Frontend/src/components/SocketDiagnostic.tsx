import { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import axios from '@/config/axios';

type BackendInfo = {
  socketRunning: boolean;
  connections: number;
  path: string;
  transports: string[] | string;
  rooms: string[];
  serverInfo?: {
    version?: string;
    socketIOVersion?: string;
    env?: string;
    port?: string | number;
    frontendUrl?: string;
  };
};

export const SocketDiagnostic = () => {
  const socket = useSocket();
  const [backendInfo, setBackendInfo] = useState<BackendInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [envVars, setEnvVars] = useState({});
  
  // Fetch server debug info
  const fetchDebugInfo = async () => {
    setLoading(true);
    try {
      // Use the API URL with /api path
      const response = await axios.get('/socket-debug');
      if (response.data && response.data.data) {
        setBackendInfo(response.data.data);
        toast({
          title: 'Debug info loaded',
          description: 'Successfully connected to server',
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching debug info:', error);
      toast({
        title: 'Connection failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Collect environment variables
  useEffect(() => {
    const vars = {
      VITE_API_URL: import.meta.env.VITE_API_URL || 'Not set',
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'Not set',
      VITE_SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'Not set',
      VITE_NODE_ENV: import.meta.env.VITE_NODE_ENV || 'Not set',
    };
    setEnvVars(vars);
  }, []);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Socket.IO Diagnostic Tool</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Client Connection</h3>
            <div className="flex items-center space-x-2">
              <div 
                className={`w-3 h-3 rounded-full ${socket.isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} 
              />
              <span>{socket.isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            {socket.lastError && (
              <div className="text-red-500 text-sm mt-1">
                Error: {socket.lastError}
              </div>
            )}
            <div className="flex space-x-2 mt-2">
              <Button 
                size="sm" 
                onClick={socket.reconnect}
                disabled={socket.isConnected}
              >
                Reconnect
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={fetchDebugInfo}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Fetch Server Info'}
              </Button>
            </div>
          </div>
          
          {/* Environment Variables */}
          <div>
            <h3 className="text-lg font-medium mb-2">Environment Variables</h3>
            <div className="text-sm space-y-1">
              {Object.entries(envVars).map(([key, value]) => (
                <div key={key} className="flex">
                  <span className="font-mono mr-2">{key}:</span>
                  <span className="font-mono text-blue-600">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Server Information */}
        {backendInfo && (
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Server Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm">Socket.IO Status</h4>
                <div className="text-sm space-y-1 mt-1">
                  <div>Server Running: {backendInfo.socketRunning ? 'Yes' : 'No'}</div>
                  <div>Active Connections: {backendInfo.connections}</div>
                  <div>Socket.IO Path: {backendInfo.path}</div>
                  <div>Transport Methods: {Array.isArray(backendInfo.transports) 
                    ? backendInfo.transports.join(', ') 
                    : backendInfo.transports}</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-sm">Active Rooms</h4>
                <div className="text-sm mt-1">
                  {backendInfo.rooms.length > 0 ? (
                    <ul className="list-disc list-inside">
                      {backendInfo.rooms.map(room => (
                        <li key={room}>{room}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No active rooms</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium text-sm">Server Details</h4>
              <div className="text-sm mt-1">
                <div>Node.js Version: {backendInfo.serverInfo?.version || 'Unknown'}</div>
                <div>Socket.IO Version: {backendInfo.serverInfo?.socketIOVersion || 'Unknown'}</div>
                <div>Environment: {backendInfo.serverInfo?.env || 'Unknown'}</div>
                <div>Port: {backendInfo.serverInfo?.port || 'Unknown'}</div>
                <div>Frontend URL: {backendInfo.serverInfo?.frontendUrl || 'Unknown'}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SocketDiagnostic;
