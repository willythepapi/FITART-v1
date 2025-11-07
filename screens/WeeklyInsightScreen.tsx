import React, { useState, useEffect, useCallback } from 'react';
// Fix: Import Image component from react-native.
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { styled } from 'nativewind';
import { useAppUseCases } from '../application/usecase-provider';
import { useUnit } from '../context/UnitContext';
import type { ProgressPhotoEntity } from '../domain/entities';
import Button from '../components/Button';
import Icon from '../components/Icon';
import ProgressPhotoPosterScreen from './ProgressPhotoPosterScreen';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);
// Fix: Create a styled version of the Image component for nativewind class names.
const StyledImage = styled(Image);

// --- UI Components for this screen ---

const StatCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <StyledView className="flex-1 bg-dark-surface rounded-radius-std p-4 items-center justify-center">
        <StyledText className="text-2xl font-bold text-dark-text-primary tracking-tighter">{value}</StyledText>
        <StyledText className="text-xs text-dark-text-secondary uppercase tracking-wider mt-1 text-center">{title}</StyledText>
    </StyledView>
);

const HeatmapBlock: React.FC<{ status: 'full' | 'partial' | 'none', day: string }> = ({ status, day }) => {
    const statusClasses = {
        full: 'bg-accent',
        partial: 'bg-macro-carbs',
        none: 'bg-dark-surface'
    };
    return (
        <StyledView className="flex flex-col items-center gap-2">
            <StyledView className={`w-7 h-7 rounded-lg ${statusClasses[status]}`} />
            <StyledText className="text-xs font-medium text-dark-text-secondary">{day}</StyledText>
        </StyledView>
    );
};


// --- Main Screen Component ---

interface WeeklyInsightScreenProps {
    onClose: () => void;
}

const getStartOfWeek = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(date.setDate(diff));
};

