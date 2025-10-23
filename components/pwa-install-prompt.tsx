'use client';

import { useState, useEffect } from 'react';
import { usePWA } from '@/hooks/usePWA';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

export default function PWAInstallPrompt() {
    const { isInstallable, isInstalled, installApp } = usePWA();
    const [showPrompt, setShowPrompt] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Check if user previously dismissed the prompt
        const wasDismissed = localStorage.getItem('pwa-install-dismissed');
        if (wasDismissed) {
            setDismissed(true);
        }
    }, []);

    useEffect(() => {
        // Show prompt after a short delay if installable and not dismissed
        if (isInstallable && !dismissed && !isInstalled) {
            const timer = setTimeout(() => {
                setShowPrompt(true);
            }, 3000); // Show after 3 seconds

            return () => clearTimeout(timer);
        }
    }, [isInstallable, dismissed, isInstalled]);

    const handleInstall = async () => {
        await installApp();
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        setDismissed(true);
        localStorage.setItem('pwa-install-dismissed', 'true');
    };

    if (!showPrompt || !isInstallable || isInstalled) {
        return null;
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-5 duration-500">
            <div className="bg-card border rounded-lg shadow-lg p-4">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                        <Download className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm mb-1">Install Fitness Tracker</h3>
                        <p className="text-xs text-muted-foreground mb-3">
                            Install our app for quick access and offline functionality
                        </p>
                        <div className="flex gap-2">
                            <Button size="sm" onClick={handleInstall} className="flex-1">
                                Install
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleDismiss}>
                                Not now
                            </Button>
                        </div>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Close"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}