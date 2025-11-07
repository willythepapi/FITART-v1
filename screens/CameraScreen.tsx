import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Camera, CameraType, FlashMode } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { styled } from 'nativewind';
import { useLanguage } from '../context/LanguageContext';
import Icon from '../components/Icon';
import Button from '../components/Button';
import AppTextField from '../components/AppTextField';
import { useAppUseCases } from '../application/usecase-provider';
import type { NavItem } from '../types';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledImage = styled(Image);

// Save progress screen component, nested for simplicity
const SaveProgressScreen: React.FC<{
    imageUri: string;
    onRetake: () => void;
    onSave: (note: string) => void;
    isSaving: boolean;
}> = ({ imageUri, onRetake, onSave, isSaving }) => {
    const [note, setNote] = useState('');
    
    return (
        <StyledView className="absolute inset-0 bg-dark-bg flex flex-col justify-center items-center p-4">
            <StyledView className="w-full max-w-[360px] aspect-[9/16] rounded-radius-std overflow-hidden mb-4 shadow-lg">
                <StyledImage source={{ uri: imageUri }} className="w-full h-full" />
            </StyledView>

            <StyledView className="w-full max-w-[360px]">
                {/* Fix: Changed onChangeText to onChange and adapted the handler to use e.target.value. */}
                <AppTextField 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add a note... (optional)"
                    className="mb-4"
                />

                <StyledView className="flex-row justify-center gap-4">
                    {/* Fix: Changed onPress to onClick to match the Button component's expected props. */}
                    <Button onClick={onRetake} variant="ghost" disabled={isSaving}>
                        Retake
                    </Button>
                    {/* Fix: Changed onPress to onClick to match the Button component's expected props. */}
                    <Button onClick={() => onSave(note)} variant="primary" disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Progress'}
                    </Button>
                </StyledView>
            </StyledView>
        </StyledView>
    );
};


const CameraScreen: React.FC<{ setActiveTab: (tab: NavItem) => void }> = ({ setActiveTab }) => {
    const { t } = useLanguage();
    const [permission, requestPermission] = Camera.useCameraPermissions();
    const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
    const [type, setType] = useState(CameraType.back);
    const [flash, setFlash] = useState(FlashMode.off);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const { addProgressPhoto } = useAppUseCases();
    const cameraRef = useRef<Camera>(null);

    useEffect(() => {
        if (!mediaPermission) {
            requestMediaPermission();
        }
    }, [mediaPermission, requestMediaPermission]);

    if (!permission) {
        // Camera permissions are still loading
        return <StyledView className="flex-1 justify-center items-center bg-dark-bg"><ActivityIndicator size="large" color="#7FB7FF" /></StyledView>;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet
        return (
            <StyledView className="flex-1 justify-center items-center bg-dark-bg p-5">
                <Icon name="camera" size={64} color="#AAB8C2" />
                <StyledText className="text-xl font-bold text-center text-dark-text-primary mt-4">{t('camera_enable_title')}</StyledText>
                <StyledText className="text-center text-dark-text-secondary mt-2 mb-6">{t('camera_enable_subtitle')}</StyledText>
                {/* Fix: Changed onPress to onClick to match the Button component's expected props. */}
                <Button onClick={requestPermission}>{t('camera_allow_access')}</Button>
            </StyledView>
        );
    }
    
    function toggleCameraType() {
        setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
    }

    function toggleFlash() {
        setFlash(current => (current === FlashMode.off ? FlashMode.on : FlashMode.off));
    }

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.8,
                    base64: true, // Needed for data URL
                });
                setCapturedImage(`data:image/jpeg;base64,${photo.base64}`);
            } catch (error) {
                console.log('Error taking picture', error);
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
    
    return (
        <StyledView className="flex-1 bg-dark-bg">
            {capturedImage ? (
                <SaveProgressScreen
                    imageUri={capturedImage}
                    onRetake={handleRetake}
                    onSave={handleSaveProgress}
                    isSaving={isSaving}
                />
            ) : (
                <Camera style={StyleSheet.absoluteFill} type={type} flashMode={flash} ref={cameraRef}>
                    <StyledView className="flex-1 bg-transparent flex-row justify-between p-5">
                        <StyledTouchableOpacity onPress={toggleFlash} className="rounded-full bg-black/30 w-12 h-12 items-center justify-center">
                            <Icon name={flash === FlashMode.on ? 'flash' : 'flash-off'} size={24} color="white" />
                        </StyledTouchableOpacity>
                        <StyledTouchableOpacity onPress={toggleCameraType} className="rounded-full bg-black/30 w-12 h-12 items-center justify-center">
                            <Icon name="camera-flip" size={24} color="white" />
                        </StyledTouchableOpacity>
                    </StyledView>
                    <StyledView className="absolute bottom-[84px] left-0 right-0 w-full flex justify-center items-center">
                        <StyledTouchableOpacity
                            onPress={takePicture}
                            aria-label="Capture photo"
                            className="w-18 h-18 rounded-full bg-transparent border-4 border-white flex items-center justify-center"
                        >
                            <StyledView className="w-14 h-14 rounded-full bg-white" />
                        </StyledTouchableOpacity>
                    </StyledView>
                </Camera>
            )}
        </StyledView>
    );
};

export default CameraScreen;