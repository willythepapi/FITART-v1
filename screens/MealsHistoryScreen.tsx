import React, { useState, useEffect, useCallback } from 'react';
import { useAppUseCases } from '../application/usecase-provider';
import type { MealEntity } from '../domain/entities';
import AppCard from '../components/AppCard';
import Button from '../components/Button';
import Icon from '../components/Icon';
import EditMealModal from '../components/EditMealModal';

const getTodayDateString = () => new Date().toISOString().split('T')[0];

interface MealsHistoryScreenProps {
  onClose: () => void;
  dataVersion: number;
}

const MealCard: React.FC<{ meal: MealEntity, onEdit: (meal: MealEntity) => void }> = ({ meal, onEdit }) => {
    const time = new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <AppCard onClick={() => onEdit(meal)} className="transition-transform duration-fast active:scale-[0.98]">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-semibold text-lg text-light-text-primary dark:text-dark-text-primary">{meal.name}</h3>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{Math.round(meal.calories)} calories</p>
                </div>
                <p className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">{time}</p>
            </div>
             <div className="flex justify-start items-center pt-3 gap-5 mt-3 border-t border-dark-border">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-violet-400" />
                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">{Math.round(meal.protein)}g P</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-macro-carbs" />
                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">{Math.round(meal.carbs)}g C</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-macro-fat" />
                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">{Math.round(meal.fat)}g F</p>
                </div>
            </div>
        </AppCard>
    );
};

const MealsHistoryScreen: React.FC<MealsHistoryScreenProps> = ({ onClose, dataVersion }) => {
    const [meals, setMeals] = useState<MealEntity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingMeal, setEditingMeal] = useState<MealEntity | null>(null);
    const { getMealsByDate } = useAppUseCases();
    
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        const today = getTodayDateString();
        try {
            const mealsData = await getMealsByDate.execute(today);
            setMeals(mealsData);
        } catch (error) {
            console.error("Failed to fetch meals:", error);
        } finally {
            setIsLoading(false);
        }
    }, [getMealsByDate]);

    useEffect(() => {
        fetchData();
    }, [fetchData, dataVersion]);

    const handleEditSuccess = () => {
        setEditingMeal(null);
        fetchData(); // Refetch data to show changes
    };

    return (
        <>
            <div className="fixed inset-0 bg-dark-bg z-30 p-5 flex flex-col animate-fadeIn">
                <header className="flex justify-between items-center mb-6 flex-shrink-0">
                     <Button onClick={onClose} variant="ghost" shape="circle" iconOnly iconName="chevron-left" className="w-11 h-11" />
                    <h1 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary tracking-title">Today's Meals</h1>
                    <div className="w-11" />
                </header>
                
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                         <svg className="animate-spin h-8 w-8 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                ) : meals.length > 0 ? (
                    <div className="space-y-4 overflow-y-auto flex-1 -mr-2 pr-2">
                        {meals.map((meal, index) => (
                           <div key={meal.id} className="animate-fadeInUp" style={{ animationDelay: `${index * 60}ms`, opacity: 0 }}>
                                <MealCard meal={meal} onEdit={setEditingMeal} />
                           </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <Icon name="cake" className="w-16 h-16 text-dark-text-tertiary mb-4" />
                        <h2 className="text-xl font-bold text-dark-text-primary">No Meals Logged</h2>
                        <p className="text-sm text-dark-text-secondary max-w-xs">You haven't logged any meals yet today. Tap the '+' button on the home screen to start.</p>
                    </div>
                )}
            </div>
            {editingMeal && (
                <EditMealModal 
                    isOpen={!!editingMeal}
                    onClose={() => setEditingMeal(null)}
                    mealToEdit={editingMeal}
                    onSaveSuccess={handleEditSuccess}
                />
            )}
        </>
    );
};

export default MealsHistoryScreen;
