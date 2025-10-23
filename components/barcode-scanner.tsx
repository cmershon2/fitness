"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Camera, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";

// Dynamically import BarcodeScanner to avoid SSR issues
const BarcodeScanner = dynamic(
    () => {
        // Import polyfill first
        import("react-barcode-scanner/polyfill");
        return import("react-barcode-scanner").then((mod) => mod.BarcodeScanner);
    },
    { ssr: false }
);

interface BarcodeScannerProps {
    onFoodDetected: (food: any) => void;
}

export function BarcodeScannerComponent({ onFoodDetected }: BarcodeScannerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPaused, setIsPaused] = useState(false);

    const lookupBarcode = async (barcode: string) => {
        setIsLoading(true);
        setIsPaused(true); // Pause scanning while looking up

        try {
            const response = await fetch(`/api/foods/barcode/${barcode}`);
            const data = await response.json();

            if (!response.ok || !data.found) {
                toast.error("This barcode was not found in the database. You can add it manually.");
                setIsOpen(false);
                return;
            }

            onFoodDetected(data);
            setIsOpen(false);
            toast.success("Product Found!");
        } catch (error) {
            console.error("Error looking up barcode:", error);
            toast.error("Failed to lookup barcode. Please try again.");
            setIsPaused(false); // Resume scanning on error
        } finally {
            setIsLoading(false);
        }
    };

    const onCapture = useCallback(
        (detectedBarcodes: any[]) => {
            if (detectedBarcodes && detectedBarcodes.length > 0 && !isLoading) {
                const barcode = detectedBarcodes[0].rawValue;
                console.log("Barcode detected:", barcode);
                lookupBarcode(barcode);
            }
        },
        [isLoading]
    );

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        setError(null);
        setIsPaused(false);

        if (!open) {
            setIsLoading(false);
        }
    };

    const scannerOptions = {
        delay: 500, // Check every 500ms for better responsiveness
        formats: [
            "ean_13",
            "ean_8",
            "upc_a",
            "upc_e",
            "code_128",
            "code_39",
        ],
    };

    return (
        <>
            <Button onClick={() => handleOpenChange(true)} variant="outline">
                <Camera className="mr-2 h-4 w-4" />
                Scan Barcode
            </Button>

            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Scan Barcode</DialogTitle>
                        <DialogDescription>
                            Point your camera at a product barcode to scan
                        </DialogDescription>
                    </DialogHeader>

                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
                        {isLoading ? (
                            <div className="flex h-full items-center justify-center">
                                <div className="text-center text-white">
                                    <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin" />
                                    <p className="text-sm">Looking up product...</p>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="flex h-full items-center justify-center p-4 text-center">
                                <div className="text-white">
                                    <X className="mx-auto mb-2 h-8 w-8" />
                                    <p className="text-sm">{error}</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <BarcodeScanner
                                    onCapture={onCapture}
                                    options={scannerOptions}
                                    paused={isPaused}
                                />
                                {/* Scanning overlay - visual indicator */}
                                {!isPaused && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="h-32 w-64 rounded-lg border-4 border-green-500 bg-transparent">
                                            <div className="absolute left-1/2 top-1/2 h-0.5 w-full -translate-x-1/2 -translate-y-1/2 bg-green-500 animate-pulse" />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div className="flex justify-between">
                        <Button variant="outline" onClick={() => handleOpenChange(false)}>
                            Cancel
                        </Button>
                        {error && (
                            <Button onClick={() => setError(null)}>
                                Retry
                            </Button>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}