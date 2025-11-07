import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Icon from '../components/Icon';
import Button from '../components/Button';
import AppTextField from '../components/AppTextField';
import { useAppUseCases } from '../application/usecase-provider';
import type { NavItem } from '../types';
import type { UserEntity } from '../domain/entities';

// Save progress screen component, nested for simplicity
const SaveProgressScreen: React.FC<{
    imageSrc: string;
    onRetake: () => void;
    onSave: (note: string) => void;
    isSaving: boolean;
}> = ({ imageSrc, onRetake, onSave, isSaving }) => {
    const [note, setNote] = useState('');
    
    return (
        <div className="absolute inset-0 bg-dark-bg flex flex-col justify-center items-center animate-fadeIn p-4">
            <div className="w-full max-w-[360px] aspect-[9/16] rounded-radius-std overflow-hidden mb-4 shadow-lg">
                <img src={imageSrc} alt="Captured preview" className="w-full h-full object-cover" />
            </div>

            <div className="w-full max-w-[360px]">
                <AppTextField 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add a note... (optional)"
                    className="mb-4"
                />

                <div className="flex justify-center gap-4">
                    <Button onClick={onRetake} variant="ghost" disabled={isSaving}>
                        Retake
                    </Button>
                    <Button onClick={() => onSave(note)} variant="primary" disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Progress'}
                    </Button>
                </div>
            </div>
        </div>
    );
};


