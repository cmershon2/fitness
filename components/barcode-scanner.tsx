"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Camera, Loader2, X } from "lucide-react";
import { BarcodeDetector } from "barcode-detector";

interface FoodData {
    name: string;
    brand?: string;
    barcode: string;
    calories: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    servingSize?: string;
    servingUnit?: string;
}

interface BarcodeScannerProps {
    onFoodDetected: (foodData: FoodData) => void;
}

export function BarcodeScanner({ onFoodDetected }: BarcodeScannerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            stopScanning();
        };
    }, []);

    const startScanning = async () => {
        try {
            setError(null);
            setIsScanning(true);

            // Check if BarcodeDetector is supported
            if (!("BarcodeDetector" in window)) {
                throw new Error(
                    "Barcode detection is not supported in this browser. Please use Chrome, Edge, or Safari."
                );
            }

            // Request camera access
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
            });

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();

                // Start barcode detection
                detectBarcode();
            }
        } catch (err) {
            console.error("Error starting scanner:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to access camera. Please check permissions."
            );
            setIsScanning(false);
        }
    };

    const stopScanning = () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setIsScanning(false);
    };

    const detectBarcode = async () => {
        if (!videoRef.current || !isScanning) return;

        try {
            const barcodeDetector = new BarcodeDetector({
                formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39"],
            });

            const barcodes = await barcodeDetector.detect(videoRef.current);

            if (barcodes.length > 0) {
                const barcode = barcodes[0].rawValue;
                console.log("Barcode detected:", barcode);
                await lookupBarcode(barcode);
                return;
            }

            // Continue scanning
            animationFrameRef.current = requestAnimationFrame(detectBarcode);
        } catch (err) {
            console.error("Error detecting barcode:", err);
            animationFrameRef.current = requestAnimationFrame(detectBarcode);
        }
    };

    const lookupBarcode = async (barcode: string) => {
        setIsLoading(true);
        stopScanning();

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

            toast.success("Product Found!")
        } catch (error) {
            toast.error("Failed to lookup barcode. Please try again.");
            setIsOpen(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            startScanning();
        } else {
            stopScanning();
        }
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
                        {error ? (
                            <div className="flex h-full items-center justify-center p-4 text-center">
                                <div className="text-white">
                                    <X className="mx-auto mb-2 h-8 w-8" />
                                    <p className="text-sm">{error}</p>
                                </div>
                            </div>
                        ) : isLoading ? (
                            <div className="flex h-full items-center justify-center">
                                <div className="text-center text-white">
                                    <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin" />
                                    <p className="text-sm">Looking up product...</p>
                                </div>
                            </div>
                        ) : (
                            <video
                                ref={videoRef}
                                className="h-full w-full object-cover"
                                playsInline
                                muted
                            />
                        )}

                        {isScanning && !isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-32 w-64 rounded-lg border-4 border-green-500 bg-transparent">
                                    <div className="absolute left-1/2 top-1/2 h-0.5 w-full -translate-x-1/2 -translate-y-1/2 bg-green-500 animate-pulse" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between">
                        <Button variant="outline" onClick={() => handleOpenChange(false)}>
                            Cancel
                        </Button>
                        {error && (
                            <Button onClick={startScanning}>
                                Retry
                            </Button>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}