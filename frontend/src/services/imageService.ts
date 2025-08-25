export const getImageUrl = (filename: string | undefined | null): string => {
    if (!filename) return '/placeholder-avatar.png';

    // Si c'est une URL complète
    if (filename.startsWith('http')) return filename;

    // URL relative vers le backend
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
    return `${API_BASE_URL.replace('/api', '')}/uploads/${filename}`;
};

// Fonction utilitaire pour gérer les erreurs d'image
export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '/placeholder-avatar.png';
};