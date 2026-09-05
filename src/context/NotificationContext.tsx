import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  createdAt: number;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (title: string, message: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'codequest_notifications_';

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Load notifications from local storage when user changes
  useEffect(() => {
    if (user?.id) {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${user.id}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as AppNotification[];
          setNotifications(parsed);
        } catch (e) {
          console.error('Failed to parse notifications', e);
        }
      } else {
        // Initial welcome notification for new sessions without stored notifs
        setNotifications([{
          id: Date.now().toString(),
          title: 'Welcome to CodeCity',
          message: 'Your journey begins now. Complete quests to earn Hacksilver and increase your tier!',
          time: 'Just now',
          unread: true,
          createdAt: Date.now()
        }]);
      }
    } else {
      setNotifications([]);
    }
  }, [user?.id]);

  // Save to local storage whenever notifications change
  useEffect(() => {
    if (user?.id && notifications.length > 0) {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${user.id}`, JSON.stringify(notifications));
    } else if (user?.id && notifications.length === 0) {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${user.id}`);
    }
  }, [notifications, user?.id]);

  const addNotification = (title: string, message: string) => {
    const newNotif: AppNotification = {
      id: Date.now().toString() + Math.random().toString(36).substring(7),
      title,
      message,
      time: 'Just now', // Ideally, we calculate relative time on render, but this works for now
      unread: true,
      createdAt: Date.now()
    };
    
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => notif.id === id ? { ...notif, unread: false } : notif)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, unread: false })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearAll
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
