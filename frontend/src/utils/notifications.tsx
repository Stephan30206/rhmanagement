// src/utils/notifications.ts
export const showBrowserNotification = (title: string, body: string) => {
    if ('Notification' in window) {
        if (Notification.permission === 'granted') {
            new Notification(title, {
                body,
                icon: '/favicon.ico' // Optionnel: ajoutez une icône
            });
        } else if (Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification(title, {
                        body,
                        icon: '/favicon.ico'
                    });
                }
            });
        }
    }
};

// Fonction pour vérifier si les notifications sont supportées
export const areNotificationsSupported = (): boolean => {
    return 'Notification' in window;
};

// Fonction pour obtenir l'état de permission
export const getNotificationPermission = (): string => {
    return Notification.permission;
};