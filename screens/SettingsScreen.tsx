import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAppUseCases } from '../application/usecase-provider';
import Icon from '../components/Icon';
import type { UserEntity, AppSettingsEntity } from '../domain/entities';
import { useUnit } from '../context/UnitContext';
import { useStyle, type FontSize } from '../context/StyleContext';
import SegmentedControl from '../components/SegmentedControl';
import Button from '../components/Button';
import ToggleSwitch from '../components/ToggleSwitch';
import Modal from '../components/Modal';
import TimePickerModal from '../components/TimePickerModal';
import GoalsScreen from './GoalsScreen';
import ActionSheet from '../components/ActionSheet';

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

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <h2 className="px-2 pb-2 text-sm font-semibold uppercase text-light-text-tertiary dark:text-dark-text-tertiary tracking-widest">{title}</h2>
);

const SettingLink: React.FC<{
  icon: React.ComponentProps<typeof Icon>['name'];
  title: string;
  onClick: () => void;
}> = ({ icon, title, onClick }) => (
  <button
    onClick={onClick}
    className="w-full bg-light-card dark:bg-dark-surface rounded-radius-std py-[18px] px-[22px] bg-gradient-to-b from-transparent to-white/[.02] flex items-center gap-4 text-left transition-all duration-micro hover:bg-light-surface dark:hover:bg-dark-border active:scale-[0.97]"
  >
    <Icon name={icon} className="w-5 h-5 text-accent flex-shrink-0" />
    <span className="flex-1 font-semibold text-light-text-primary dark:text-dark-text-primary">{title}</span>
    <Icon name="chevron-right" className="w-5 h-5 text-light-text-tertiary dark:text-dark-text-tertiary" />
  </button>
);

const SettingValueLink: React.FC<{
  icon: React.ComponentProps<typeof Icon>['name'];
  title: string;
  value: string;
  onClick: () => void;
}> = ({ icon, title, value, onClick }) => (
  <button
    onClick={onClick}
    className="w-full bg-light-card dark:bg-dark-surface rounded-radius-std py-[18px] px-[22px] bg-gradient-to-b from-transparent to-white/[.02] flex items-center gap-4 text-left transition-all duration-micro hover:bg-light-surface dark:hover:bg-dark-border active:scale-[0.97]"
  >
    <Icon name={icon} className="w-5 h-5 text-accent flex-shrink-0" />
    <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">{title}</span>
    <div className="flex-1" />
    <span className="font-medium text-light-text-secondary dark:text-dark-text-secondary">{value}</span>
    <Icon name="chevron-right" className="w-5 h-5 text-light-text-tertiary dark:text-dark-text-tertiary" />
  </button>
);

const SettingControl: React.FC<{
  icon: React.ComponentProps<typeof Icon>['name'];
  title: string;
  children: React.ReactNode;
}> = ({ icon, title, children }) => (
  <div className="w-full bg-light-card dark:bg-dark-surface rounded-radius-std py-[18px] px-[22px] bg-gradient-to-b from-transparent to-white/[.02] flex items-center justify-between gap-4 text-left">
    <div className="flex items-center gap-4">
      <Icon name={icon} className="w-5 h-5 text-accent flex-shrink-0" />
      <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">{title}</span>
    </div>
    {children}
  </div>
);

const SettingToggle: React.FC<{
  icon: React.ComponentProps<typeof Icon>['name'];
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ icon, title, description, checked, onChange }) => (
    <div className="w-full bg-light-card dark:bg-dark-surface rounded-radius-std py-[18px] px-[22px] bg-gradient-to-b from-transparent to-white/[.02] flex items-center gap-4 text-left">
        <Icon name={icon} className="w-5 h-5 text-accent flex-shrink-0" />
        <div className="flex-1">
            <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">{title}</span>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{description}</p>
        </div>
        <ToggleSwitch checked={checked} onChange={onChange} />
    </div>
);


