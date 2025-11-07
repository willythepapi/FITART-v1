import React from 'react';
import { Modal as RNModal, View, Pressable } from 'react-native';
import { styled } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const StyledView = styled(View);
const StyledPressable = styled(Pressable);

interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const ActionSheet: React.FC<ActionSheetProps> = ({ isOpen, onClose, children }) => {
  const insets = useSafeAreaInsets();

  return (
    <RNModal
      animationType="fade"
      transparent={true}
      visible={isOpen}
      onRequestClose={onClose}
    >
      <StyledPressable className="flex-1 justify-end bg-black/50" onPress={onClose}>
        <StyledPressable 
            style={{ paddingBottom: insets.bottom }}
            className="w-full p-4"
            onPress={(e) => e.stopPropagation()}
        >
          {children}
        </StyledPressable>
      </StyledPressable>
    </RNModal>
  );
};

export default ActionSheet;
