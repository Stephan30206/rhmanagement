// Créez un nouveau fichier tokenMiddleware.ts
export const tokenMiddleware = {
    getToken: (): string | null => {
        return localStorage.getItem('token');
    },

    setToken: (token: string): void => {
        localStorage.setItem('token', token);
    },

    removeToken: (): void => {
        localStorage.removeItem('token');
    },

    isTokenValid: (token: string): boolean => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 > Date.now();
        } catch {
            return false;
        }
    },

    getTokenExpiration: (token: string): number => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000;
        } catch {
            return 0;
        }
    }
};