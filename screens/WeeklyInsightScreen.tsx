import React, { useState, useEffect, useCallback } from 'react';
import { useAppUseCases } from '../application/usecase-provider';
import { useUnit } from '../context/UnitContext';
import type { ProgressPhotoEntity } from '../domain/entities';
import Button from '../components/Button';
import Icon from '../components/Icon';
import ProgressPhotoPosterScreen from './ProgressPhotoPosterScreen';

// --- UI Components for this screen ---

const StatCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <div className="flex-1 bg-dark-surface rounded-radius-std p-4 text-center">
        <p className="text-2xl font-bold text-dark-text-primary tracking-tighter">{value}</p>
        <p className="text-xs text-dark-text-secondary uppercase tracking-wider mt-1">{title}</p>
    </div>
);

const HeatmapBlock: React.FC<{ status: 'full' | 'partial' | 'none', day: string }> = ({ status, day }) => {
    const statusClasses = {
        full: 'bg-accent',
        partial: 'bg-macro-carbs',
        none: 'bg-dark-surface'
    };
    return (
        <div className="flex flex-col items-center gap-2">
            <div className={`w-7 h-7 rounded-lg ${statusClasses[status]}`} />
            <p className="text-xs font-medium text-dark-text-secondary">{day}</p>
        </div>
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
    // Fix: Use correct use case names 'getMealsByDate' and 'getProgressPhotos'.
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
        
        // Fix: Call correct use cases. getMealsByDate() without arguments now fetches all meals.
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
        const workoutsCompleted = relevantProgress.filter(p => p.workoutsCompleted.length > 0).length;
        
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
            <div className="fixed inset-0 bg-dark-bg z-50 flex items-center justify-center">
                <svg className="animate-spin h-8 w-8 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        );
    }
    
    const wc = insightData.weightChange;
    const displayWc = wc !== null ? (unitSystem === 'imperial' ? convertWeightFromMetric(wc) : wc) : null;
    const formattedWeightChange = displayWc !== null ? `${wc > 0 ? '+' : ''}${displayWc.toFixed(1)} ${getWeightLabel()}` : 'N/A';
    

    return (
        <>
            <div className="fixed inset-0 bg-dark-bg z-50 overflow-y-auto p-5 animate-fadeIn">
                 <header className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-semibold text-dark-text-primary tracking-display">Weekly Insight</h1>
                        <p className="text-dark-text-secondary">Week {insightData.weekNumber}</p>
                    </div>
                    <Button onClick={onClose} shape="circle" iconOnly iconName="close" variant="ghost" />
                </header>
                
                <div className="space-y-6">
                    {/* Stats Row */}
                    <div className="flex gap-3">
                        <StatCard title="Avg. Calories" value={String(insightData.avgCalories)} />
                        {/* Fix: Operator '<=' cannot be applied to types 'number' and 'Date'. Compare with timestamp instead. */}
                        <StatCard title="Workouts" value={`${insightData.workoutsCompleted}/${insightData.heatmapData.filter((d: any, i: number) => new Date(getStartOfWeek(new Date())).setDate(getStartOfWeek(new Date()).getDate() + i) <= new Date().getTime()).length}`} />
                        <StatCard title="Weight Change" value={formattedWeightChange} />
                    </div>

                    {/* Photo */}
                    {insightData.mostRecentPhoto ? (
                        <div className="relative cursor-pointer" onClick={() => setSelectedPhoto(insightData.mostRecentPhoto)}>
                            <img src={insightData.mostRecentPhoto.imageDataUrl} alt="Most recent progress" className="w-full rounded-radius-std" />
                            <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-full">
                                {new Date(insightData.mostRecentPhoto.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </div>
                        </div>
                    ) : (
                         <div className="w-full aspect-[3/4] bg-dark-surface rounded-radius-std flex flex-col items-center justify-center text-center p-4">
                            <Icon name="camera" className="w-12 h-12 text-dark-text-tertiary mb-2" />
                            <p className="text-sm font-medium text-dark-text-secondary">No photo from this week</p>
                            <p className="text-xs text-dark-text-tertiary">Take one using the Camera tab!</p>
                        </div>
                    )}
                    
                    {/* Heatmap */}
                    <div>
                        <h3 className="text-lg font-semibold text-dark-text-primary mb-3">Activity Log</h3>
                        <div className="flex justify-between">
                            {insightData.heatmapData.map((data: any, index: number) => (
                                <HeatmapBlock key={index} {...data} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

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