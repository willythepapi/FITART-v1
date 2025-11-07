import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { WorkoutEntity, ExerciseEntity, WeeklyWorkoutPlanEntity, WorkoutCategory } from '../domain/entities';
import { useAppUseCases } from '../application/usecase-provider';
import Icon from '../components/Icon';
import { useLanguage } from '../context/LanguageContext';
import AppCard from '../components/AppCard';
import Button from '../components/Button';
import AppTextField from '../components/AppTextField';
import WorkoutCard from '../components/WorkoutCard';
import Modal from '../components/Modal';
import WorkoutDetailModal from '../components/WorkoutDetailModal';
import WeeklyPlanScreen from './WeeklyPlanScreen';
import ActionSheet from '../components/ActionSheet';
import { useWeeklyPlan } from '../application/hooks/useWeeklyHooks';

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const ConfirmationModal: React.FC<{
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
}> = ({ isOpen, onConfirm, onCancel, title, message, confirmText, cancelText }) => {
    if (!isOpen) return null;

    const footer = (
        <div className="flex flex-col gap-3">
            <Button onClick={onConfirm} variant="danger" className="w-full">
                {confirmText}
            </Button>
            <Button onClick={onCancel} variant="ghost" className="w-full">
                {cancelText}
            </Button>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onCancel} title={title} footer={footer}>
            <div className="text-center">
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{message}</p>
            </div>
        </Modal>
    );
};

type FormExercise = { id?: string; name: string; sets: number; reps: string; description: string; videoUrl: string };

interface WorkoutFormModalProps {
    isOpen: boolean;
    onSave: (workout: { id?: string; name: string; category: WorkoutCategory, exercises: Omit<ExerciseEntity, 'id' | 'workoutId'>[] }) => void;
    onCancel: () => void;
    initialData?: WorkoutEntity | null;
}

