import React, { useState, useEffect, useCallback } from 'react';
import { useAppUseCases } from '../application/usecase-provider';
import { useLanguage } from '../context/LanguageContext';
import { useUnit } from '../context/UnitContext';
import type { UserEntity } from '../domain/entities';
import AppTextField from '../components/AppTextField';
import Button from '../components/Button';
import Icon from '../components/Icon';
import SegmentedControl from '../components/SegmentedControl';
import AppSectionTitle from '../components/AppSectionTitle';

const GoalsScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { getUserProfile, updateUserProfile, calculateDailyTargets } = useAppUseCases();
    const { t } = useLanguage();
    const { unitSystem, getWeightLabel, getHeightLabel, convertWeightToMetric, convertHeightToMetric, convertWeightFromMetric, convertHeightFromMetric } = useUnit();

    const [user, setUser] = useState<UserEntity | null>(null);
    const [formState, setFormState] = useState<Partial<UserEntity>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [hasManualOverride, setHasManualOverride] = useState({ calorie: false, water: false });

    const fetchUser = useCallback(async () => {
        setIsLoading(true);
        const userData = await getUserProfile.execute();
        setUser(userData);
        setFormState(userData || {});
        setIsLoading(false);
    }, [getUserProfile]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    useEffect(() => {
        if (!formState.weight || !formState.height || !formState.age || !formState.gender || !formState.activityLevel) return;
        
        const calculated = calculateDailyTargets.execute({
            weight: formState.weight,
            height: formState.height,
            age: formState.age,
            gender: formState.gender,
            activityLevel: formState.activityLevel,
        });

        setFormState(prev => ({
            ...prev,
            calorieGoal: hasManualOverride.calorie ? prev.calorieGoal : calculated.calorieGoal,
            waterGoal: hasManualOverride.water ? prev.waterGoal : calculated.waterGoal,
        }));
    }, [formState.weight, formState.height, formState.age, formState.gender, formState.activityLevel, calculateDailyTargets, hasManualOverride]);

    const handleMetricChange = (field: keyof UserEntity, value: string) => {
        setHasManualOverride({ calorie: false, water: false }); // Reset overrides on metric change
        handleInputChange(field, value);
    };

    const handleTargetChange = (field: 'calorieGoal' | 'waterGoal', value: string) => {
        if (field === 'calorieGoal') setHasManualOverride(p => ({ ...p, calorie: true }));
        if (field === 'waterGoal') setHasManualOverride(p => ({ ...p, water: true }));
        handleInputChange(field, value);
    };

    const handleInputChange = (field: keyof UserEntity, value: string) => {
        setFormState(prev => {
            const numericFields: (keyof UserEntity)[] = ['targetWeight', 'weight', 'height', 'calorieGoal', 'waterGoal', 'stepsTarget'];
            if (numericFields.includes(field)) {
                let numericValue = parseFloat(value) || 0;
                if (unitSystem === 'imperial') {
                    if (field === 'weight' || field === 'targetWeight') {
                        numericValue = convertWeightToMetric(numericValue);
                    } else if (field === 'height') {
                        numericValue = convertHeightToMetric(numericValue);
                    }
                }
                return { ...prev, [field]: numericValue };
            }
            return { ...prev, [field]: value };
        });
    };

    const handleSave = async () => {
        if (user && formState) {
            await updateUserProfile.execute({ ...user, ...formState });
            onClose();
        }
    };

    const getDisplayValue = (field: 'weight' | 'targetWeight' | 'height') => {
        const metricValue = formState[field] || 0;
        if (unitSystem === 'metric') return Math.round(metricValue);

        if (field === 'height') return Math.round(convertHeightFromMetric(metricValue));
        return Math.round(convertWeightFromMetric(metricValue));
    };

    if (isLoading) {
        return <div className="p-5 text-center">{t('home_loading')}</div>;
    }

    return (
        <div className="p-5 space-y-6 animate-fadeInUp">
            <header className="flex justify-between items-center">
                <Button onClick={onClose} variant="ghost" shape="circle" iconOnly iconName="chevron-left" className="w-11 h-11" />
                <div className="text-center">
                    <h1 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary tracking-title">{t('goals_screen_title')}</h1>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{t('goals_subtitle')}</p>
                </div>
                <div className="w-11" />
            </header>

            <div className="space-y-6">
                <section>
                    <AppSectionTitle title={t('goals_your_metrics')} className="mb-4" />
                    <div className="space-y-4">
                        <AppTextField label={`${t('goals_current_weight')} (${getWeightLabel()})`} type="number" value={getDisplayValue('weight')} onChange={e => handleMetricChange('weight', e.target.value)} />
                        <AppTextField label={`${t('goals_target_weight')} (${getWeightLabel()})`} type="number" value={getDisplayValue('targetWeight')} onChange={e => handleInputChange('targetWeight', e.target.value)} />
                        <AppTextField label={`${t('goals_height')} (${getHeightLabel()})`} type="number" value={getDisplayValue('height')} onChange={e => handleMetricChange('height', e.target.value)} />
                        <div>
                            <label className="block text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1.5 ml-1">{t('goals_activity_level')}</label>
                             <SegmentedControl
                                options={[
                                    { label: t('goals_activity_low'), value: 'low' },
                                    { label: t('goals_activity_medium'), value: 'medium' },
                                    { label: t('goals_activity_high'), value: 'high' },
                                ]}
                                selectedValue={formState.activityLevel || 'medium'}
                                onValueChange={(value) => setFormState(p => ({...p, activityLevel: value}))}
                            />
                        </div>
                    </div>
                </section>
                <section>
                    <AppSectionTitle title={t('goals_daily_targets')} className="mb-4" />
                    <div className="space-y-4">
                        <AppTextField label={t('goals_calories')} type="number" value={Math.round(formState.calorieGoal || 0)} onChange={e => handleTargetChange('calorieGoal', e.target.value)} />
                        <AppTextField label={t('goals_water')} type="number" value={Math.round(formState.waterGoal || 0)} onChange={e => handleTargetChange('waterGoal', e.target.value)} />
                        <AppTextField label={t('goals_steps')} type="number" value={formState.stepsTarget || 0} onChange={e => handleInputChange('stepsTarget', e.target.value)} />
                        <p className="text-xs text-center text-light-text-tertiary dark:text-dark-text-tertiary px-4">{t('goals_recalculate_hint')}</p>
                    </div>
                </section>
            </div>

            <div className="pt-2">
                <Button onClick={handleSave} className="w-full">
                    {t('goals_save')}
                </Button>
            </div>
        </div>
    );
};

export default GoalsScreen;
