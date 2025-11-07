import React, { useRef } from 'react';
import { View, Text, Share, Platform } from 'react-native';
import ViewShot from 'react-native-view-shot';
import type { UserEntity } from '../domain/entities';
import { useUnit } from '../context/UnitContext';
import Button from '../components/Button';

interface PosterScreenProps {
  user: UserEntity;
  currentWeight: number;
  weeklyChange: number;
  journeyStartDate: Date;
  onClose: () => void;
}

const PosterScreen: React.FC<PosterScreenProps> = ({ user, currentWeight, weeklyChange, journeyStartDate, onClose }) => {
  const viewShotRef = useRef<ViewShot>(null);
  const { formatWeight } = useUnit();

  const handleShare = async () => {
    if (!viewShotRef.current?.capture) return;
    try {
      const uri = await viewShotRef.current.capture();
      await Share.share({
        title: 'My Fitness Progress!',
        url: uri, // For iOS, url is used. For Android, it's part of the message.
        message: `Check out my progress with ZenithFit!`,
      });
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
    <View className="fixed inset-0 bg-[#0F1113]/80 backdrop-blur-sm z-[100] flex flex-col justify-center items-center p-4 animate-posterFadeInUp">
      <View className="absolute top-4 right-4 flex-row gap-2">
        <Button onClick={handleShare} shape="circle" iconOnly iconName="share" variant="ghost" />
        <Button onClick={onClose} shape="circle" iconOnly iconName="close" variant="ghost" />
      </View>

      <ViewShot
        ref={viewShotRef}
        options={{ format: 'png', quality: 0.95 }}
        className="w-full max-w-[300px] aspect-[9/16] bg-[#0D0F11] rounded-radius-std shadow-2xl flex flex-col items-center justify-between p-8 text-center text-dark-text-primary overflow-hidden"
      >
        <View className="w-full">
          <Text className="text-lg font-semibold tracking-[0.2em] uppercase text-dark-text-primary">
            {user.name}
          </Text>
          <Text className="text-xs text-dark-text-secondary font-medium tracking-widest mt-1">
            WEEK {currentWeek} / DAY {diffDays}
          </Text>
        </View>

        <View className="flex flex-col items-center gap-2">
            <Text className="text-6xl font-bold tracking-tighter text-dark-text-primary">
              {formattedWeight.split(' ')[0]}
              <Text className="text-xl font-medium ml-1">{formattedWeight.split(' ')[1]}</Text>
            </Text>
            <Text className="text-dark-text-secondary font-medium">
              {weeklyChange > 0 ? '+' : ''}{weeklyChange.toFixed(1)} kg this week
            </Text>
        </View>

        <View>
          <Text className="text-lg font-medium italic text-dark-text-primary">"Keep showing up."</Text>
        </View>

        <View className="w-full">
          <Text className="text-sm font-semibold text-dark-text-secondary/60">
            ZenithFit
          </Text>
        </View>
      </ViewShot>

      <Text className="text-xs text-dark-text-secondary/70 mt-4 text-center max-w-xs">
          Your progress poster is ready. Tap the share icon to save or send it.
      </Text>
    </View>
  );
};

export default PosterScreen;