const WorkoutFormModal: React.FC<WorkoutFormModalProps> = ({ isOpen, onSave, onCancel, initialData }) => {
    const { t } = useLanguage();
    const [name, setName] = useState('');
    const [category, setCategory] = useState<WorkoutCategory>('Full Body');
    const [exercises, setExercises] = useState<FormExercise[]>([{ name: '', sets: 3, reps: '10', description: '', videoUrl: '' }]);
    const [isDirty, setIsDirty] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const categories: WorkoutCategory[] = ['Full Body', 'Upper', 'Lower', 'Push', 'Pull', 'Legs'];

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setCategory(initialData.category || 'Full Body');
            setExercises(initialData.exercises.map(ex => ({
                ...ex,
                description: ex.description || '',
                videoUrl: ex.videoUrl || ''
            })));
        } else {
            setName('');
            setCategory('Full Body');
            setExercises([{ name: '', sets: 3, reps: '10', description: '', videoUrl: '' }]);
        }
        setIsDirty(false);
    }, [initialData, isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        
        const getInitialState = () => {
            if (!initialData) return { name: '', category: 'Full Body', exercises: [{ name: '', sets: 3, reps: '10', description: '', videoUrl: '' }] };
            return {
                name: initialData.name,
                category: initialData.category,
                exercises: initialData.exercises.map(ex => ({
                    name: ex.name, sets: ex.sets, reps: ex.reps, description: ex.description || '', videoUrl: ex.videoUrl || '',
                }))
            };
        };
        
        const initialComparable = getInitialState();
        initialComparable.exercises.sort((a,b) => a.name.localeCompare(b.name));

        const currentComparableExercises = exercises.map(ex => ({
            name: ex.name, sets: ex.sets, reps: ex.reps, description: ex.description, videoUrl: ex.videoUrl
        }));
        currentComparableExercises.sort((a,b) => a.name.localeCompare(b.name));
        
        const hasChanged = JSON.stringify({ name, category, exercises: currentComparableExercises }) !== JSON.stringify(initialComparable);
        setIsDirty(hasChanged);
    }, [name, category, exercises, initialData, isOpen]);

    const handleExerciseChange = (index: number, field: string, value: string | number) => {
        const newExercises = [...exercises];
        (newExercises[index] as any)[field] = value;
        setExercises(newExercises);
    };

    const addExercise = () => setExercises([...exercises, { name: '', sets: 3, reps: '10', description: '', videoUrl: '' }]);
    const removeExercise = (index: number) => setExercises(exercises.filter((_, i) => i !== index));

    const handleSave = () => {
        if (!name.trim() || exercises.some(ex => !ex.name.trim())) {
            alert(t('workouts_form_alert'));
            return;
        }
        onSave({ id: initialData?.id, name, category, exercises });
    };

    const handleAttemptCancel = () => isDirty ? setShowCancelModal(true) : onCancel();
    
    const footer = (
        <div className="flex justify-end gap-4 w-full">
            <Button onClick={handleAttemptCancel} variant="ghost">{t('workouts_form_cancel')}</Button>
            <Button onClick={handleSave}>
                {initialData ? t('workouts_update_button') : t('workouts_form_save')}
            </Button>
        </div>
    );

    return (
        <>
            <Modal isOpen={isOpen} onClose={handleAttemptCancel} title={initialData ? t('workouts_edit_title') : t('workouts_create_title')} footer={footer}>
                <div className="space-y-6">
                    <section className="space-y-4">
                        <AppTextField value={name} onChange={e => setName(e.target.value)} placeholder={t('workouts_form_name')} label={t('workouts_form_name')} />
                    </section>
                    <section className="space-y-3">
                        <label className="block text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary ml-1">Category</label>
                        <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setCategory(cat)}
                                className={`text-sm font-semibold px-3 py-1.5 rounded-full transition-all duration-base outline-none ${
                                    category === cat
                                    ? 'bg-accent text-dark-bg'
                                    : 'bg-dark-surface text-dark-text-secondary hover:bg-dark-border'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                        </div>
                    </section>
                    <section className="space-y-4">
                        <h3 className="text-lg font-semibold dark:text-dark-text-primary -mb-1">{t('workouts_form_exercises')}</h3>
                        {exercises.map((ex, index) => (
                            <div key={index} className="space-y-4 dark:bg-dark-surface rounded-radius-sm py-4 px-5">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold dark:text-dark-text-primary">Exercise #{index + 1}</span>
                                    <Button onClick={() => removeExercise(index)} variant="ghost" shape="circle" iconOnly iconName="close" className="w-10 h-10 text-danger hover:bg-danger/10"/>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <AppTextField value={ex.name} onChange={e => handleExerciseChange(index, 'name', e.target.value)} placeholder={t('workouts_form_exercise_name')} label="Exercise Name" />
                                    <div className="grid grid-cols-2 gap-3">
                                        <AppTextField type="number" value={ex.sets} onChange={e => handleExerciseChange(index, 'sets', parseInt(e.target.value, 10))} label="Sets" />
                                        <AppTextField value={ex.reps} onChange={e => handleExerciseChange(index, 'reps', e.target.value)} label="Reps" />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <Button onClick={addExercise} variant="ghost" className="w-full mt-2"><Icon name="plus" className="w-4 h-4"/><span>{t('workouts_form_add_exercise')}</span></Button>
                    </section>
                </div>
            </Modal>
            <ConfirmationModal isOpen={showCancelModal} onConfirm={() => { setShowCancelModal(false); onCancel(); }} onCancel={() => setShowCancelModal(false)} title={t('workouts_confirm_cancel_title')} message={t('workouts_confirm_cancel_message')} confirmText={t('workouts_confirm_discard')} cancelText={t('workouts_confirm_keep_editing')} />
        </>
    );
};

// Fix: Renamed 'workouts' prop to 'workoutMap' to avoid potential naming collisions and fix typing issue.
const WeeklyOverviewCard: React.FC<{ plan: WeeklyWorkoutPlanEntity[]; workoutMap: Record<string, WorkoutEntity>; onEditPlan: () => void; }> = ({ plan, workoutMap, onEditPlan }) => {
    const { t } = useLanguage();
    const days = [
        { id: 1, key: 'monday' }, { id: 2, key: 'tuesday' }, { id: 3, key: 'wednesday' },
        { id: 4, key: 'thursday' }, { id: 5, key: 'friday' }, { id: 6, key: 'saturday' },
        { id: 7, key: 'sunday' },
    ];
    const planMap = new Map(plan.map(p => [p.dayOfWeek, p.workoutId]));

    if (plan.length === 0) return null;

    return (
        <section className="animate-fadeInUp" style={{ opacity: 0 }}>
             <AppCard>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg dark:text-dark-text-primary">Weekly Plan</h3>
                    <button onClick={onEditPlan} className="text-sm font-semibold text-accent hover:text-accent-dark">
                        Edit &rarr;
                    </button>
                </div>
                <div className="space-y-2">
                    {days.map(({ id, key }) => {
                        const workoutId = planMap.get(id);
                        // Fix: Add a type guard to ensure workoutId is a string before using it as an index.
                        // This resolves the "Type 'unknown' cannot be used as an index type" error, which likely stems
                        // from improper type inference from the data layer (e.g., JSON.parse returning 'any').
                        const workout = typeof workoutId === 'string' ? workoutMap[workoutId] : null;
                        const dayName = t(`workouts_day_${key}` as any);
                        
                        return (
                            <div key={id} className="flex justify-between items-center text-sm py-1">
                                <span className="font-medium text-dark-text-secondary">{dayName}</span>
                                <span className="font-semibold text-dark-text-primary truncate max-w-[60%]">
                                    {workout ? workout.name : t('workouts_rest_day')}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </AppCard>
        </section>
    );
};

const FilterChip: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-shrink-0 text-sm font-semibold px-4 py-2 rounded-full transition-all duration-base outline-none active:scale-95 ${
            isActive
                ? 'bg-accent text-dark-bg shadow-[0_0_15px_rgba(127,183,255,0.3)]'
                : 'bg-dark-surface text-dark-text-secondary hover:bg-dark-border'
        }`}
    >
        {label}
    </button>
);

