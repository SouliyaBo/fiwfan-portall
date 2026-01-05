
import { useEffect, useRef } from 'react';

interface TelegramUser {
    id: number;
    first_name: string;
    username: string;
    photo_url: string;
    auth_date: number;
    hash: string;
}

interface TelegramLoginButtonProps {
    botName: string;
    onAuth: (user: TelegramUser) => void;
    buttonSize?: 'large' | 'medium' | 'small';
    cornerRadius?: number;
    requestAccess?: 'write';
    usePic?: boolean;
}

export default function TelegramLoginButton({
    botName,
    onAuth, // kept for prop compatibility but unused in redirect mode
    buttonSize = 'large',
    cornerRadius = 20,
    requestAccess = 'write',
    usePic = true
}: TelegramLoginButtonProps) {
    const buttonRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Create script element
        const script = document.createElement('script');
        script.src = 'https://telegram.org/js/telegram-widget.js?22';
        script.setAttribute('data-telegram-login', botName);
        script.setAttribute('data-size', buttonSize);
        if (cornerRadius) script.setAttribute('data-radius', cornerRadius.toString());
        if (requestAccess) script.setAttribute('data-request-access', requestAccess);
        script.setAttribute('data-userpic', usePic.toString());

        // Use REDIRECT method instead of callback
        // This will redirect to current_page?id=...&hash=...
        script.setAttribute('data-auth-url', window.location.href);

        script.async = true;

        // Append script to container
        if (buttonRef.current) {
            buttonRef.current.innerHTML = '';
            buttonRef.current.appendChild(script);
        }
    }, [botName, buttonSize, cornerRadius, requestAccess, usePic]);

    return <div ref={buttonRef} className="flex justify-center" />;
}
