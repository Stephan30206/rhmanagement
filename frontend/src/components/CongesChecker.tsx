import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle, XCircle, RefreshCw, Calendar, AlertTriangle, Users } from 'lucide-react';
import { employeService } from '../services/api';

interface CongesCheckerProps {
    onEmployeUpdate?: () => void;
}

interface CongeNotification {
    id: string;
    type: 'CONGE_TERMINE' | 'CONGE_COMMENCE' | 'STATUT_SYNC' | 'ERROR';
    message: string;
    employeId?: number;
    employeNom?: string;
    timestamp: Date;
    read: boolean;
}

interface StatsSyncConges {
    totalEmployes: number;
    employesEnConge: number;
    congesActifs: number;
    incoherences: number;
    coherencePercent: number;
}

// Interface pour le son de notification
interface NotificationSound {
    play: () => void;
}

const CongesChecker: React.FC<CongesCheckerProps> = ({ onEmployeUpdate }) => {
    const [notifications, setNotifications] = useState<CongeNotification[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);
    const [showStats, setShowStats] = useState(false);
    const intervalRef = useRef<number | null>(null);
    const notificationSoundRef = useRef<NotificationSound | null>(null);

    // Initialisation par défaut pour stats
    const [stats, setStats] = useState<StatsSyncConges>({
        totalEmployes: 0,
        employesEnConge: 0,
        congesActifs: 0,
        incoherences: 0,
        coherencePercent: 100
    });

    // Initialisation du son de notification
    useEffect(() => {
        const createNotificationSound = () => {
            try {
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);

                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);
            } catch (error) {
                console.log('AudioContext non supporté');
            }
        };

        notificationSoundRef.current = { play: createNotificationSound };

        return () => {
            if (intervalRef.current) {
                window.clearInterval(intervalRef.current);
            }
        };
    }, []);

    const addNotification = (
        type: CongeNotification['type'],
        message: string,
        employeId?: number,
        employeNom?: string
    ) => {
        const notification: CongeNotification = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            type,
            message,
            employeId,
            employeNom,
            timestamp: new Date(),
            read: false
        };

        setNotifications(prev => [notification, ...prev.slice(0, 19)]);

        if (notificationSoundRef.current && type !== 'ERROR') {
            try {
                notificationSoundRef.current.play();
            } catch (error) {
                console.log('Impossible de jouer le son de notification');
            }
        }

        if (Notification.permission === 'granted' && type !== 'ERROR') {
            new Notification('Mise à jour des congés', {
                body: message,
                icon: '/favicon.ico'
            });
        }
    };

    // Fonction utilitaire pour valider les statistiques
    const validateStatsData = (data: any): StatsSyncConges | null => {
        if (!data) return null;

        if (typeof data.totalEmployes === 'number') {
            return {
                totalEmployes: data.totalEmployes,
                employesEnConge: data.employesEnConge || 0,
                congesActifs: data.congesActifs || 0,
                incoherences: data.incoherences || 0,
                coherencePercent: data.coherencePercent || 100
            };
        }

        if (data.data && typeof data.data.totalEmployes === 'number') {
            return data.data;
        }

        return null;
    };

    const loadSyncStats = async () => {
        try {
            const response = await employeService.getStatistiquesSyncConges();
            const validatedStats = validateStatsData(response);

            if (validatedStats) {
                setStats(validatedStats);

                if (validatedStats.incoherences > 0) {
                    addNotification(
                        'STATUT_SYNC',
                        `${validatedStats.incoherences} incohérence(s) détectée(s) dans les statuts`
                    );
                }
            } else {
                console.warn('Données de statistiques invalides:', response);
                setStats({
                    totalEmployes: 0,
                    employesEnConge: 0,
                    congesActifs: 0,
                    incoherences: 0,
                    coherencePercent: 100
                });
            }
        } catch (error) {
            console.error('Erreur chargement statistiques:', error);
            setStats({
                totalEmployes: 0,
                employesEnConge: 0,
                congesActifs: 0,
                incoherences: 0,
                coherencePercent: 100
            });
        }
    };

    const checkCongesTermines = async () => {
        if (isChecking) return;

        setIsChecking(true);

        try {
            const employesAReactiver = await employeService.checkCongesTermines();

            if (employesAReactiver && employesAReactiver.length > 0) {
                for (const employe of employesAReactiver) {
                    try {
                        await employeService.updateStatutFromConge(employe.employeId);
                        addNotification(
                            'CONGE_TERMINE',
                            `Congé terminé: ${employe.employeNom} est maintenant ACTIF`,
                            employe.employeId,
                            employe.employeNom
                        );
                    } catch (error) {
                        console.error(`Erreur réactivation employé ${employe.employeNom}:`, error);
                        addNotification(
                            'ERROR',
                            `Erreur lors de la réactivation de ${employe.employeNom}`,
                            employe.employeId,
                            employe.employeNom
                        );
                    }
                }

                if (onEmployeUpdate) {
                    onEmployeUpdate();
                }
            }

            await loadSyncStats();
            setLastCheckTime(new Date());

        } catch (error) {
            console.error('Erreur vérification congés terminés:', error);
            addNotification('ERROR', 'Erreur lors de la vérification des congés');
        } finally {
            setIsChecking(false);
        }
    };

    const synchroniserTousLesStatuts = async () => {
        if (isChecking) return;

        setIsChecking(true);

        try {
            // Utilisez l'instance axios configurée au lieu de fetch
            const response = await employeService.synchroniserTousLesStatuts();

            addNotification('STATUT_SYNC', 'Synchronisation de tous les statuts réussie');

            // Mettre à jour les statistiques
            const validatedStats = validateStatsData(response);
            if (validatedStats) {
                setStats(validatedStats);
            }

            if (onEmployeUpdate) {
                onEmployeUpdate();
            }
        } catch (error) {
            console.error('Erreur synchronisation manuelle:', error);
            addNotification('ERROR', 'Erreur lors de la synchronisation manuelle');
        } finally {
            setIsChecking(false);
        }
    };

    // Vérification automatique toutes les heures
    useEffect(() => {
        const startAutoCheck = () => {
            checkCongesTermines();
            intervalRef.current = window.setInterval(checkCongesTermines, 60 * 60 * 1000);
        };

        startAutoCheck();

        return () => {
            if (intervalRef.current) {
                window.clearInterval(intervalRef.current);
            }
        };
    }, []);

    // Demander la permission de notifications
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const markAsRead = (notificationId: string) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === notificationId ? { ...notif, read: true } : notif
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    };

    const clearNotifications = () => {
        setNotifications([]);
        setShowNotifications(false);
    };

    const getNotificationIcon = (type: CongeNotification['type']) => {
        switch (type) {
            case 'CONGE_TERMINE': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'CONGE_COMMENCE': return <Calendar className="w-4 h-4 text-blue-500" />;
            case 'STATUT_SYNC': return <RefreshCw className="w-4 h-4 text-purple-500" />;
            case 'ERROR': return <XCircle className="w-4 h-4 text-red-500" />;
            default: return <Bell className="w-4 h-4 text-gray-500" />;
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const formatTime = (date: Date) => {
        return date.toLocaleString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit'
        });
    };

    return (
        <div className="relative">
            <div className="flex items-center space-x-2">
                {notifications.length > 0 && (
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 rounded-md hover:bg-gray-100 text-blue-600 transition-colors"
                        title="Notifications de congés"
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center font-bold">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>
                )}

                <button
                    onClick={synchroniserTousLesStatuts}
                    disabled={isChecking}
                    className="p-2 rounded-md hover:bg-gray-100 text-purple-600 transition-colors disabled:opacity-50"
                    title="Synchroniser manuellement tous les statuts"
                >
                    <RefreshCw className={`w-5 h-5 ${isChecking ? 'animate-spin' : ''}`} />
                </button>

                <button
                    onClick={() => setShowStats(!showStats)}
                    className="p-2 rounded-md hover:bg-gray-100 text-indigo-600 transition-colors"
                    title="Statistiques de synchronisation"
                >
                    <Users className="w-5 h-5" />
                </button>
            </div>

            {showNotifications && notifications.length > 0 && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border z-50">
                    <div className="p-4 border-b bg-gray-50 rounded-t-lg">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-semibold text-gray-900">
                                Notifications ({notifications.length})
                            </h3>
                            <div className="flex space-x-2">
                                {unreadCount > 0 && (
                                    <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:text-blue-800">
                                        Marquer tout lu
                                    </button>
                                )}
                                <button onClick={clearNotifications} className="text-gray-400 hover:text-gray-600" title="Effacer toutes les notifications">
                                    <XCircle className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        {lastCheckTime && (
                            <p className="text-xs text-gray-500 mt-1">
                                Dernière vérification: {formatTime(lastCheckTime)}
                            </p>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                                onClick={() => markAsRead(notification.id)}
                            >
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 mt-0.5">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formatTime(notification.timestamp)}
                                        </p>
                                    </div>
                                    {!notification.read && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-3 bg-gray-50 border-t rounded-b-lg">
                        <button
                            onClick={checkCongesTermines}
                            disabled={isChecking}
                            className="w-full text-center text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                            <span>{isChecking ? 'Vérification...' : 'Vérifier maintenant'}</span>
                        </button>
                    </div>
                </div>
            )}

            {showStats && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-50">
                    <div className="p-4 border-b bg-gray-50 rounded-t-lg">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-semibold text-gray-900">Statistiques Sync</h3>
                            <button onClick={() => setShowStats(false)} className="text-gray-400 hover:text-gray-600">
                                <XCircle className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="p-4 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total employés:</span>
                            <span className="font-semibold">{stats.totalEmployes}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">En congé:</span>
                            <span className="font-semibold text-yellow-600">{stats.employesEnConge}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Congés actifs:</span>
                            <span className="font-semibold text-green-600">{stats.congesActifs}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Incohérences:</span>
                            <span className={`font-semibold ${stats.incoherences > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {stats.incoherences}
                            </span>
                        </div>

                        <div className="mt-3 pt-3 border-t">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-600">Cohérence:</span>
                                <span className={`font-semibold ${
                                    stats.coherencePercent >= 98 ? 'text-green-600' :
                                        stats.coherencePercent >= 95 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                    {stats.coherencePercent.toFixed(1)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full ${
                                        stats.coherencePercent >= 98 ? 'bg-green-500' :
                                            stats.coherencePercent >= 95 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${stats.coherencePercent}%` }}
                                ></div>
                            </div>
                        </div>

                        {stats.incoherences > 0 && (
                            <div className="mt-3 p-3 bg-yellow-50 rounded-md">
                                <div className="flex items-center">
                                    <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                                    <span className="text-sm text-yellow-800">Synchronisation recommandée</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CongesChecker;