const EmptyWorkoutIllustration = () => (
    <svg className="w-24 h-24 text-dark-text-tertiary" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M60 100C82.0914 100 100 82.0914 100 60C100 37.9086 82.0914 20 60 20C37.9086 20 20 37.9086 20 60C20 82.0914 37.9086 100 60 100Z" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="8 8"/>
      <path d="M60 45V75" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M45 60H75" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const AddWorkoutFab: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <Button 
        onClick={onClick} 
        shape="circle" 
        iconOnly 
        iconName="plus" 
        className="fixed bottom-24 right-5 w-14 h-14 z-20 animate-iconPopIn shadow-lg"
        aria-label="Add new workout"
    />
);

const WorkoutsScreen: React.FC = () => {
  const [workouts, setWorkouts] = useState<WorkoutEntity[]>([]);
  const { getWorkouts, addWorkout, updateWorkout, completeWorkout, getDailyProgress } = useAppUseCases();
  const { plan, workouts: planWorkouts, refetch: refetchPlan } = useWeeklyPlan();
  const [completedWorkoutIds, setCompletedWorkoutIds] = useState<string[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isPlanVisible, setIsPlanVisible] = useState(false);
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<WorkoutEntity | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutEntity | null>(null);
  const [filter, setFilter] = useState('All');
  const { t } = useLanguage();
  
  const fetchData = useCallback(async () => {
    const [workoutsResult, progressResult] = await Promise.all([ getWorkouts.execute(), getDailyProgress.execute(getTodayDateString()) ]);
    setWorkouts(workoutsResult.sort((a, b) => a.name.localeCompare(b.name)));
    if(progressResult) setCompletedWorkoutIds(progressResult.workoutsCompleted);
  }, [getWorkouts, getDailyProgress]);

  useEffect(() => {
    fetchData();
    refetchPlan();
  }, [fetchData, refetchPlan]);
  
  const handleComplete = async (workoutId: string) => {
    await completeWorkout.execute(getTodayDateString(), workoutId);
    setCompletedWorkoutIds(prev => [...prev, workoutId]);
  };

  const handleCreateNew = () => {
    setEditingWorkout(null);
    setIsFormVisible(true);
    setIsActionSheetOpen(false);
  };
  
  const handleEdit = (workout: WorkoutEntity) => {
    setEditingWorkout(workout);
    setIsFormVisible(true);
  };

  const handleOpenPlan = () => {
    setIsPlanVisible(true);
    setIsActionSheetOpen(false);
  };
  
  const handleCancelForm = () => {
    setIsFormVisible(false);
    setEditingWorkout(null);
  };

  const handleSaveWorkout = async (workoutData: { id?: string; name: string; category: WorkoutCategory; exercises: Omit<ExerciseEntity, 'id' | 'workoutId'>[] }) => {
      if (workoutData.id && editingWorkout) {
        const workoutToUpdate: WorkoutEntity = {
          ...editingWorkout,
          name: workoutData.name,
          category: workoutData.category,
          exercises: workoutData.exercises.map((ex) => ({
            ...ex, id: (ex as FormExercise).id || '', workoutId: editingWorkout.id,
          })),
        };
        await updateWorkout.execute(workoutToUpdate);
      } else {
        const { id, ...newWorkoutData } = workoutData;
        await addWorkout.execute(newWorkoutData);
      }
      handleCancelForm();
      fetchData();
      refetchPlan();
  };
  
  const filteredWorkouts = useMemo(() => {
      if (filter === 'All') return workouts;
      return workouts.filter(w => {
        if (filter === 'Upper') return w.category === 'Upper' || w.category === 'Push' || w.category === 'Pull';
        if (filter === 'Lower') return w.category === 'Lower' || w.category === 'Legs';
        return w.category === filter;
      });
  }, [workouts, filter]);
  
  const filterOptions = ['All', 'Full Body', 'Upper', 'Lower', 'Push', 'Pull', 'Legs'];

  if (isPlanVisible) {
    return <WeeklyPlanScreen onClose={() => setIsPlanVisible(false)} />;
  }

  return (
    <div className="p-5 pb-24 space-y-6">
      <header>
          <h1 className="text-3xl font-semibold dark:text-dark-text-primary tracking-display">{t('workouts_title')}</h1>
          <p className="dark:text-dark-text-secondary font-normal opacity-80 text-sm">Strong habits beat motivation.</p>
      </header>
      
      <WeeklyOverviewCard plan={plan} workoutMap={planWorkouts} onEditPlan={handleOpenPlan} />

        <>
            <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-5 px-5" style={{ scrollbarWidth: 'none' }}>
                {filterOptions.map(option => (
                     <FilterChip key={option} label={option} isActive={filter === option} onClick={() => setFilter(option)} />
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredWorkouts.length > 0 ? (
                filteredWorkouts.map((w, index) => (
                  <div key={w.id} className="animate-fadeInUp" style={{ animationDelay: `${index * 80}ms`, opacity: 0 }}>
                    <WorkoutCard workout={w} onComplete={handleComplete} isCompleted={completedWorkoutIds.includes(w.id)} onViewDetails={setSelectedWorkout} onEdit={handleEdit} />
                  </div>
                ))
              ) : (
                <div className="md:col-span-2 py-10 flex flex-col items-center justify-center gap-4 text-center">
                  <EmptyWorkoutIllustration />
                  <h3 className="text-lg font-semibold dark:text-dark-text-primary mt-4">Let's build your first workout.</h3>
                  <p className="text-sm text-center dark:text-dark-text-secondary max-w-xs">Your journey starts here.</p>
                </div>
              )}
            </div>
        </>
        
      <AddWorkoutFab onClick={() => setIsActionSheetOpen(true)} />
      <WorkoutDetailModal workout={selectedWorkout} onClose={() => setSelectedWorkout(null)} />
      <WorkoutFormModal isOpen={isFormVisible} initialData={editingWorkout} onSave={handleSaveWorkout} onCancel={handleCancelForm} />
      <ActionSheet isOpen={isActionSheetOpen} onClose={() => setIsActionSheetOpen(false)}>
        <div className="bg-dark-card rounded-[18px] divide-y divide-dark-border">
          <button className="w-full text-center h-[54px] font-semibold text-info" onClick={handleCreateNew}>{t('workouts_action_create')}</button>
          <button className="w-full text-center h-[54px] font-semibold text-info" onClick={handleOpenPlan}>{t('workouts_action_plan')}</button>
        </div>
        <button className="w-full text-center h-[54px] rounded-[18px] font-semibold text-info bg-dark-card mt-3" onClick={() => setIsActionSheetOpen(false)}>{t('workouts_form_cancel')}</button>
      </ActionSheet>
    </div>
  );
};

export default WorkoutsScreen;
