
"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, VideoOff, Camera, Upload, RotateCw, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { storage } from '@/lib/firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import Image from 'next/image';

export default function CameraPage() {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("Media Devices API not available.");
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Not Supported',
          description: 'Your browser does not support camera access.',
        });
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this app.',
        });
      }
    };

    getCameraPermission();
    
    return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    };
  }, [toast]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/png');
        setCapturedImage(dataUrl);
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };
  
  const handleSaveImage = async () => {
    if (!capturedImage) return;

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `captures/${Date.now()}.png`);
      await uploadString(storageRef, capturedImage, 'data_url');
      
      toast({
        title: 'Image Saved',
        description: 'Your captured image has been saved to the library.',
      });
      router.push('/dashboard/images');
    } catch (error) {
      console.error("Error saving image:", error);
      toast({
        title: 'Upload Failed',
        description: 'There was a problem saving your image.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };


  return (
    <div className="space-y-6">
        <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" asChild>
                <Link href="/dashboard">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
            </Button>
            <div>
                <h1 className="text-2xl font-bold font-headline">Live Camera</h1>
                <p className="text-muted-foreground">Use your device's camera to capture product images.</p>
            </div>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>{capturedImage ? 'Image Preview' : 'Camera Feed'}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="w-full max-w-2xl mx-auto">
                    <div className="aspect-video bg-black rounded-md overflow-hidden relative">
                         <video ref={videoRef} className={`w-full h-full object-cover ${capturedImage ? 'hidden' : ''}`} autoPlay muted playsInline />
                         {capturedImage && (
                             <Image src={capturedImage} alt="Captured preview" layout="fill" objectFit="contain" />
                         )}
                         {hasCameraPermission === false && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white p-4">
                                <VideoOff className="h-12 w-12 mb-4" />
                                <p className="font-bold">Camera is off or unavailable.</p>
                            </div>
                         )}
                    </div>
                     {hasCameraPermission === false && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertTitle>Camera Access Required</AlertTitle>
                            <AlertDescription>
                                Please allow camera access in your browser settings to use this feature.
                            </AlertDescription>
                        </Alert>
                    )}
                    {hasCameraPermission === true && (
                        <div className="mt-4 flex justify-center space-x-4">
                            {!capturedImage ? (
                                <Button size="lg" onClick={handleCapture}>
                                    <Camera className="mr-2 h-4 w-4" />
                                    Capture Image
                                </Button>
                            ) : (
                                <>
                                    <Button size="lg" variant="outline" onClick={handleRetake} disabled={isUploading}>
                                        <RotateCw className="mr-2 h-4 w-4" />
                                        Retake
                                    </Button>
                                    <Button size="lg" onClick={handleSaveImage} disabled={isUploading}>
                                        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                        {isUploading ? 'Saving...' : 'Save Image'}
                                    </Button>
                                </>
                            )}
                        </div>
                    )}
                </div>
                <canvas ref={canvasRef} className="hidden"></canvas>
            </CardContent>
        </Card>
    </div>
  );
}
