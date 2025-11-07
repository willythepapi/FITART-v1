
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UnitSystem = 'metric' | 'imperial';

const KG_TO_LBS = 2.20462;
const CM_TO_IN = 0.393701;

interface UnitContextType {
  unitSystem: UnitSystem;
  setUnitSystem: (system: UnitSystem) => void;
  formatWeight: (kg: number) => string;
  formatHeight: (cm: number) => string;
  getWeightLabel: () => string;
  getHeightLabel: () => string;
  convertWeightToMetric: (weight: number) => number; // from lbs to kg
  convertHeightToMetric: (height: number) => number; // from in to cm
  convertWeightFromMetric: (weight: number) => number; // from kg to lbs
  convertHeightFromMetric: (height: number) => number; // from cm to in
}

const UNIT_KEY = 'zenithfit_units';
const UnitContext = createContext<UnitContextType | undefined>(undefined);

export const UnitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unitSystem, setUnitSystemState] = useState<UnitSystem>('metric');

  useEffect(() => {
    const loadUnitSystem = async () => {
      try {
        const storedUnit = await AsyncStorage.getItem(UNIT_KEY);
        if (storedUnit) {
          setUnitSystemState(storedUnit as UnitSystem);
        }
      } catch (error) {
        console.error('Failed to load unit system from storage', error);
      }
    };
    loadUnitSystem();
  }, []);

  const setUnitSystem = async (system: UnitSystem) => {
    try {
      await AsyncStorage.setItem(UNIT_KEY, system);
      setUnitSystemState(system);
    } catch (error) {
      console.error('Failed to save unit system to storage', error);
    }
  };

  const getWeightLabel = useCallback(() => (unitSystem === 'metric' ? 'kg' : 'lbs'), [unitSystem]);
  
  const getHeightLabel = useCallback(() => (unitSystem === 'metric' ? 'cm' : 'in'), [unitSystem]);

  const formatWeight = useCallback((kg: number) => {
    if (unitSystem === 'metric') {
      return `${Math.round(kg)} kg`;
    }
    return `${Math.round(kg * KG_TO_LBS)} lbs`;
  }, [unitSystem]);

  const formatHeight = useCallback((cm: number) => {
    if (unitSystem === 'metric') {
      return `${Math.round(cm)} cm`;
    }
    const totalInches = cm * CM_TO_IN;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}' ${inches}"`;
  }, [unitSystem]);
  
  const convertWeightToMetric = (weight: number) => weight / KG_TO_LBS;
  const convertHeightToMetric = (height: number) => height / CM_TO_IN;
  const convertWeightFromMetric = (weight: number) => weight * KG_TO_LBS;
  const convertHeightFromMetric = (height: number) => height * CM_TO_IN;

  const value = useMemo(() => ({
    unitSystem,
    setUnitSystem,
    formatWeight,
    formatHeight,
    getWeightLabel,
    getHeightLabel,
    convertWeightToMetric,
    convertHeightToMetric,
    convertWeightFromMetric,
    convertHeightFromMetric
  }), [unitSystem, formatWeight, formatHeight, getWeightLabel, getHeightLabel]);

  return (
    <UnitContext.Provider value={value}>
      {children}
    </UnitContext.Provider>
  );
};

export const useUnit = (): UnitContextType => {
  const context = useContext(UnitContext);
  if (!context) {
    throw new Error('useUnit must be used within a UnitProvider');
  }
  return context;
};
