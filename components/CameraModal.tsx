import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Icon from './Icon';
import Button from './Button';
import Modal from './Modal';

interface CameraModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: (dataUrl: string) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
    const { t } = useLanguage();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [cameraState, setCameraState] = useState<'idle' | 'granted' | 'denied'>('idle');
    const [isLoading, setIsLoading] = useState(false);
    const [isStreamReady, setIsStreamReady] = useState(false);

    const enableStream = useCallback(async () => {
        if (isLoading) return;
        
        setIsLoading(true);
        setIsStreamReady(false);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.onloadedmetadata = () => setIsStreamReady(true);
                setStream(mediaStream);
                setCameraState('granted');
            }
        } catch (err) {
            console.error("Error accessing camera: ", err);
            setCameraState('denied');
        } finally {
            setIsLoading(false);
        }
    }, [isLoading]);

    const stopStream = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            setCameraState('idle');
            setIsStreamReady(false);
        }
    }, [stream]);

    useEffect(() => {
        if (isOpen && cameraState === 'idle') {
            enableStream();
        } else if (!isOpen) {
            stopStream();
        }
    }, [isOpen, cameraState, enableStream, stopStream]);

    // Cleanup stream on component unmount
    useEffect(() => {
        return () => stopStream();
    }, [stopStream]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const dataUrl = canvas.toDataURL('image/jpeg');
                onCapture(dataUrl);
            }
        }
    };
    
    const renderContent = () => {
        switch (cameraState) {
            case 'idle':
                return (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                        <svg className="animate-spin h-10 w-10 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                );
            case 'denied':
                return (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 text-dark-text-secondary">
                        <Icon name="camera" className="w-16 h-16 mb-4" />
                        <h2 className="text-xl font-bold text-danger mb-2">{t('camera_denied_title')}</h2>
                        <p className="max-w-xs mb-6">{t('camera_denied_subtitle')}</p>
                        <Button onClick={enableStream} disabled={isLoading}>
                            {isLoading ? t('camera_loading') : t('camera_try_again')}
                        </Button>
                    </div>
                );
            case 'granted':
                return (
                    <div className="relative w-full h-full bg-dark-bg flex items-center justify-center">
                        <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover transition-opacity duration-300 ${isStreamReady ? 'opacity-100' : 'opacity-0'}`} />
                        {!isStreamReady && (
                            <div className="h-full w-full flex items-center justify-center absolute inset-0">
                                <svg className="animate-spin h-10 w-10 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };
    
    const footer = (
         <div className="flex justify-center">
            <Button
                onClick={handleCapture}
                disabled={!stream || !isStreamReady}
                aria-label={t('camera_capture')}
                shape="pill"
                className="w-40"
            >
                <Icon name="camera" className="w-6 h-6" />
                <span>{t('camera_capture')}</span>
            </Button>
        </div>
    );
    
    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={t('camera_title')}
            footer={footer}
            className="p-0"
        >
            <div className="aspect-square w-full rounded-radius-std overflow-hidden">
                <canvas ref={canvasRef} className="hidden" />
                {renderContent()}
            </div>
        </Modal>
    );
};

export default CameraModal;