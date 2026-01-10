import { useEffect, useRef, useState } from 'react';

interface ActionCableMessage {
  type: string;
  data?: any;
  id?: number;
}

export function useActionCable(url: string, channel: string, token?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ActionCableMessage[]>([]);
  const cableRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!token) return;

    // Simple ActionCable client implementation
    const connect = () => {
      const wsUrl = url.replace(/^http/, 'ws') + '/cable';
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
        console.log('ActionCable connected');
        
        // Send subscribe message
        const subscribeMessage = {
          command: 'subscribe',
          identifier: JSON.stringify({ channel: channel })
        };
        ws.send(JSON.stringify(subscribeMessage));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'welcome' || data.type === 'confirm_subscription') {
            console.log('ActionCable subscription confirmed');
            return;
          }
          
          if (data.message) {
            setMessages((prev) => [...prev, data.message]);
          }
        } catch (error) {
          console.error('Failed to parse ActionCable message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('ActionCable error:', error);
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log('ActionCable disconnected');
        
        // Reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      cableRef.current = ws;
    };

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (cableRef.current) {
        cableRef.current.close();
      }
    };
  }, [url, channel, token]);

  const sendMessage = (action: string, data: any) => {
    if (cableRef.current && isConnected) {
      const message = {
        command: 'message',
        identifier: JSON.stringify({ channel: channel }),
        data: JSON.stringify({ action: action, ...data })
      };
      cableRef.current.send(JSON.stringify(message));
    }
  };

  return { isConnected, messages, sendMessage };
}

