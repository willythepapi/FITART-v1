import React, { useRef, useState, useEffect } from 'react';
import * as htmlToImage from 'html-to-image';
import type { ProgressPhotoEntity } from '../domain/entities';
import { useLanguage } from '../context/LanguageContext';
import Icon from '../components/Icon';
import Button from '../components/Button';

interface ProgressPhotoPosterScreenProps {
  photo: ProgressPhotoEntity;
  onClose: () => void;
}

const ProgressPhotoPosterScreen: React.FC<ProgressPhotoPosterScreenProps> = ({ photo, onClose }) => {
  const posterRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  const [motivationalText, setMotivationalText] = useState(photo.note || "Keep showing up.");
  const [isEditingText, setIsEditingText] = useState(false);
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditingText && textInputRef.current) {
        textInputRef.current.focus();
        textInputRef.current.setSelectionRange(textInputRef.current.value.length, textInputRef.current.value.length);
    }
  }, [isEditingText]);

  const handleShare = async () => {
    if (!posterRef.current) return;
    try {
      if(isEditingText) setIsEditingText(false);
      await new Promise(resolve => setTimeout(resolve, 50)); 

      const blob = await htmlToImage.toBlob(posterRef.current, { 
        quality: 0.95,
        pixelRatio: 2,
        width: 1080,
        height: 1920,
        style: {
          borderRadius: '0',
        }
      });

      if (blob && navigator.share) {
        const file = new File([blob], 'progress-poster.png', { type: 'image/png' });
        await navigator.share({
          files: [file],
          title: 'My Fitness Progress!',
          text: 'Check out my progress with ZenithFit!',
        });
      } else if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'progress-poster.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        alert('Could not generate image.');
      }
    } catch (error) {
      console.error('Error sharing poster:', error);
      alert('An error occurred while trying to share the poster.');
    }
  };

  const formattedDate = new Date(photo.createdAt).toLocaleDateString(language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 bg-[#0F1113]/80 backdrop-blur-sm z-[100] flex flex-col justify-center items-center p-4 animate-fadeIn" style={{ animationDuration: '250ms' }}>
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <Button onClick={handleShare} shape="circle" iconOnly iconName="share" variant="ghost" />
        <Button onClick={onClose} shape="circle" iconOnly iconName="close" variant="ghost" />
      </div>

      <div
        ref={posterRef}
        style={{ width: 'clamp(250px, 85vw, 320px)', aspectRatio: '9 / 16' }}
        className="bg-[#0D0F11] rounded-radius-std shadow-2xl flex flex-col items-center text-center text-dark-text-primary overflow-hidden relative"
      >
        <div className="w-full h-[60%] p-4 pb-0">
             <img src={photo.imageDataUrl} alt="Progress" className="w-full h-full object-cover rounded-[24px]" />
        </div>
        
        <div className="flex-1 w-full flex flex-col justify-center items-center px-4 pt-4">
             <p className="text-dark-text-secondary text-base font-normal">
                {formattedDate}
            </p>
            {isEditingText ? (
                 <textarea
                    ref={textInputRef}
                    value={motivationalText}
                    onChange={(e) => setMotivationalText(e.target.value)}
                    onBlur={() => setIsEditingText(false)}
                    className="w-full bg-transparent text-center text-xl font-medium text-dark-text-primary focus:outline-none p-2 resize-none mt-2"
                    rows={3}
                />
            ) : (
                <p 
                    onClick={() => setIsEditingText(true)}
                    className="w-full text-xl font-medium text-dark-text-primary p-2 cursor-pointer mt-2"
                >
                    {motivationalText}
                </p>
            )}
        </div>

        <footer className="w-full pb-[22px] mt-auto">
          <p className="text-sm font-semibold text-dark-text-secondary/60">
            @ZenithFit
          </p>
        </footer>
      </div>
    </div>
  );
};

export default ProgressPhotoPosterScreen;