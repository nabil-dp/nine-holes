import { useEffect } from 'react';
import socketService from '../services/socketService';

const useSocket = () => {
  const { on, off, emit, isConnected } = socketService;

  const listen = (event, callback) => {
    useEffect(() => {
      socketService.on(event, callback);
      return () => socketService.off(event, callback);
    }, [event, callback]);
  };

  return {
    isConnected: socketService.isConnected,
    emit: socketService.emit.bind(socketService),
    on: socketService.on.bind(socketService),
    off: socketService.off.bind(socketService),
    listen,
  };
};

export default useSocket;
