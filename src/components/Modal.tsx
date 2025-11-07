import React from 'react';
import { Modal as RNModal, View, Text, Pressable, StyleSheet } from 'react-native';
import { styled } from 'nativewind';
import Button from './Button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  className?: string;
  hideHeader?: boolean;
  footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, className = '', hideHeader = false, footer }) => {
  const insets = useSafeAreaInsets();

  return (
    <RNModal
        animationType="slide"
        transparent={true}
        visible={isOpen}
        onRequestClose={onClose}
    >
        <StyledPressable className="flex-1 justify-end bg-black/50" onPress={onClose}>
            <StyledPressable 
                className="w-full bg-dark-modal max-h-[85vh] rounded-t-radius-modal border-t border-dark-border"
                onPress={(e) => e.stopPropagation()}
                style={{ paddingBottom: insets.bottom }}
            >
                {!hideHeader && (
                    <StyledView className="relative flex-shrink-0 items-center p-4">
                        <StyledView className="absolute top-2 w-10 h-1.5 bg-dark-border rounded-full" />
                        <StyledText className="text-xl font-semibold text-dark-text-primary tracking-title text-center mt-2">{title}</StyledText>
                        <StyledView className="absolute top-3 right-3">
                           <Button onPress={onClose} variant="ghost" shape="circle" iconOnly iconName="close" className="w-11 h-11" />
                        </StyledView>
                    </StyledView>
                )}
                <StyledView className={`px-5 pt-4 pb-6 ${className}`}>
                    {children}
                </StyledView>
                {footer && (
                    <StyledView className="px-5 pt-4 border-t border-dark-border flex-shrink-0">
                        {footer}
                    </StyledView>
                )}
            </StyledPressable>
        </StyledPressable>
    </RNModal>
  );
};

export default Modal;
