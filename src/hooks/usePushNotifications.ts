import { useCallback, useEffect } from 'react';
import { getVapidPublicKey, subscribeToPush } from '../api';

const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};

export const usePushNotifications = (token: string | null, isLoggedIn: boolean) => {
    const subscribeToPushNotifications = useCallback(async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.warn('Push notifications not supported.');
            return;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            let subscription = await registration.pushManager.getSubscription();

            if (!subscription) {
                const vapidPublicKey = await getVapidPublicKey();
                const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: convertedVapidKey,
                });
            }

            if (token) {
                await subscribeToPush(subscription);
            }

            console.log('Push subscription successful:', subscription);
        } catch (error) {
            console.error('Push subscription failed:', error);
        }
    }, [token]);

    useEffect(() => {
        if (isLoggedIn) {
            subscribeToPushNotifications();
        }
    }, [isLoggedIn, subscribeToPushNotifications]);
};
