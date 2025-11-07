import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppUseCases } from '../application/usecase-provider';
import type { UserEntity } from '../domain/entities';
import Icon from '../components/Icon';
import { useLanguage } from '../context/LanguageContext';
import { useUnit } from '../context/UnitContext';
import AppCard from '../components/AppCard';
import AppTextField from '../components/AppTextField';
import Button from '../components/Button';
import ActionSheet from '../components/ActionSheet';
import CameraModal from '../components/CameraModal';

const ProfileScreen: React.FC = () => {
  const { getUserProfile, updateUserProfile } = useAppUseCases();
  const { t } = useLanguage();
  const { unitSystem, formatWeight, formatHeight, getWeightLabel, getHeightLabel, convertWeightToMetric, convertHeightToMetric, convertWeightFromMetric, convertHeightFromMetric } = useUnit();

  const [user, setUser] = useState<UserEntity | null>(null);
  const [formState, setFormState] = useState<UserEntity | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPhotoSheetOpen, setIsPhotoSheetOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const fetchUser = useCallback(async () => {
    const userData = await getUserProfile.execute();
    setUser(userData);
    setFormState(userData);
  }, [getUserProfile]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (formState) {
      const { name, value } = e.target;
      let finalValue: string | number;

      if (name === 'name' || name === 'goal') {
        finalValue = value;
      } else {
        let numericValue = parseFloat(value) || 0;
        if (unitSystem === 'imperial') {
          if (name === 'weight') {
            numericValue = convertWeightToMetric(numericValue);
          } else if (name === 'height') {
            numericValue = convertHeightToMetric(numericValue);
          }
        }
        finalValue = numericValue;
      }
      setFormState({ ...formState, [name]: finalValue });
    }
  };
  
  const handleSave = async () => {
    if (formState) {
      const updatedUser = await updateUserProfile.execute(formState);
      setUser(updatedUser);
      setFormState(updatedUser);
      setIsEditing(false);
    }
  };

  const handleEditToggle = () => {
      if (isEditing) {
          setFormState(user); // Reset changes if cancelling
      }
      setIsEditing(!isEditing);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && formState) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormState({ ...formState, photoDataUrl: reader.result as string });
        };
        reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleCapture = (dataUrl: string) => {
    if (formState) {
        setFormState({ ...formState, photoDataUrl: dataUrl });
        setIsCameraModalOpen(false);
    }
  };
  
  if (!user || !formState) {
    return <div className="p-4 pt-16 text-center">{t('profile_loading')}</div>;
  }
  
  const DetailItem: React.FC<{ icon: 'cake' | 'scale' | 'ruler' | 'target'; label: string; value: string | number }> = ({ icon, label, value }) => (
    <div className="flex items-center gap-4 py-3.5">
      <div className="p-2 bg-light-bg dark:bg-dark-bg rounded-full">
        <Icon name={icon} className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
      </div>
      <div>
        <span className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">{label}</span>
        <p className="font-semibold text-md text-light-text-primary dark:text-dark-text-primary">{value}</p>
      </div>
    </div>
  );
  
  const goalTranslations: Record<string, string> = {
      'lose_weight': t('profile_goal_lose_weight'),
      'gain_muscle': t('profile_goal_gain_muscle'),
      'maintain': t('profile_goal_maintain'),
  }

  const displayedWeight = unitSystem === 'metric' ? Math.round(formState.weight) : Math.round(convertWeightFromMetric(formState.weight));
  const displayedHeight = unitSystem === 'metric' ? Math.round(formState.height) : Math.round(convertHeightFromMetric(formState.height));

  const avatarSrc = formState.photoDataUrl || `https://i.pravatar.cc/150?u=${user.id}`;


  return (
    <div className="space-y-6 h-full overflow-y-auto">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoSelect}
        accept="image/*"
        className="hidden"
      />
      <div className="text-center relative">
        <button 
            className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-light-card dark:border-dark-border shadow-elevation-md block group relative"
            onClick={() => setIsPhotoSheetOpen(true)}
            aria-label={t('profile_change_photo')}
        >
            <img src={avatarSrc} alt="User profile" className="w-full h-full rounded-full object-cover" />
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-base">
                <Icon name="pencil" className="w-6 h-6 text-white" />
            </div>
        </button>
        <h2 className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary tracking-title">{isEditing ? formState.name : user.name}</h2>
      </div>

      <AppCard>
        {isEditing ? (
          <div className="space-y-4">
            <AppTextField label={t('profile_edit')} name="name" value={formState.name} onChange={handleInputChange} />
            <AppTextField label={t('profile_age')} name="age" type="number" value={formState.age} onChange={handleInputChange} />
            <AppTextField label={`${t('profile_weight')} (${getWeightLabel()})`} name="weight" type="number" value={displayedWeight} onChange={handleInputChange} />
            <AppTextField label={`${t('profile_height')} (${getHeightLabel()})`} name="height" type="number" value={displayedHeight} onChange={handleInputChange} />
            <div>
              <label className="block text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1.5 ml-1">{t('profile_goal')}</label>
              <div className="relative">
                <select name="goal" value={formState.goal} onChange={handleInputChange} className="w-full bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary px-4 py-3 rounded-radius-input focus:outline-none focus:ring-1 focus:ring-accent/20 transition-shadow duration-base appearance-none">
                  <option value="lose_weight">{t('profile_goal_lose_weight')}</option>
                  <option value="gain_muscle">{t('profile_goal_gain_muscle')}</option>
                  <option value="maintain">{t('profile_goal_maintain')}</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-light-text-secondary dark:text-dark-text-secondary">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-light-border dark:divide-dark-border -my-[18px]">
            <DetailItem icon="cake" label={t('profile_age')} value={user.age} />
            <DetailItem icon="scale" label={t('profile_weight')} value={formatWeight(user.weight)} />
            <DetailItem icon="ruler" label={t('profile_height')} value={formatHeight(user.height)} />
            <DetailItem icon="target" label={t('profile_goal')} value={goalTranslations[user.goal]} />
          </div>
        )}
      </AppCard>

      <div className="flex justify-center pt-2 gap-4">
        {isEditing && (
             <Button onClick={handleEditToggle} variant="ghost" shape="pill">
                {t('workouts_form_cancel')}
            </Button>
        )}
        <Button onClick={isEditing ? handleSave : handleEditToggle} shape="pill">
          {isEditing ? t('profile_save') : t('profile_edit')}
        </Button>
      </div>
       <ActionSheet isOpen={isPhotoSheetOpen} onClose={() => setIsPhotoSheetOpen(false)}>
        <div className="bg-dark-card rounded-[18px] divide-y divide-dark-border">
          <button
            className="w-full text-center h-[54px] font-semibold text-info text-base transition-colors duration-base"
            onClick={() => {
                setIsCameraModalOpen(true);
                setIsPhotoSheetOpen(false);
            }}
          >
            {t('profile_take_photo')}
          </button>
          <button
            className="w-full text-center h-[54px] font-semibold text-info text-base transition-colors duration-base"
            onClick={() => {
                fileInputRef.current?.click();
                setIsPhotoSheetOpen(false);
            }}
          >
            {t('profile_choose_gallery')}
          </button>
        </div>
        <button
          className="w-full text-center h-[54px] rounded-[18px] font-semibold text-info text-base transition-colors duration-base bg-dark-card mt-3"
          onClick={() => setIsPhotoSheetOpen(false)}
        >
          {t('workouts_form_cancel')}
        </button>
      </ActionSheet>
      <CameraModal 
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={handleCapture}
      />
    </div>
  );
};

export default ProfileScreen;