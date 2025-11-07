import React, { useState, useEffect, useMemo } from 'react';
import Modal from './Modal';
import AppTextField from './AppTextField';
import Button from './Button';
import Icon from './Icon';
import { useAppUseCases } from '../application/usecase-provider';
import type { FoodItemEntity, MealEntity } from '../domain/entities';
import { searchFoods, FOOD_DATABASE } from '../data/foods_db';
import AppCard from './AppCard';

const getTodayDateString = () => new Date().toISOString().split('T')[0];

interface EditMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
  mealToEdit: MealEntity;
}

const ConfirmationModal: React.FC<{ isOpen: boolean; onConfirm: () => void; onCancel: () => void; }> = ({ isOpen, onConfirm, onCancel }) => (
    <Modal isOpen={isOpen} onClose={onCancel} title="Delete Meal?">
        <p className="text-center text-dark-text-secondary mb-6">Are you sure you want to permanently delete this meal entry?</p>
        <div className="flex flex-col gap-3">
            <Button onClick={onConfirm} variant="danger" className="w-full">Confirm Delete</Button>
            <Button onClick={onCancel} variant="ghost" className="w-full">Cancel</Button>
        </div>
    </Modal>
);

const EditMealModal: React.FC<EditMealModalProps> = ({ isOpen, onClose, onSaveSuccess, mealToEdit }) => {
  const { updateMealEntry, deleteMealEntry } = useAppUseCases();

  const [step, setStep] = useState<'details' | 'search'>('details');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItemEntity[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItemEntity | null>(null);
  const [grams, setGrams] = useState(100);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    if (isOpen && mealToEdit) {
        const food = FOOD_DATABASE.find(f => f.id === mealToEdit.foodId) || null;
        setSelectedFood(food);
        setGrams(mealToEdit.grams);
        setStep('details');
    } else {
         setTimeout(() => {
            setQuery('');
            setSearchResults([]);
         }, 200);
    }
  }, [isOpen, mealToEdit]);

  useEffect(() => {
    if (step !== 'search') return;
    const handler = setTimeout(() => setSearchResults(searchFoods(query)), 200);
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
        const updatedMealData: MealEntity = {
            ...mealToEdit,
            name: `${selectedFood.name} (${grams}g)`,
            foodId: selectedFood.id,
            grams: grams,
            ...calculatedMacros
        };
        await updateMealEntry.execute(getTodayDateString(), mealToEdit, updatedMealData);
        onSaveSuccess();
    } catch (error) {
        console.error("Failed to update meal:", error);
    } finally {
        setIsSaving(false);
    }
  };

  const handleDelete = async () => {
      setIsDeleting(true);
      try {
          await deleteMealEntry.execute(getTodayDateString(), mealToEdit.id);
          onSaveSuccess();
      } catch (error) {
          console.error("Failed to delete meal:", error);
      } finally {
          setIsDeleting(false);
          setConfirmDeleteOpen(false);
      }
  };

  const renderSearchStep = () => (
    <div className="flex flex-col h-[60vh]">
        <AppTextField placeholder="Search foods..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <ul className="mt-4 space-y-2 flex-1 overflow-y-auto -mr-2 pr-2">
            {searchResults.map((food, index) => (
                <li key={food.id} className="animate-fadeInUp" style={{ animationDelay: `${index * 30}ms`, opacity: 0 }}>
                    <button onClick={() => handleSelectFood(food)} className="w-full text-left p-3 rounded-radius-sm bg-dark-surface hover:bg-dark-border transition-colors">
                        <p>{food.name}</p>
                        <p className="text-xs text-dark-text-secondary">{`P:${food.protein} C:${food.carbs} F:${food.fat} / ${Math.round(food.calories_per_100g)} kcal per 100g`}</p>
                    </button>
                </li>
            ))}
        </ul>
    </div>
  );
  
  const MacroDisplay: React.FC<{label: string, value: number, unit: string, color: string}> = ({ label, value, unit, color }) => (
    <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full mb-1.5`} style={{backgroundColor: color}}></div>
        <p className="text-lg font-bold">{Math.round(value)}{unit}</p>
        <p className="text-xs text-dark-text-secondary">{label}</p>
    </div>
  );

  const renderDetailsStep = () => {
    if (!selectedFood || !calculatedMacros) return null;
    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-center">{selectedFood.name}</h3>
            
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

            <button onClick={() => setStep('search')} className="w-full text-sm font-semibold text-accent hover:text-accent-dark text-center py-2">
                Change Food
            </button>
        </div>
    )
  };

  const footer = step === 'details' ? (
    <div className="flex gap-3">
        <Button onClick={() => setConfirmDeleteOpen(true)} variant="ghost" shape="circle" iconOnly iconName="trash" className="text-danger hover:bg-danger/10 flex-shrink-0" />
        <Button onClick={handleSave} disabled={isSaving || grams <= 0} className="w-full">
            {isSaving ? "Saving..." : "Save Changes"}
        </Button>
    </div>
  ) : null;
  
  return (
    <>
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          title={step === 'search' ? 'Change Food' : 'Edit Meal'}
          footer={footer}
        >
            {step === 'search' ? renderSearchStep() : renderDetailsStep()}
        </Modal>
        <ConfirmationModal 
            isOpen={isConfirmDeleteOpen}
            onConfirm={handleDelete}
            onCancel={() => setConfirmDeleteOpen(false)}
        />
    </>
  );
};

export default EditMealModal;
