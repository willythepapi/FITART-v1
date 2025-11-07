import React, { useState, useEffect, useRef } from 'react';
import type { WorkoutEntity, ExerciseEntity } from '../domain/entities';
import Icon from './Icon';
import Button from './Button';
import Modal from './Modal';
import AppTextField from './AppTextField';
import { useAppUseCases } from '../application/usecase-provider';

// A draggable list item for exercises
const DraggableExerciseItem: React.FC<{
  exercise: ExerciseEntity;
  onDragStart: (e: React.DragEvent<HTMLLIElement>, index: number) => void;
  onDragEnter: (e: React.DragEvent<HTMLLIElement>, index: number) => void;
  onDragEnd: (e: React.DragEvent<HTMLLIElement>) => void;
  index: number;
  isDragging: boolean;
}> = ({ exercise, onDragStart, onDragEnter, onDragEnd, index, isDragging }) => {
  return (
    <li
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragEnter={(e) => onDragEnter(e, index)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      className={`bg-dark-surface rounded-radius-std p-4 flex items-center gap-4 transition-all duration-fast shadow-md ${isDragging ? 'opacity-50 scale-[1.02] shadow-lg' : 'opacity-100'}`}
    >
      <div className="text-dark-text-tertiary cursor-grab" aria-label="Drag to reorder">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </div>
      <div className="flex-shrink-0 w-12 h-12 bg-dark-card rounded-lg flex items-center justify-center">
        <Icon name="dumbbell" className="w-6 h-6 text-accent" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-dark-text-primary">{exercise.name}</p>
      </div>
      <div className="bg-dark-border text-dark-text-primary text-xs font-bold px-3 py-1.5 rounded-full">
        {exercise.sets} &times; {exercise.reps}
      </div>
    </li>
  );
};


const WorkoutDetailModal: React.FC<{ workout: WorkoutEntity | null; onClose: () => void }> = ({ workout, onClose }) => {
    const [isRendered, setIsRendered] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [exercises, setExercises] = useState<ExerciseEntity[]>([]);
    const sheetRef = useRef<HTMLDivElement>(null);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const { updateWorkout } = useAppUseCases();

    const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);
    const [newExercise, setNewExercise] = useState({ name: '', sets: 3, reps: '10' });

    // Animation control
    useEffect(() => {
        if (workout) {
            setIsRendered(true);
            setExercises(workout.exercises);
            setTimeout(() => setIsOpen(true), 10); // Start animation after render
        } else {
            setIsOpen(false);
            setTimeout(() => setIsRendered(false), 300); // Unmount after animation
        }
    }, [workout]);

    // Drag to dismiss
    useEffect(() => {
        const sheet = sheetRef.current;
        if (!sheet || !isOpen) return;

        let startY = 0;
        let currentY = 0;
        let isDragging = false;
        
        const scrollContainer = sheet.querySelector('.overflow-y-auto');

        const onPointerDown = (e: PointerEvent) => {
            const target = e.target as HTMLElement;
            const canDrag = target.closest('.drag-handle') || (scrollContainer && scrollContainer.scrollTop === 0 && !target.closest('button, input, select, textarea'));

            if (canDrag) {
                isDragging = true;
                startY = e.clientY;
                sheet.style.transition = 'none';
                document.body.style.userSelect = 'none';
            }
        };

        const onPointerMove = (e: PointerEvent) => {
            if (!isDragging) return;
            currentY = e.clientY;
            const diff = currentY - startY;
            if (diff > 0) { // Only allow dragging down
                sheet.style.transform = `translateY(${diff}px)`;
            }
        };

        const onPointerUp = () => {
            if (!isDragging) return;
            isDragging = false;
            sheet.style.transition = 'transform 300ms cubic-bezier(0.2, 0.8, 0.4, 1)';
            document.body.style.userSelect = '';
            
            const diff = currentY - startY;

            if (diff > 100) { // Dismiss threshold
                onClose();
            } else {
                sheet.style.transform = 'translateY(0px)';
            }
            startY = 0;
            currentY = 0;
        };

        sheet.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);

        return () => {
            sheet.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
            document.body.style.userSelect = '';
        };
    }, [isOpen, onClose]);
    
    const handleDragStart = (e: React.DragEvent<HTMLLIElement>, position: number) => {
      dragItem.current = position;
      setDraggingIndex(position);
    };

    const handleDragEnter = (e: React.DragEvent<HTMLLIElement>, position: number) => {
      dragOverItem.current = position;
    };
    
    const handleDragEnd = async () => {
      if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
        const newExercises = [...exercises];
        const dragItemContent = newExercises[dragItem.current];
        newExercises.splice(dragItem.current, 1);
        newExercises.splice(dragOverItem.current, 0, dragItemContent);
        setExercises(newExercises);

        if (workout) {
            try {
                await updateWorkout.execute({ ...workout, exercises: newExercises });
            } catch (e) {
                console.error("Failed to persist reorder", e);
                setExercises(workout.exercises); // revert on failure
            }
        }
      }
      dragItem.current = null;
      dragOverItem.current = null;
      setDraggingIndex(null);
    };

    const handleAddExerciseClick = () => {
        setNewExercise({ name: '', sets: 3, reps: '10' });
        setIsAddExerciseModalOpen(true);
    };

    const handleSaveNewExercise = async () => {
        if (!newExercise.name.trim() || !workout) return;
        
        const newEx: ExerciseEntity = {
            id: `ex-${Date.now()}`,
            workoutId: workout.id,
            name: newExercise.name,
            sets: Number(newExercise.sets),
            reps: String(newExercise.reps),
        };
        const updatedExercises = [...exercises, newEx];

        try {
            await updateWorkout.execute({ ...workout, exercises: updatedExercises });
            setExercises(updatedExercises);
            setIsAddExerciseModalOpen(false);
        } catch (e) {
            console.error("Failed to save new exercise", e);
            alert("Failed to add exercise. Please try again.");
        }
    };

    if (!isRendered) return null;
    
    const totalExercises = exercises.length;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end animate-fadeIn" onClick={onClose}>
            <div
                ref={sheetRef}
                onClick={e => e.stopPropagation()}
                className="w-full h-[90vh] bg-dark-card rounded-t-radius-modal flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.4,1)]"
                style={{ transform: isOpen ? 'translateY(0%)' : 'translateY(100%)' }}
            >
                {/* Header and Drag Handle */}
                <div className="drag-handle cursor-grab py-4 flex-shrink-0">
                    <div className="w-10 h-1.5 bg-dark-border rounded-full mx-auto" />
                </div>

                <header className="px-5 pb-4 flex-shrink-0">
                    <h1 className="text-3xl font-bold text-dark-text-primary tracking-tight">{workout?.name}</h1>
                    <p className="text-base text-dark-text-secondary mt-1">{totalExercises} exercises</p>
                </header>

                {/* Exercise List */}
                <ul className="flex-1 overflow-y-auto px-5 space-y-4 pb-[calc(108px+env(safe-area-inset-bottom))]">
                    {exercises.map((ex, index) => (
                        <DraggableExerciseItem
                          key={`${ex.id}-${index}`}
                          exercise={ex}
                          index={index}
                          onDragStart={handleDragStart}
                          onDragEnter={handleDragEnter}
                          onDragEnd={handleDragEnd}
                          isDragging={draggingIndex === index}
                        />
                    ))}
                    <li className="flex justify-end pt-2">
                        <Button
                            shape="circle"
                            iconOnly
                            iconName="plus"
                            variant="ghost"
                            className="w-12 h-12"
                            aria-label="Add new exercise"
                            onClick={handleAddExerciseClick}
                        />
                    </li>
                </ul>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
                    <div className="bg-dark-card pt-8">
                        <Button className="w-full h-14 text-base font-semibold">Start Workout</Button>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isAddExerciseModalOpen}
                onClose={() => setIsAddExerciseModalOpen(false)}
                title="Add Exercise"
                footer={<Button onClick={handleSaveNewExercise} className="w-full">Add Exercise</Button>}
            >
                <div className="space-y-4">
                    <AppTextField 
                        label="Exercise Name" 
                        value={newExercise.name} 
                        onChange={e => setNewExercise(p => ({...p, name: e.target.value}))} 
                        placeholder="e.g., Bench Press"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <AppTextField 
                            label="Sets" 
                            type="number" 
                            value={newExercise.sets} 
                            onChange={e => setNewExercise(p => ({...p, sets: Number(e.target.value)}))} 
                        />
                        <AppTextField 
                            label="Reps" 
                            value={newExercise.reps} 
                            onChange={e => setNewExercise(p => ({...p, reps: e.target.value}))} 
                            placeholder="e.g., 8-12"
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default WorkoutDetailModal;
