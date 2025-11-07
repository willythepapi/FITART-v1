import React, { useRef } from 'react';
import * as htmlToImage from 'html-to-image';
import type { UserEntity } from '../domain/entities';
import { useUnit } from '../context/UnitContext';
import Icon from '../components/Icon';
import Button from '../components/Button';

interface PosterScreenProps {
  user: UserEntity;
  currentWeight: number;
  weeklyChange: number;
  journeyStartDate: Date;
  onClose: () => void;
}

const PosterScreen: React.FC<PosterScreenProps> = ({ user, currentWeight, weeklyChange, journeyStartDate, onClose }) => {
  const posterRef = useRef<HTMLDivElement>(null);
  const { formatWeight } = useUnit();

  const handleShare = async () => {
    if (!posterRef.current) return;
    try {
      const blob = await htmlToImage.toBlob(posterRef.current, { 
        quality: 0.95,
        pixelRatio: 2, // Capture at 2x resolution for better quality
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
        link.click();
        URL.revokeObjectURL(url);
      } else {
        alert('Could not generate image.');
      }
    } catch (error) {
      console.error('Error sharing poster:', error);
      alert('An error occurred while trying to share the poster.');
    }
  };

  const today = new Date();
  const diffTime = Math.abs(today.getTime() - journeyStartDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const currentWeek = Math.ceil(diffDays / 7);

  const formattedWeight = formatWeight(currentWeight);

  return (
    <div className="fixed inset-0 bg-[#0F1113]/80 backdrop-blur-sm z-[100] flex flex-col justify-center items-center p-4 animate-posterFadeInUp">
      <div className="absolute top-4 right-4 flex gap-2">
        <Button onClick={handleShare} shape="circle" iconOnly iconName="share" variant="ghost" />
        <Button onClick={onClose} shape="circle" iconOnly iconName="close" variant="ghost" />
      </div>

      <div
        ref={posterRef}
        className="w-full max-w-[300px] aspect-[9/16] bg-[#0D0F11] rounded-radius-std shadow-2xl flex flex-col items-center justify-between p-8 text-center text-dark-text-primary overflow-hidden"
      >
        <header className="w-full">
          <h1 className="text-lg font-semibold tracking-[0.2em] uppercase">
            {user.name}
          </h1>
          <p className="text-xs text-dark-text-secondary font-medium tracking-widest mt-1">
            WEEK {currentWeek} / DAY {diffDays}
          </p>
        </header>

        <main className="flex flex-col items-center gap-2">
            <p className="text-6xl font-bold tracking-tighter">
              {formattedWeight.split(' ')[0]}
              <span className="text-xl font-medium ml-1">{formattedWeight.split(' ')[1]}</span>
            </p>
            <p className="text-dark-text-secondary font-medium">
              {weeklyChange > 0 ? '+' : ''}{weeklyChange.toFixed(1)} kg this week
            </p>
        </main>

        <section>
          <p className="text-lg font-medium italic">"Keep showing up."</p>
        </section>

        <footer className="w-full">
          <p className="text-sm font-semibold text-dark-text-secondary/60">
            ZenithFit
          </p>
        </footer>
      </div>

      <p className="text-xs text-dark-text-secondary/70 mt-4 text-center max-w-xs">
          Your progress poster is ready. Tap the share icon to save or send it.
      </p>
    </div>
  );
};

export default PosterScreen;