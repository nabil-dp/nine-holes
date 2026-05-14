import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationAPI } from '../services/api';
import socketService from '../services/socketService';
import useAuthStore from '../store/authStore';
import { SOCKET_EVENTS } from '../utils/constants';

const useNotifications = () => {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    if (!user?._id) return;
    setIsLoading(true);
    try {
      const res = await notificationAPI.getAll(user._id);
      setNotifications(res.data.notifications || []);
    } catch {
      // silent fail
    } finally {
      setIsLoading(false);
    }
  }, [user?._id]);

  // Real-time: receive invite
  useEffect(() => {
    const handler = (data) => {
      setNotifications((prev) => [{ ...data, read: false, _id: data.notification_id }, ...prev]);
    };
    socketService.on(SOCKET_EVENTS.INVITE_RECEIVED, handler);
    return () => socketService.off(SOCKET_EVENTS.INVITE_RECEIVED, handler);
  }, []);

  // Real-time: game ready after accept invite
  useEffect(() => {
    const handler = (data) => {
      // Show confirmation toast/modal
      const confirmJoin = window.confirm(
        `${data.opponent.username} accepted your invite!\n\nJoin the game room now?`
      );

      if (confirmJoin) {
        navigate(`/game/${data.session_id}`);
      }
    };
    socketService.on(SOCKET_EVENTS.GAME_READY, handler);
    return () => socketService.off(SOCKET_EVENTS.GAME_READY, handler);
  }, [navigate]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (notificationId) => {
    if (!user?._id) return;
    try {
      await notificationAPI.markAsRead(user._id, notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
    } catch {}
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationAPI.delete(notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
    } catch {}
  };

  const sendInvite = (toUserId) => {
    socketService.emit(SOCKET_EVENTS.SEND_INVITE, { to_user_id: toUserId });
  };

  const acceptInvite = (notificationId) => {
    socketService.emit(SOCKET_EVENTS.ACCEPT_INVITE, { notification_id: notificationId });
    markAsRead(notificationId);
  };

  const declineInvite = (notificationId) => {
    socketService.emit(SOCKET_EVENTS.DECLINE_INVITE, { notification_id: notificationId });
    markAsRead(notificationId);
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    deleteNotification,
    sendInvite,
    acceptInvite,
    declineInvite,
  };
};

export default useNotifications;