const SettingsScreen: React.FC<{openProfile: () => void}> = ({ openProfile }) => {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { unitSystem, setUnitSystem } = useUnit();
  const { fontSize, setFontSize } = useStyle();
  const { clearAllData, getAppSettings, updateAppSettings, exportUserData } = useAppUseCases();
  const [isClearDataModalOpen, setIsClearDataModalOpen] = useState(false);
  const [isGoalsScreenOpen, setIsGoalsScreenOpen] = useState(false);
  const [isExportSheetOpen, setIsExportSheetOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState({ meals: true, workouts: true, progress: true });
  const [settings, setSettings] = useState<AppSettingsEntity | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [editingReminder, setEditingReminder] = useState<'meal' | 'workout' | null>(null);

  useEffect(() => {
    getAppSettings.execute().then(setSettings);
  }, [getAppSettings]);

  const handleClearData = async () => {
    await clearAllData.execute();
    setIsClearDataModalOpen(false);
    window.location.reload();
  };

  const handleSaveReminderTime = async (time: string) => {
    if (!editingReminder || !settings) return;

    const key = editingReminder === 'meal' ? 'mealReminderTime' : 'workoutReminderTime';
    
    try {
        const updatedSettings = await updateAppSettings.execute({ [key]: time });
        setSettings(updatedSettings);
    } catch (error) {
        console.error("Failed to update reminder time:", error);
    } finally {
        setEditingReminder(null);
    }
  };
  
  const handleWaterIntervalChange = async (interval: number) => {
    if (!settings) return;
    try {
        const updatedSettings = await updateAppSettings.execute({ waterReminderInterval: interval });
        setSettings(updatedSettings);
    } catch (error) {
        console.error("Failed to update water interval:", error);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const filesToExport = await exportUserData.execute(exportOptions);
      
      const files = filesToExport.map(f => new File([f.content], f.filename, { type: f.mimeType }));
      
      if (navigator.share && navigator.canShare({ files })) {
        await navigator.share({
          title: 'ZenithFit Data Export',
          text: 'Here is your data from ZenithFit.',
          files: files,
        });
      } else {
        alert(t('export_share_unsupported'));
        // Fallback to download files one by one
        for (const file of files) {
          const link = document.createElement('a');
          const url = URL.createObjectURL(file);
          link.href = url;
          link.download = file.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert(t('export_failed'));
    } finally {
      setIsExporting(false);
      setIsExportSheetOpen(false);
    }
  };

  const CheckboxRow: React.FC<{label: string, checked: boolean, onChange: (checked: boolean) => void}> = ({label, checked, onChange}) => (
    <label className="flex items-center justify-between p-4 cursor-pointer">
      <span className="font-semibold text-dark-text-primary">{label}</span>
      <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors duration-base ${checked ? 'bg-accent' : 'bg-dark-border'}`}>
        {checked && <Icon name="check" className="w-4 h-4 text-dark-bg" />}
      </div>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only" />
    </label>
  );


  if (isGoalsScreenOpen) {
    return <GoalsScreen onClose={() => setIsGoalsScreenOpen(false)} />;
  }

  return (
    <div className="p-5 space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-light-text-primary dark:text-dark-text-primary tracking-display">{t('settings_title')}</h1>
        <p className="text-light-text-secondary dark:text-dark-text-secondary">{t('settings_subtitle')}</p>
      </header>

      <div className="space-y-6">
        
        <div>
          <SectionTitle title={t('settings_account')} />
          <div className="space-y-3">
            <SettingLink icon="user-circle" title={t('settings_profile')} onClick={openProfile} />
            <SettingLink icon="target" title={t('settings_daily_goals')} onClick={() => setIsGoalsScreenOpen(true)} />
          </div>
        </div>
        
        <div>
          <SectionTitle title={t('settings_appearance')} />
          <div className="space-y-3">
            <SettingControl icon={theme === 'dark' ? 'moon' : 'sun'} title={t('settings_theme')}>
                 <SegmentedControl
                    options={[
                      { label: t('settings_theme_light'), value: 'light' },
                      { label: t('settings_theme_dark'), value: 'dark' },
                    ]}
                    selectedValue={theme}
                    onValueChange={(value) => setTheme(value as 'light' | 'dark')}
                  />
            </SettingControl>
            <SettingControl icon="text-size" title={t('settings_font_size')}>
                 <SegmentedControl<FontSize>
                    options={[
                      { label: t('settings_font_size_small'), value: 'sm' },
                      { label: t('settings_font_size_medium'), value: 'base' },
                      { label: t('settings_font_size_large'), value: 'lg' },
                    ]}
                    selectedValue={fontSize}
                    onValueChange={setFontSize}
                  />
            </SettingControl>
            <SettingControl icon="language" title={t('settings_language')}>
                 <SegmentedControl
                    options={[
                      { label: 'English', value: 'en' },
                      { label: 'Türkçe', value: 'tr' },
                    ]}
                    selectedValue={language}
                    onValueChange={(value) => setLanguage(value as 'en' | 'tr')}
                  />
            </SettingControl>
            <SettingControl icon="arrows-right-left" title={t('settings_units')}>
                 <SegmentedControl
                    options={[
                      { label: t('settings_units_metric'), value: 'metric' },
                      { label: t('settings_units_imperial'), value: 'imperial' },
                    ]}
                    selectedValue={unitSystem}
                    onValueChange={(value) => setUnitSystem(value as 'metric' | 'imperial')}
                  />
            </SettingControl>
          </div>
        </div>
        
        <div>
            <SectionTitle title={t('settings_notifications')} />
            <div className="space-y-3">
              <SettingToggle 
                  icon="bell"
                  title={t('settings_push_notifications')}
                  description={t('settings_push_notifications_description')}
                  checked={notificationsEnabled}
                  onChange={setNotificationsEnabled}
              />
              {settings && (
                <>
                  <SettingValueLink icon="cake" title={t('settings_meal_reminder')} value={settings.mealReminderTime} onClick={() => setEditingReminder('meal')} />
                  <SettingValueLink icon="dumbbell" title={t('settings_workout_reminder')} value={settings.workoutReminderTime} onClick={() => setEditingReminder('workout')} />
                  <div className="space-y-1">
                      <SettingControl icon="water" title={t('settings_water_reminder_interval')}>
                         <SegmentedControl<string>
                            options={[
                              { label: t('settings_interval_off'), value: '0' },
                              { label: t('settings_interval_15m'), value: '15' },
                              { label: t('settings_interval_30m'), value: '30' },
                              { label: t('settings_interval_60m'), value: '60' },
                            ]}
                            selectedValue={String(settings.waterReminderInterval)}
                            onValueChange={(value) => handleWaterIntervalChange(parseInt(value, 10))}
                          />
                      </SettingControl>
                      <p className="px-4 text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                        {t('settings_water_reminder_interval_description')}
                      </p>
                  </div>
                </>
              )}
            </div>
        </div>

        <div>
          <SectionTitle title={t('settings_data_privacy')} />
          <div className="space-y-3">
            <SettingLink icon="arrow-up-tray" title={t('settings_export_data')} onClick={() => setIsExportSheetOpen(true)} />
            <SettingLink icon="trash" title={t('settings_data_clear')} onClick={() => setIsClearDataModalOpen(true)} />
          </div>
        </div>
      </div>

       <ConfirmationModal
            isOpen={isClearDataModalOpen}
            onConfirm={handleClearData}
            onCancel={() => setIsClearDataModalOpen(false)}
            title={t('settings_confirm_clear_title')}
            message={t('settings_confirm_clear_message')}
            confirmText={t('settings_confirm_clear_button')}
            cancelText={t('settings_cancel_button')}
        />
        {settings && (
            <TimePickerModal
                isOpen={!!editingReminder}
                onClose={() => setEditingReminder(null)}
                onSave={handleSaveReminderTime}
                initialTime={editingReminder === 'meal' ? settings.mealReminderTime : settings.workoutReminderTime}
                title={t('time_picker_title')}
            />
        )}
        <ActionSheet isOpen={isExportSheetOpen} onClose={() => setIsExportSheetOpen(false)}>
            <div className="bg-dark-card rounded-[18px]">
                <h3 className="text-center text-lg font-semibold p-4 text-dark-text-primary">{t('export_options_title')}</h3>
                <div className="divide-y divide-dark-border">
                    <CheckboxRow label={t('export_meals')} checked={exportOptions.meals} onChange={c => setExportOptions(p => ({...p, meals: c}))}/>
                    <CheckboxRow label={t('export_workouts')} checked={exportOptions.workouts} onChange={c => setExportOptions(p => ({...p, workouts: c}))}/>
                    <CheckboxRow label={t('export_progress')} checked={exportOptions.progress} onChange={c => setExportOptions(p => ({...p, progress: c}))}/>
                </div>
                <div className="p-3">
                    <Button 
                        onClick={handleExport} 
                        disabled={isExporting || Object.values(exportOptions).every(v => !v)}
                        className="w-full"
                    >
                        {isExporting ? t('exporting') : t('export_generate_and_share')}
                    </Button>
                </div>
            </div>
            <button
                className="w-full text-center h-[54px] rounded-[18px] font-semibold text-info text-base transition-colors duration-base bg-dark-card mt-3"
                onClick={() => setIsExportSheetOpen(false)}
            >
                {t('settings_cancel_button')}
            </button>
        </ActionSheet>
    </div>
  );
};

export default SettingsScreen;