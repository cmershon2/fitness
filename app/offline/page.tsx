"use client";

import { WifiOff } from 'lucide-react';

export default function Offline() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4 p-8">
                <div className="flex justify-center">
                    <div className="rounded-full bg-muted p-4">
                        <WifiOff className="h-12 w-12 text-muted-foreground" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold">You&apos;re Offline</h1>
                <p className="text-muted-foreground max-w-md">
                    It looks like you&apos;ve lost your internet connection.
                    Some features may not be available until you&apos;re back online.
                </p>
                <div className="pt-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        </div>
    );
}