import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Dimensions } from 'react-native';
import { useAppUseCases } from '../application/usecase-provider';
import type { UserEntity, WeightHistoryEntity, ProgressPhotoEntity } from '../domain/entities';
import { useLanguage } from '../context/LanguageContext';
import { useUnit } from '../context/UnitContext';
import Button from '../components/Button';
import PosterScreen from './PosterScreen';
import CircularProgress from '../components/CircularProgress';
import Icon from '../components/Icon';
import ProgressPhotoPosterScreen from './ProgressPhotoPosterScreen';
import WeeklyInsightScreen from './WeeklyInsightScreen';
import SimpleLineChart from '../components/SimpleLineChart';

const Stat: React.FC<{ value: string; label: string }> = ({ value, label }) => (
    <View className="text-center">
        <p className="text-3xl font-semibold text-light-text-primary dark:text-dark-text-primary tracking-display">{value}</p>
        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary tracking-wide uppercase">{label}</p>
    </View>
);

const ProgressPhotoCard: React.FC<{ photo: ProgressPhotoEntity; onClick: () => void; }> = ({ photo, onClick }) => {
    const { language } = useLanguage();
    const formattedDate = new Date(photo.createdAt).toLocaleDateString(language, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <button onClick={onClick} className="w-full text-left bg-light-card dark:bg-dark-surface rounded-radius-std overflow-hidden animate-fadeInUp transition-transform duration-fast active:scale-[0.97]">
            <img src={photo.imageDataUrl} alt="Progress" className="w-full h-auto object-cover" />
            <View className="p-4">
                <p className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">{formattedDate}</p>
                {photo.note && <p className="text-light-text-primary dark:text-dark-text-primary mt-1">{photo.note}</p>}
            </View>
        </button>
    );
};

