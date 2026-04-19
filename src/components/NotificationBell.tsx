'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from './ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { Skeleton } from './ui/skeleton';
import Link from 'next/link';

export function NotificationBell() {
  const { data, isLoading, unreadCount, markAllRead, isMarkingAllRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await markAllRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-12 z-50 w-80 rounded-lg border bg-background shadow-lg">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    disabled={isMarkingAllRead}
                    className="text-sm text-primary hover:underline disabled:opacity-50"
                  >
                    {isMarkingAllRead ? 'Marking...' : 'Mark all read'}
                  </button>
                )}
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : data && data.notifications.length > 0 ? (
                <div className="divide-y">
                  {data.notifications.slice(0, 5).map((notification) => (
                    <Link
                      key={notification.id}
                      href="/notifications"
                      className="block p-4 hover:bg-accent transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex items-start gap-3">
                        {!notification.readAt && (
                          <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{notification.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {notification.body}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <p className="text-sm">No notifications</p>
                </div>
              )}
            </div>
            {data && data.notifications.length > 5 && (
              <div className="p-4 border-t">
                <Link
                  href="/notifications"
                  className="text-sm text-primary hover:underline block text-center"
                  onClick={() => setIsOpen(false)}
                >
                  View all notifications
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