const WeeklyInsightScreen: React.FC<WeeklyInsightScreenProps> = ({ onClose }) => {
    const { unitSystem, convertWeightFromMetric, getWeightLabel } = useUnit();
    const { getProgressHistory, getMealsByDate, getWeightHistory, getProgressPhotos } = useAppUseCases();

    const [isLoading, setIsLoading] = useState(true);
    const [insightData, setInsightData] = useState<any>(null);
    const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhotoEntity | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);

        const today = new Date();
        const startOfWeek = getStartOfWeek(today);
        startOfWeek.setHours(0, 0, 0, 0);

        const startDate = startOfWeek.toISOString().split('T')[0];
        const endDate = today.toISOString().split('T')[0];
        
        const [progress, meals, weights, photos] = await Promise.all([
            getProgressHistory.execute(startDate, endDate),
            getMealsByDate.execute(),
            getWeightHistory.execute(),
            getProgressPhotos.execute(),
        ]);
        
        // --- Process Data ---
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        
        // Filter for the date range
        const mealsThisWeek = meals.filter(m => m.timestamp >= startDateObj.getTime() && m.timestamp <= endDateObj.getTime());
        const photosThisWeek = photos.filter(p => p.createdAt >= startDateObj.getTime() && p.createdAt <= endDateObj.getTime());
        const weightsThisWeek = weights.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).filter(w => {
            const d = new Date(w.date);
            d.setHours(0,0,0,0);
            return d >= startDateObj && d <= endDateObj;
        });
        
        // Calculate stats
        const relevantProgress = progress.filter(p => new Date(p.date) <= today);
        const avgCalories = relevantProgress.length > 0 ? relevantProgress.reduce((sum, p) => sum + p.caloriesEaten, 0) / relevantProgress.length : 0;
        const workoutsCompleted = relevantProgress.reduce((sum, p) => sum + p.workoutsCompleted.length, 0);
        
        let weightChange: number | null = null;
        if (weightsThisWeek.length >= 2) {
            weightChange = weightsThisWeek[weightsThisWeek.length - 1].weight - weightsThisWeek[0].weight;
        }

        // Prepare heatmap data
        const heatmapData: { day: string, status: 'full' | 'partial' | 'none' }[] = [];
        const dayInitials = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
        
        for (let i = 0; i < 7; i++) {
            const d = new Date(startOfWeek);
            d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];

            const progressToday = progress.find(p => p.date === dateStr);
            const mealsToday = mealsThisWeek.filter(m => new Date(m.timestamp).toISOString().split('T')[0] === dateStr);
            
            const hasWorkout = (progressToday?.workoutsCompleted.length ?? 0) > 0;
            const hasMeal = mealsToday.length > 0;
            
            let status: 'full' | 'partial' | 'none' = 'none';
            if (d > today) {
                status = 'none';
            } else if (hasWorkout && hasMeal) {
                status = 'full';
            } else if (hasWorkout || hasMeal) {
                status = 'partial';
            }

            heatmapData.push({ day: dayInitials[i], status });
        }
        
        const weekNumber = Math.ceil(today.getDate() / 7);

        setInsightData({
            weekNumber,
            avgCalories: Math.round(avgCalories),
            workoutsCompleted,
            weightChange,
            mostRecentPhoto: photosThisWeek[0] || null,
            heatmapData
        });
        
        setIsLoading(false);
    }, [getProgressHistory, getMealsByDate, getWeightHistory, getProgressPhotos]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (isLoading || !insightData) {
        return (
            <StyledView className="fixed inset-0 bg-dark-bg z-50 flex items-center justify-center">
                <ActivityIndicator size="large" color="#7FB7FF" />
            </StyledView>
        );
    }
    
    const wc = insightData.weightChange;
    const displayWc = wc !== null ? (unitSystem === 'imperial' ? convertWeightFromMetric(wc) : wc) : null;
    const formattedWeightChange = displayWc !== null ? `${wc > 0 ? '+' : ''}${displayWc.toFixed(1)} ${getWeightLabel()}` : 'N/A';
    
    const startOfWeekDate = getStartOfWeek(new Date());
    const todayTimestamp = new Date().getTime();
    const daysElapsedThisWeek = insightData.heatmapData.filter((d: any, i: number) => {
        const dayDate = new Date(startOfWeekDate);
        dayDate.setDate(startOfWeekDate.getDate() + i);
        return dayDate.getTime() <= todayTimestamp;
    }).length;

    return (
        <>
            <StyledView className="fixed inset-0 bg-dark-bg z-50 animate-fadeIn">
                 <StyledScrollView contentContainerStyle={{ padding: 20 }}>
                     <StyledView className="flex-row justify-between items-center mb-6">
                        <StyledView>
                            <StyledText className="text-3xl font-semibold text-dark-text-primary tracking-display">Weekly Insight</StyledText>
                            <StyledText className="text-dark-text-secondary">Week {insightData.weekNumber}</StyledText>
                        </StyledView>
                        {/* Fix: Changed onPress to onClick to match the Button component's expected props. */}
                        <Button onClick={onClose} shape="circle" iconOnly iconName="close" variant="ghost" />
                    </StyledView>
                    
                    <StyledView className="space-y-6">
                        {/* Stats Row */}
                        <StyledView className="flex-row gap-3">
                            <StatCard title="Avg. Calories" value={String(insightData.avgCalories)} />
                            <StatCard title="Workouts" value={`${insightData.workoutsCompleted}/${daysElapsedThisWeek}`} />
                            <StatCard title="Weight Change" value={formattedWeightChange} />
                        </StyledView>

                        {/* Photo */}
                        {insightData.mostRecentPhoto ? (
                            <StyledTouchableOpacity onPress={() => setSelectedPhoto(insightData.mostRecentPhoto)}>
                                {/* Fix: Use the styled StyledImage component. */}
                                <StyledImage source={{uri: insightData.mostRecentPhoto.imageDataUrl}} className="w-full aspect-[4/3] rounded-radius-std" />
                                <StyledView className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                                    <StyledText className="text-white text-xs font-semibold">
                                        {new Date(insightData.mostRecentPhoto.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </StyledText>
                                </StyledView>
                            </StyledTouchableOpacity>
                        ) : (
                             <StyledView className="w-full aspect-[4/3] bg-dark-surface rounded-radius-std flex flex-col items-center justify-center text-center p-4">
                                <Icon name="camera" size={48} color="#657786" />
                                <StyledText className="text-sm font-medium text-dark-text-secondary mt-2">No photo from this week</StyledText>
                                <StyledText className="text-xs text-dark-text-tertiary">Take one using the Camera tab!</StyledText>
                            </StyledView>
                        )}
                        
                        {/* Heatmap */}
                        <StyledView>
                            <StyledText className="text-lg font-semibold text-dark-text-primary mb-3">Activity Log</StyledText>
                            <StyledView className="flex-row justify-between">
                                {insightData.heatmapData.map((data: any, index: number) => (
                                    <HeatmapBlock key={index} {...data} />
                                ))}
                            </StyledView>
                        </StyledView>
                    </StyledView>
                 </StyledScrollView>
            </StyledView>

            {selectedPhoto && (
                <ProgressPhotoPosterScreen 
                    photo={selectedPhoto}
                    onClose={() => setSelectedPhoto(null)}
                />
            )}
        </>
    );
}

export default WeeklyInsightScreen;