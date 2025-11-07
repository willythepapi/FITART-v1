import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Modal from './Modal';
import AppTextField from './AppTextField';
import Button from './Button';
import Icon from './Icon';
import { useAppUseCases } from '../application/usecase-provider';
import type { FoodItemEntity, MealEntity } from '../domain/entities';
import { searchFoods } from '../data/foods_db';
import { useLanguage } from '../context/LanguageContext';
import AppCard from './AppCard';

const getTodayDateString = () => new Date().toISOString().split('T')[0];

interface MealLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
}

const MealLoggerModal: React.FC<MealLoggerModalProps> = ({ isOpen, onClose, onSaveSuccess }) => {
  const { t } = useLanguage();
  const { addMealEntry } = useAppUseCases();

  const [step, setStep] = useState<'search' | 'details'>('search');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItemEntity[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItemEntity | null>(null);
  const [grams, setGrams] = useState(100);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal is closed
      setTimeout(() => {
        setStep('search');
        setQuery('');
        setSearchResults([]);
        setSelectedFood(null);
        setGrams(100);
        setIsSaving(false);
      }, 200); // Delay to allow closing animation
    }
  }, [isOpen]);

  useEffect(() => {
    if (step !== 'search') return;
    const handler = setTimeout(() => {
      setSearchResults(searchFoods(query));
    }, 200); // Debounce search
    return () => clearTimeout(handler);
  }, [query, step]);
  
  const handleSelectFood = (food: FoodItemEntity) => {
    setSelectedFood(food);
    setStep('details');
  };

  const calculatedMacros = useMemo(() => {
    if (!selectedFood) return null;
    const multiplier = grams / 100;
    return {
      calories: selectedFood.calories_per_100g * multiplier,
      protein: selectedFood.protein * multiplier,
      carbs: selectedFood.carbs * multiplier,
      fat: selectedFood.fat * multiplier,
    };
  }, [selectedFood, grams]);

  const handleSave = async () => {
    if (!selectedFood || !calculatedMacros) return;
    setIsSaving(true);
    try {
        const mealData: Omit<MealEntity, 'id' | 'timestamp'> = {
            name: `${selectedFood.name} (${grams}g)`,
            foodId: selectedFood.id,
            grams: grams,
            ...calculatedMacros
        };
        await addMealEntry.execute(getTodayDateString(), mealData);
        onSaveSuccess();
        onClose();
    } catch (error) {
        console.error("Failed to save meal:", error);
        alert(t('meals_error_alert'));
    } finally {
        setIsSaving(false);
    }
  };

  const renderSearchStep = () => (
    <div className="flex flex-col h-[60vh]">
        <AppTextField 
            placeholder="Search foods..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
        />
        <ul className="mt-4 space-y-2 flex-1 overflow-y-auto -mr-2 pr-2">
            {searchResults.map((food, index) => (
                <li key={food.id} className="animate-fadeInUp" style={{ animationDelay: `${index * 30}ms`, opacity: 0 }}>
                    <button onClick={() => handleSelectFood(food)} className="w-full text-left p-3 rounded-radius-sm bg-light-surface dark:bg-dark-surface hover:bg-light-border dark:hover:bg-dark-border transition-colors duration-fast">
                        <p className="font-semibold text-light-text-primary dark:text-dark-text-primary">{food.name}</p>
                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">{`P:${food.protein} C:${food.carbs} F:${food.fat} / ${Math.round(food.calories_per_100g)} kcal per 100g`}</p>
                    </button>
                </li>
            ))}
        </ul>
    </div>
  );
  
  const MacroDisplay: React.FC<{label: string, value: number, unit: string, color: string}> = ({ label, value, unit, color }) => (
    <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full mb-1.5`} style={{backgroundColor: color}}></div>
        <p className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">{Math.round(value)}{unit}</p>
        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">{label}</p>
    </div>
  );

  const renderDetailsStep = () => {
    if (!selectedFood || !calculatedMacros) return null;
    return (
        <div className="space-y-6">
            <button onClick={() => setStep('search')} className="flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-dark">
                <Icon name="chevron-left" className="w-4 h-4" />
                <span>Back to search</span>
            </button>

            <h3 className="text-2xl font-bold text-center text-light-text-primary dark:text-dark-text-primary">{selectedFood.name}</h3>
            
            <div className="flex items-center justify-center gap-3">
                 <Button onClick={() => setGrams(g => Math.max(0, g - 10))} shape="circle" iconOnly iconName="minus" variant="ghost" className="w-11 h-11"/>
                 <AppTextField 
                    label="Serving Size (grams)"
                    type="number"
                    value={grams}
                    onChange={(e) => setGrams(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="text-center text-xl font-semibold w-32"
                />
                <Button onClick={() => setGrams(g => g + 10)} shape="circle" iconOnly iconName="plus" variant="ghost" className="w-11 h-11"/>
            </div>
            
            <AppCard>
                <div className="flex justify-around items-center">
                    <MacroDisplay label="Calories" value={calculatedMacros.calories} unit="" color="#7FB7FF" />
                    <MacroDisplay label="Protein" value={calculatedMacros.protein} unit="g" color="#A78BFA" />
                    <MacroDisplay label="Carbs" value={calculatedMacros.carbs} unit="g" color="#FBBF24" />
                    <MacroDisplay label="Fat" value={calculatedMacros.fat} unit="g" color="#F87171" />
                </div>
            </AppCard>
        </div>
    )
  };

  const footer = step === 'details' ? (
    <Button onClick={handleSave} disabled={isSaving || grams <= 0} className="w-full">
        {isSaving ? t('meals_form_submitting') : "Save Meal"}
    </Button>
  ) : null;
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 'search' ? t('meals_title') : 'Log Entry'}
      footer={footer}
    >
        {step === 'search' ? renderSearchStep() : renderDetailsStep()}
    </Modal>
  );
};

export default MealLoggerModal;
