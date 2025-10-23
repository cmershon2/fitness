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
import { Camera, Loader2, X, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import dynamic from 'next/dynamic'

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
    debug?: boolean;
}

const ReactBarcodeScanner = dynamic(() => {
    import('react-barcode-scanner/polyfill')
    return import('react-barcode-scanner').then(mod => mod.BarcodeScanner)
}, { ssr: false })

export function BarcodeScanner({ onFoodDetected, debug = false }: BarcodeScannerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [debugInfo, setDebugInfo] = useState<string>("");
    const [browserSupport, setBrowserSupport] = useState<string>("");

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Check browser support on mount
        // checkBrowserSupport();

        // Cleanup on unmount
        return () => {
            stopScanning();
        };
    }, []);

    const checkBrowserSupport = async () => {
        const support = [];

        if ('BarcodeDetector' in window) {
            support.push("✓ BarcodeDetector API supported");
        } else {
            support.push("✗ BarcodeDetector API NOT supported");
        }

        if (navigator.mediaDevices && await navigator.mediaDevices.getUserMedia()) {
            support.push("✓ Camera API supported");
        } else {
            support.push("✗ Camera API NOT supported");
        }

        setBrowserSupport(support.join("\n"));
    };

    const startScanning = async () => {
        try {
            setError(null);
            setDebugInfo("Starting camera...");
            setIsScanning(true);


            <ReactBarcodeScanner />
        } catch (err) {
            console.error("Error starting scanner:", err);
            const errorMessage = err instanceof Error ? err.message : "Failed to access camera";
            setError(errorMessage);
            setIsScanning(false);

            toast.error(`Camera Error: ${errorMessage}`)
        }
    };

    const stopScanning = () => {
        if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current);
            scanIntervalRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setIsScanning(false);
        setDebugInfo("");
    };

    const detectBarcodeFromVideo = async () => {
        if (!videoRef.current || !canvasRef.current || !isScanning) return;

        try {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            // Make sure video is ready
            if (video.readyState !== video.HAVE_ENOUGH_DATA) {
                return;
            }

            // Set canvas size to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Draw current video frame to canvas
            const context = canvas.getContext("2d");
            if (!context) return;

            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Try to detect barcodes from canvas
            const barcodeDetector = new (window as any).BarcodeDetector({
                formats: [
                    'code_128',
                    'code_39',
                    'code_93',
                    'codabar',
                    'ean_13',
                    'ean_8',
                    'itf',
                    'upc_a',
                    'upc_e',
                    'qr_code',
                    'data_matrix',
                    'aztec',
                    'pdf417'
                ],
            });

            const barcodes = await barcodeDetector.detect(canvas);

            if (debug) {
                setDebugInfo(`Scanning... (${barcodes.length} codes detected)`);
            }

            if (barcodes.length > 0) {
                const barcode = barcodes[0];
                console.log("Barcode detected:", barcode);

                // Draw rectangle around detected barcode
                if (barcode.boundingBox) {
                    context.strokeStyle = '#00FF00';
                    context.lineWidth = 3;
                    context.strokeRect(
                        barcode.boundingBox.x,
                        barcode.boundingBox.y,
                        barcode.boundingBox.width,
                        barcode.boundingBox.height
                    );
                }

                setDebugInfo(`Detected: ${barcode.format} - ${barcode.rawValue}`);

                // Stop scanning and lookup
                await lookupBarcode(barcode.rawValue);
            }
        } catch (err) {
            console.error("Error detecting barcode:", err);
            if (debug) {
                setDebugInfo(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
            }
        }
    };

    const lookupBarcode = async (barcode: string) => {
        setIsLoading(true);
        stopScanning();

        try {
            setDebugInfo(`Looking up barcode: ${barcode}`);

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
            console.error("Barcode lookup error:", error);
            toast.error("Failed to lookup barcode. Please try again.");
            setIsOpen(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            setDebugInfo("");
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
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Scan Barcode</DialogTitle>
                        <DialogDescription>
                            Point your camera at a product barcode
                        </DialogDescription>
                    </DialogHeader>

                    {/* Browser Support Info */}
                    {browserSupport && !browserSupport.includes("✓ BarcodeDetector") && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Your browser doesn't support barcode scanning. Please use Chrome, Edge, or Safari 17+.
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-4">
                        {/* Video Container */}
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
                                <>
                                    <video
                                        ref={videoRef}
                                        className="h-full w-full object-cover"
                                        playsInline
                                        muted
                                        autoPlay
                                    />
                                    <canvas
                                        ref={canvasRef}
                                        className="absolute inset-0 h-full w-full"
                                        style={{ display: debug ? 'block' : 'none' }}
                                    />
                                </>
                            )}

                            {/* Scanning Overlay */}
                            {isScanning && !isLoading && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="relative h-48 w-80 rounded-lg border-4 border-green-500">
                                        {/* Scanning line animation */}
                                        <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse" />

                                        {/* Corner markers */}
                                        <div className="absolute -left-1 -top-1 h-6 w-6 border-l-4 border-t-4 border-green-500" />
                                        <div className="absolute -right-1 -top-1 h-6 w-6 border-r-4 border-t-4 border-green-500" />
                                        <div className="absolute -bottom-1 -left-1 h-6 w-6 border-b-4 border-l-4 border-green-500" />
                                        <div className="absolute -bottom-1 -right-1 h-6 w-6 border-b-4 border-r-4 border-green-500" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Debug Info */}
                        {debug && debugInfo && (
                            <div className="rounded-md bg-muted p-3 text-xs font-mono">
                                <div className="mb-2 font-semibold">Debug Info:</div>
                                <div className="whitespace-pre-wrap">{debugInfo}</div>
                                <div className="mt-2 whitespace-pre-wrap text-muted-foreground">
                                    {browserSupport}
                                </div>
                            </div>
                        )}

                        {/* Instructions */}
                        <div className="text-center text-sm text-muted-foreground">
                            <p className="mb-2">
                                {isScanning
                                    ? "Position the barcode within the frame"
                                    : "Click 'Start Scanning' to begin"}
                            </p>
                            <p className="text-xs">
                                Supported: UPC, EAN, Code 128, QR codes, and more
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-between gap-2">
                            <Button variant="outline" onClick={() => handleOpenChange(false)}>
                                Cancel
                            </Button>
                            {error && (
                                <Button onClick={startScanning}>
                                    Retry
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}