const ProgressScreen: React.FC = () => {
    const { getWeightHistory, getUserProfile, getProgressPhotos } = useAppUseCases();
    const { t } = useLanguage();
    const { formatWeight } = useUnit();

    const [weightHistory, setWeightHistory] = useState<WeightHistoryEntity[]>([]);
    const [user, setUser] = useState<UserEntity | null>(null);
    const [isPosterVisible, setIsPosterVisible] = useState(false);
    const [isInsightVisible, setIsInsightVisible] = useState(false);
    const [progressPhotos, setProgressPhotos] = useState<ProgressPhotoEntity[]>([]);
    const [selectedPhotoForPoster, setSelectedPhotoForPoster] = useState<ProgressPhotoEntity | null>(null);

    const fetchData = useCallback(async () => {
        const [weightData, userData, photosData] = await Promise.all([
            getWeightHistory.execute(),
            getUserProfile.execute(),
            getProgressPhotos.execute(),
        ]);
        
        const sortedWeightData = weightData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setWeightHistory(sortedWeightData);
        setUser(userData);
        setProgressPhotos(photosData);
    }, [getWeightHistory, getUserProfile, getProgressPhotos]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const {
        currentWeight,
        startWeight,
        targetWeight,
        progressPercent,
        weeklyChange,
        sparklineData,
        journeyStartDate
    } = useMemo(() => {
        if (!user || weightHistory.length === 0) {
            return {
                currentWeight: user?.weight ?? 0,
                startWeight: user?.weight ?? 0,
                targetWeight: user?.targetWeight ?? 0,
                progressPercent: 0,
                weeklyChange: 0,
                sparklineData: [],
                journeyStartDate: new Date()
            };
        }

        const current = weightHistory[weightHistory.length - 1];
        const start = weightHistory[0];

        // Calculate weekly change
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const lastWeekEntry = [...weightHistory].reverse().find(entry => new Date(entry.date) <= sevenDaysAgo);
        const change = lastWeekEntry ? current.weight - lastWeekEntry.weight : 0;
        
        // Calculate progress percentage
        const totalToLose = start.weight - user.targetWeight;
        const totalLost = start.weight - current.weight;
        const percent = totalToLose > 0 ? (totalLost / totalToLose) * 100 : 0;
        
        const sparkline = weightHistory.slice(-7).map(entry => entry.weight);

        return {
            currentWeight: current.weight,
            startWeight: start.weight,
            targetWeight: user.targetWeight,
            progressPercent: Math.min(100, Math.max(0, percent)),
            weeklyChange: change,
            sparklineData: sparkline,
            journeyStartDate: new Date(start.date)
        };
    }, [user, weightHistory]);

    const chartWidth = Dimensions.get('window').width - 44; // Full width minus padding
    
    if (!user) {
        return <View className="p-5 text-center"><p>{t('home_loading')}</p></View>;
    }

    return (
        <>
            <View className="px-[22px] pt-[22px] pb-8 space-y-8">
                <View className="animate-fadeInUp">
                    <h1 className="text-3xl font-semibold text-light-text-primary dark:text-dark-text-primary tracking-display">{t('progress_title')}</h1>
                </View>
                
                <View className="flex flex-row justify-around items-center animate-fadeInUp" style={{ animationDelay: '100ms', opacity: 0 }}>
                    <Stat value={formatWeight(currentWeight).split(' ')[0]} label="Current" />
                    <Stat value={formatWeight(targetWeight).split(' ')[0]} label="Goal" />
                     <Stat 
                        value={`${weeklyChange > 0 ? '+' : ''}${weeklyChange.toFixed(1)}`}
                        label="7-Day"
                    />
                </View>

                <View className="flex flex-col items-center gap-6 animate-fadeInUp" style={{ animationDelay: '200ms', opacity: 0 }}>
                    <CircularProgress percent={progressPercent} radius={100} strokeWidth={10} />
                    <View className="h-20 w-full opacity-75">
                         <SimpleLineChart data={sparklineData} width={chartWidth} height={80} />
                    </View>
                </View>

                <View className="pt-4 animate-fadeInUp grid grid-cols-2 gap-3" style={{ animationDelay: '300ms', opacity: 0 }}>
                    <Button onClick={() => setIsPosterVisible(true)} variant="ghost" className="w-full">
                        Create Poster
                    </Button>
                    <Button onClick={() => setIsInsightVisible(true)} className="w-full">
                        Weekly Insight
                    </Button>
                </View>

                <View className="space-y-4 animate-fadeInUp" style={{ animationDelay: '400ms', opacity: 0 }}>
                    <h2 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary tracking-title">Photo Log</h2>
                    {progressPhotos.length > 0 ? (
                        <View className="space-y-4">
                            {progressPhotos.map(photo => <ProgressPhotoCard key={photo.id} photo={photo} onClick={() => setSelectedPhotoForPoster(photo)} />)}
                        </View>
                    ) : (
                        <View className="text-center py-8 px-4 bg-light-card dark:bg-dark-surface rounded-radius-std">
                            <Icon name="camera" className="w-12 h-12 mx-auto text-light-text-tertiary dark:text-dark-text-tertiary" />
                            <p className="mt-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">No progress photos yet. Take your first photo from the Camera tab.</p>
                        </View>
                    )}
                </View>
            </View>

            {isPosterVisible && (
                <PosterScreen 
                    user={user}
                    currentWeight={currentWeight}
                    weeklyChange={weeklyChange}
                    journeyStartDate={journeyStartDate}
                    onClose={() => setIsPosterVisible(false)}
                />
            )}
            
            {selectedPhotoForPoster && (
                <ProgressPhotoPosterScreen 
                    photo={selectedPhotoForPoster}
                    onClose={() => setSelectedPhotoForPoster(null)}
                />
            )}

            {isInsightVisible && (
                <WeeklyInsightScreen onClose={() => setIsInsightVisible(false)} />
            )}
        </>
    );
};

export default ProgressScreen;