const CameraScreen: React.FC<{ setActiveTab: (tab: NavItem) => void }> = ({ setActiveTab }) => {
    const { t } = useLanguage();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [cameraState, setCameraState] = useState<'idle' | 'granted' | 'denied'>('idle');
    const [isLoading, setIsLoading] = useState(true);
    const [isStreamReady, setIsStreamReady] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
    const [isSaving, setIsSaving] = useState(false);
    const { addProgressPhoto, getUserProfile } = useAppUseCases();
    
    const [hasFlash, setHasFlash] = useState(false);
    const [isFlashOn, setIsFlashOn] = useState(false);

    useEffect(() => {
        if (capturedImage) {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                setStream(null);
            }
            return;
        }

        let active = true;
        
        const getStream = async () => {
            if (stream) {
                 stream.getTracks().forEach(track => track.stop());
            }

            setIsLoading(true);
            setIsStreamReady(false);
            setHasFlash(false); // Reset flash state on stream change
            
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
                if (active) {
                    const track = mediaStream.getVideoTracks()[0];
                    if (track) {
                        const capabilities = track.getCapabilities();
                        setHasFlash('torch' in capabilities);
                    }
                    setStream(mediaStream);
                    setCameraState('granted');
                }
            } catch (err) {
                if (active) {
                    console.error("Error accessing camera: ", err);
                    setCameraState('denied');
                }
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        };

        getStream();

        return () => {
            active = false;
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                setStream(null);
            }
        };
    }, [facingMode, capturedImage]);

    useEffect(() => {
        if (stream && videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(e => console.error("Video play failed", e));
            
            const handleCanPlay = () => setIsStreamReady(true);
            
            const currentVideoRef = videoRef.current;
            currentVideoRef.addEventListener('canplay', handleCanPlay);

            return () => {
                currentVideoRef.removeEventListener('canplay', handleCanPlay);
            }
        }
    }, [stream]);

    const handleFlipCamera = () => {
        setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
    };
    
    const toggleFlash = useCallback(async () => {
      if (!stream || !hasFlash) return;
      const track = stream.getVideoTracks()[0];
      const newFlashState = !isFlashOn;
      try {
        // Fix: Cast to `any` to bypass TypeScript error for the non-standard `torch` property.
        await track.applyConstraints({
          advanced: [{ torch: newFlashState } as any],
        });
        setIsFlashOn(newFlashState);
      } catch (err) {
        console.error('Failed to toggle flash:', err);
      }
    }, [stream, hasFlash, isFlashOn]);


    const handleCapture = () => {
        if (videoRef.current && canvasRef.current && isStreamReady) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
    
            // Set canvas to a 9:16 aspect ratio for a high-quality, story-like output
            const targetAspectRatio = 9 / 16;
            canvas.width = 1080;
            canvas.height = canvas.width / targetAspectRatio; // This will be 1920
    
            const videoWidth = video.videoWidth;
            const videoHeight = video.videoHeight;
            const videoAspectRatio = videoWidth / videoHeight;
    
            let sx = 0, sy = 0, sWidth = videoWidth, sHeight = videoHeight;
    
            // This logic crops the video to fill the 9:16 canvas, simulating `object-fit: cover`
            if (videoAspectRatio > targetAspectRatio) {
                // Video is wider than the target aspect ratio (e.g., 16:9 video on 9:16 canvas)
                // We'll use the full height of the video and crop the sides.
                sWidth = videoHeight * targetAspectRatio;
                sx = (videoWidth - sWidth) / 2;
            } else {
                // Video is taller than or equal to the target aspect ratio
                // We'll use the full width of the video and crop the top and bottom.
                sHeight = videoWidth / targetAspectRatio;
                sy = (videoHeight - sHeight) / 2;
            }
    
            const context = canvas.getContext('2d');
            if (context) {
                // Draw the cropped portion of the video onto the canvas
                context.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg');
                setCapturedImage(dataUrl);
            }
        }
    };
    
    const handleRetake = () => {
        setCapturedImage(null);
    };

    const handleSaveProgress = async (note: string) => {
        if (!capturedImage) return;
        setIsSaving(true);
        try {
            await addProgressPhoto.execute({
                imageDataUrl: capturedImage,
                note: note.trim() || undefined,
            });
            setActiveTab('Progress');
            handleRetake(); 
        } catch (e) {
            console.error("Failed to save progress photo", e);
            alert("Failed to save photo. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };
    
    const renderCameraStatus = () => {
        if (isLoading) {
             return (
                <svg className="animate-spin h-10 w-10 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            );
        }
        
        if (cameraState === 'denied') {
            return (
                <div className="w-full h-full flex flex-col items-center justify-center text-center text-dark-text-secondary">
                    <Icon name="camera" className="w-16 h-16 mb-4" />
                    <h2 className="text-xl font-bold text-danger mb-2">{t('camera_denied_title')}</h2>
                    <p className="max-w-xs">{t('camera_denied_subtitle')}</p>
                </div>
            );
        }

        return null;
    }
    
    return (
        <div className="h-[calc(100vh-4rem)] w-full bg-dark-bg relative overflow-hidden">
            <canvas ref={canvasRef} className="hidden" />
            {capturedImage ? (
                <SaveProgressScreen 
                    imageSrc={capturedImage} 
                    onRetake={handleRetake} 
                    onSave={handleSaveProgress}
                    isSaving={isSaving}
                />
            ) : (
                <>
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isStreamReady ? 'opacity-100' : 'opacity-0'}`} 
                    />

                    { (isLoading || cameraState !== 'granted') && (
                         <div className="absolute inset-0 flex items-center justify-center p-4 text-center bg-dark-bg">
                           {renderCameraStatus()}
                         </div>
                    )}

                    <footer className="absolute bottom-[84px] left-0 right-0 w-full flex justify-center items-center z-10">
                        <button
                            onClick={handleCapture}
                            disabled={!isStreamReady || isLoading}
                            aria-label="Capture photo"
                            className="w-18 h-18 rounded-full bg-[rgba(0,0,0,0.35)] border-2 border-[rgba(255,255,255,0.25)] flex items-center justify-center transition-transform duration-micro ease-out active:scale-92 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Icon name="camera" className="w-8 h-8 text-white" />
                        </button>
                    </footer>
                </>
            )}
        </div>
    );
};

export default CameraScreen;