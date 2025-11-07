
import React, { useState, useRef, useEffect } from 'react';
import { useAppUseCases } from '../application/usecase-provider';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/Button';
import AppTextField from '../components/AppTextField';

const toHtml = (text: string) => {
    let processedText = text;
    let cursor = '';
    if (text.endsWith('▋')) {
        processedText = text.slice(0, -1);
        cursor = '<span class="animate-pulse">▋</span>';
    }
    return processedText
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^- (.*$)/gm, '<li class="list-disc list-inside ml-4">$1</li>')
        .replace(/\n/g, '<br />') + cursor;
};

interface Message {
    role: 'user' | 'model';
    text: string;
}

const ChatBubble: React.FC<{ message: Message }> = ({ message }) => {
    const isUser = message.role === 'user';
    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-md lg:max-w-lg px-4 py-3 rounded-radius-lg shadow-elevation-md ${
                    isUser
                        ? 'bg-accent text-dark-bg rounded-br-none'
                        : 'bg-light-card dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary rounded-bl-none'
                }`}
            >
                <p className="text-sm" dangerouslySetInnerHTML={{ __html: toHtml(message.text) }} />
            </div>
        </div>
    );
};

const CoachScreen: React.FC = () => {
    const { getAICoachResponse } = useAppUseCases();
    const { t } = useLanguage();
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', text: t('coach_welcome') }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const newUserMessage: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, newUserMessage]);
        setInput('');
        setIsLoading(true);

        const historyForApi = messages.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }]
        }));

        try {
            const stream = getAICoachResponse.executeStream(historyForApi, input);
            let responseText = '';
            setMessages(prev => [...prev, { role: 'model', text: '' }]);

            for await (const chunk of stream) {
                responseText += chunk;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { role: 'model', text: responseText + '▋' };
                    return newMessages;
                });
            }
            
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { role: 'model', text: responseText };
                return newMessages;
            });

        } catch (error) {
            console.error("Error getting AI response:", error);
            setMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting right now." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-5 flex flex-col h-[calc(100vh-5rem)]">
            <header className="mb-4">
                <h1 className="text-3xl font-semibold text-light-text-primary dark:text-dark-text-primary tracking-display">{t('coach_title')}</h1>
                <p className="text-light-text-secondary dark:text-dark-text-secondary">{t('coach_subtitle')}</p>
            </header>
            
            <div className="flex-1 space-y-4 overflow-y-auto pr-2 pb-4">
                {messages.map((msg, index) => (
                    <ChatBubble key={index} message={msg} />
                ))}
                 {isLoading && messages[messages.length-1].role === 'user' && (
                    <div className="flex justify-start">
                        <div className="max-w-md lg:max-w-lg px-4 py-3 rounded-radius-lg shadow-elevation-md bg-light-card dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary rounded-bl-none">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-accent rounded-full animate-dot-bounce [animation-delay:-0.24s]"></div>
                                <div className="w-2 h-2 bg-accent rounded-full animate-dot-bounce [animation-delay:-0.12s]"></div>
                                <div className="w-2 h-2 bg-accent rounded-full animate-dot-bounce"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            <div className="mt-auto pt-4 border-t border-light-border dark:border-dark-border">
                <div className="flex items-center gap-2">
                    <AppTextField
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={t('coach_placeholder')}
                        className="shadow-elevation-md"
                        disabled={isLoading}
                    />
                    <Button
                        onClick={handleSend}
                        disabled={isLoading || input.trim() === ''}
                        shape="circle"
                        iconOnly
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                          <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                        </svg>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CoachScreen;