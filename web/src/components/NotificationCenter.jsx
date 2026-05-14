import { Bell, Check, X, UserPlus } from 'lucide-react';
import Button from './Button';
import useNotifications from '../hooks/useNotifications';
import { formatDate } from '../utils/helpers';

const NotificationCenter = () => {
  const { notifications, isLoading, markAsRead, deleteNotification, acceptInvite, declineInvite } =
    useNotifications();

  if (isLoading) {
    return <p className="text-sm text-gray-400 text-center py-6">Loading...</p>;
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        <Bell size={36} className="mx-auto mb-2 opacity-30" />
        <p className="text-sm">No notifications</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {notifications.map((notif) => (
        <div
          key={notif._id}
          className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
            notif.read ? 'bg-gray-50 border-gray-100' : 'bg-blue-50 border-blue-100'
          }`}
        >
          {/* Icon */}
          <div className="mt-0.5 shrink-0">
            {notif.type === 'invite' ? (
              <UserPlus size={18} className="text-blue-500" />
            ) : (
              <Bell size={18} className="text-gray-400" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-800">{notif.message}</p>
            <p className="text-xs text-gray-400 mt-0.5">{formatDate(notif.created_at)}</p>

            {/* Invite actions */}
            {notif.type === 'invite' && !notif.read && (
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => acceptInvite(notif._id)}
                  className="gap-1"
                >
                  <Check size={14} /> Accept
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => declineInvite(notif._id)}
                  className="gap-1"
                >
                  <X size={14} /> Decline
                </Button>
              </div>
            )}
          </div>

          {/* Delete */}
          <button
            onClick={() => deleteNotification(notif._id)}
            className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors mt-0.5"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationCenter;
