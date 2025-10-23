'use client';

import { usePWA } from '@/hooks/usePWA';
import { WifiOff, Wifi } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function OfflineIndicator() {
    const { isOnline } = usePWA();
    const [showOffline, setShowOffline] = useState(false);
    const [showOnlineNotification, setShowOnlineNotification] = useState(false);

    useEffect(() => {
        if (!isOnline) {
            setShowOffline(true);
        } else {
            if (showOffline) {
                // Show "back online" notification briefly
                setShowOnlineNotification(true);
                setTimeout(() => {
                    setShowOnlineNotification(false);
                }, 3000);
            }
            setShowOffline(false);
        }
    }, [isOnline, showOffline]);

    if (showOnlineNotification) {
        return (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-5 duration-300">
                <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                    <Wifi className="h-4 w-4" />
                    <span className="text-sm font-medium">Back online</span>
                </div>
            </div>
        );
    }

    if (!showOffline) {
        return null;
    }

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-5 duration-300">
            <div className="bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                <WifiOff className="h-4 w-4" />
                <span className="text-sm font-medium">You are offline</span>
            </div>
        </div>
    );
}