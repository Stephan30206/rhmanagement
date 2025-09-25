import type { AxiosResponse } from "axios";
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
export type EmployeStatut = 'ACTIF' | 'INACTIF' | 'EN_CONGE';
// Add to api.ts
export interface AffectationPastorale {
    id: number;
    pasteur?: Employe;
    egliseLocale: string;
    district: string;
    dateDebut: string;
    dateFin?: string;
    fonction: string;
    statut: 'ACTIVE' | 'TERMINEE' | 'PROVISOIRE';
    lettreAffectation?: string;
    observations?: string;
    dateCreation?: string;
    dateMiseAJour?: string;
}

export interface Employe {
    postePersonnalise: string;
    nouveauPoste: string;
    soldeConges?: number;
    numeroCNAPS: string;
    nombreEnfants: number;
    dateNaissanceConjoint: string;
    nomConjoint: string;
    id: number;
    matricule: string;
    nom: string;
    prenom: string;
    dateNaissance: string;
    lieuNaissance?: string;
    nationalite: string;
    cin?: string;
    adresse?: string;
    telephone?: string;
    email?: string;
    photoProfil?: string;
    statutMatrimonial: string;
    dateMariage?: string;
    contactUrgenceNom?: string;
    contactUrgenceLien?: string;
    contactUrgenceTelephone?: string;
    nomPere?: string;
    nomMere?: string;
    poste: string;
    organisationEmployeur?: string;
    typeContrat: string;
    dateDebut?: string;
    dateFin?: string;
    salaireBase?: number;
    pourcentageSalaire?: number;
    statut: EmployeStatut;
    dateAccreditation?: string;
    niveauAccreditation?: string;
    groupeAccreditation?: string;
    superviseurHierarchique?: string;
    affectationActuelle?: string;
}


export interface DemandeConge {
    id: number;
    employeId: number;
    typeConge: string;
    dateDebut: string;
    dateFin: string;
    joursDemandes?: number;
    motif?: string;
    statut: 'EN_ATTENTE' | 'APPROUVE' | 'REJETE' | 'ANNULE';
    approuvePar?: number;
    dateTraitement?: string;
    motifRejet?: string;
    employe?: Employe;
}

// Interfaces pour les absences
export interface TypeAbsence {
    id: number;
    code: string;
    nom: string;
    estPaye: boolean;
    necessiteJustificatif: boolean;
    plafondAnnuel?: number;
    couleur: string;
    description?: string;
}

export interface Absence {
    id: number;
    employeId: number;
    typeAbsenceId: number;
    dateAbsence: string;
    duree: 'JOURNEE' | 'MATIN' | 'APRES_MIDI';
    motif?: string;
    statut: 'EN_ATTENTE' | 'VALIDE' | 'REJETE' | 'ANNULE';
    justificatif?: string;
    dateCreation: string;
    dateModification?: string;
    annee: number;
    employe?: Employe;
    typeAbsence?: TypeAbsence;
}

// Interfaces supplémentaires
export interface Enfant {
    id?: number;
    nom: string;
    dateNaissance: string;
}

export interface Diplome {
    id?: number;
    typeDiplome: string;
    intitule: string;
    ecole: string;
    anneeObtention: string;
}

export interface Competence {
    id?: number;
    nom: string;
    niveau: 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE' | 'EXPERT';
    categorie: string;
    dateAcquisition?: string;
    employeId?: number;
}

export interface Formation {
    id?: number;
    intitule: string;
    organisme: string;
    dateDebut: string;
    dateFin?: string;
    dureeHeures?: number;
    certificat?: string;
    employeId?: number;
}

export interface HistoriquePoste {
    id?: number;
    poste: string;
    organisation: string;
    dateDebut: string;
    dateFin?: string;
    salairePleinTemps?: number;
    pourcentageSalaire?: number;
    salaireBase100?: number;
    employeId?: number;
}

export interface Document {
    id?: number;
    nom: string;
    typeDocument: string;
    description?: string;
    cheminFichier: string;
    dateUpload: string;
    employeId?: number;
}

export interface RegisterData {
    nomUtilisateur: string;
    motDePasse: string;
    email: string;
    nom: string;
    prenom: string;
    telephone: string;
    poste: string;
    role?: string;
    adresse?: string;
    dateNaissance?: string;
    genre?: string;
    statut?: string;
    dateInscription?: string;
    actif?: boolean;
}

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('🔐 Token ajouté aux headers');
        } else {
            console.warn('⚠️ Aucun token disponible pour la requête');
        }
        return config;
    },
    (error) => {
        console.error('❌ Erreur intercepteur request:', error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        console.log('✅ Réponse réussie:', response.config.url);
        return response;
    },
    async (error) => {
        console.error('❌ Erreur intercepteur response:', error.config?.url, error.response?.status);

        if (error.response?.status === 401) {
            console.log('🔐 Déconnexion automatique suite à une erreur 401');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
        } else if (error.response?.status === 400) {
            console.log('⚠️ Erreur 400 - Requête mal formée:', error.response.data);
        }

        return Promise.reject(error);
    }
);

// Service pour les employés
export const employeService = {
    uploadPhoto: async (id: number, file: File): Promise<Employe> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post(`/employes/${id}/photo`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    deletePhoto: async (id: number): Promise<Employe> => {
        const response = await api.delete(`/employes/${id}/photo`);
        return response.data;
    },

    getAllEmployes: async (): Promise<Employe[]> => {
        const response = await api.get('/employes');
        return response.data;
    },

    getEmployeById: async (id: number): Promise<Employe> => {
        const response = await api.get(`/employes/${id}`);
        return response.data;
    },

    createEmploye: async (employe: Partial<Employe>): Promise<Employe> => {
        const response = await api.post('/employes', employe);
        return response.data;
    },

    updateEmploye: async (id: number, employe: Partial<Employe>): Promise<Employe> => {
        const response = await api.put(`/employes/${id}`, employe);
        return response.data;
    },

    deleteEmploye: async (id: number): Promise<void> => {
        await api.delete(`/employes/${id}`);
    },

    searchEmployes: (term: string) => api.get(`/employes/search?query=${encodeURIComponent(term)}`),

    getEnfants: async (employeId: number): Promise<Enfant[]> => {
        const response = await api.get(`/employes/${employeId}/enfants`);
        return response.data;
    },

    saveEnfant: async (employeId: number, enfant: Enfant): Promise<Enfant> => {
        const response = await api.post(`/employes/${employeId}/enfants`, enfant);
        return response.data;
    },

    deleteEnfant: async (employeId: number, enfantId: number): Promise<void> => {
        await api.delete(`/employes/${employeId}/enfants/${enfantId}`);
    },

    getDiplomes: async (employeId: number): Promise<Diplome[]> => {
        const response = await api.get(`/employes/${employeId}/diplomes`);
        return response.data;
    },

    saveDiplome: async (employeId: number, diplome: Diplome): Promise<Diplome> => {
        const response = await api.post(`/employes/${employeId}/diplomes`, diplome);
        return response.data;
    },

    deleteDiplome: async (employeId: number, diplomeId: number): Promise<void> => {
        await api.delete(`/employes/${employeId}/diplomes/${diplomeId}`);
    },

    getHistorique: async (employeId: number): Promise<HistoriquePoste[]> => {
        const response = await api.get(`/employes/${employeId}/historique`);
        return response.data;
    },

    saveHistorique: async (employeId: number, historique: HistoriquePoste): Promise<HistoriquePoste> => {
        const response = await api.post(`/employes/${employeId}/historique`, historique);
        return response.data;
    },

    updateHistorique: async (employeId: number, historiqueId: number, historique: HistoriquePoste): Promise<HistoriquePoste> => {
        const response = await api.put(`/employes/${employeId}/historique/${historiqueId}`, historique);
        return response.data;
    },

    deleteHistorique: async (employeId: number, historiqueId: number): Promise<void> => {
        await api.delete(`/employes/${employeId}/historique/${historiqueId}`);
    },

    exportEtatService: async (employeId: number): Promise<any> => {
        const response = await api.get(`/employes/${employeId}/etat-service/export`, { responseType: 'blob' });
        return response;
    },

    getCompetences: async (employeId: number): Promise<Competence[]> => {
        const response = await api.get(`/employes/${employeId}/competences`);
        return response.data;
    },

    saveCompetence: async (employeId: number, competence: Competence): Promise<Competence> => {
        const response = await api.post(`/employes/${employeId}/competences`, competence);
        return response.data;
    },

    updateCompetence: async (employeId: number, competenceId: number, competence: Competence): Promise<Competence> => {
        const response = await api.put(`/employes/${employeId}/competences/${competenceId}`, competence);
        return response.data;
    },

    deleteCompetence: async (employeId: number, competenceId: number): Promise<void> => {
        await api.delete(`/employes/${employeId}/competences/${competenceId}`);
    },

    getFormations: async (employeId: number): Promise<Formation[]> => {
        const response = await api.get(`/employes/${employeId}/formations`);
        return response.data;
    },

    saveFormation: async (employeId: number, formation: Formation): Promise<Formation> => {
        const response = await api.post(`/employes/${employeId}/formations`, formation);
        return response.data;
    },

    updateFormation: async (employeId: number, formationId: number, formation: Formation): Promise<Formation> => {
        const response = await api.put(`/employes/${employeId}/formations/${formationId}`, formation);
        return response.data;
    },

    deleteFormation: async (employeId: number, formationId: number): Promise<void> => {
        await api.delete(`/employes/${employeId}/formations/${formationId}`);
    },

    uploadDocument: async (employeId: number, file: File, documentData: any) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('nom', documentData.nom);
        formData.append('typeDocument', documentData.typeDocument);
        if (documentData.description) {
            formData.append('description', documentData.description);
        }
        const response = await api.post(`/employes/${employeId}/documents`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    updateDocument: async (employeId: number, documentId: number, file: File | null, documentData: any) => {
        const formData = new FormData();
        if (file) formData.append('file', file);
        formData.append('nom', documentData.nom);
        formData.append('typeDocument', documentData.typeDocument);
        if (documentData.description) formData.append('description', documentData.description);

        // ✅ Correction : utiliser PUT au lieu de POST
        const response = await api.put(`/employes/${employeId}/documents/${documentId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    getDocuments: async (employeId: number): Promise<Document[]> => {
        const response = await api.get(`/employes/${employeId}/documents`);
        return response.data;
    },

    deleteDocument: async (employeId: number, documentId: number): Promise<void> => {
        await api.delete(`/employes/${employeId}/documents/${documentId}`);
    },

    mettreEmployeActif: async (employeId: number): Promise<Employe> => {
        try {
            const response = await api.put(`/employes/${employeId}/statut`, {
                statut: 'ACTIF'
            });
            return response.data;
        } catch (error) {
            console.error('Erreur mise à jour statut employé:', error);
            throw error;
        }
    },

    updateStatutEmploye: async (employeId: number, nouveauStatut: string) => {
        try {
            const response = await api.put(`/employes/${employeId}/statut`, {
                statut: nouveauStatut
            });
            return response.data;
        } catch (error) {
            console.error('Erreur mise à jour statut employé:', error);
            throw error;
        }
    },

    /**
     * Obtient les employés dont les congés sont terminés
     */
    getEmployesAvecCongesTermines: async () => {
        try {
            const response = await api.get('/employes/conges-termines');
            return response.data;
        } catch (error) {
            console.error('Erreur récupération congés terminés:', error);
            return [];
        }
    },

    getStatistiquesSyncConges: async () => {
        try {
            const response = await api.get('/admin/conges/statistiques-sync');
            return response.data;
        } catch (error) {
            console.error('Erreur récupération statistiques:', error);
            throw error;
        }
    },

    // Méthode pour vérifier les congés terminés
    checkCongesTermines: async () => {
        try {
            const response = await api.get('/admin/conges/check-conges-termines');
            return response.data;
        } catch (error) {
            console.error('Erreur vérification congés terminés:', error);
            throw error;
        }
    },

// Méthode pour mettre à jour le statut d'un employé
    updateStatutFromConge: async (employeId: number) => {
        try {
            const response = await api.put(`/admin/conges/update-statut/${employeId}`);
            return response.data;
        } catch (error) {
            console.error('Erreur mise à jour statut employé:', error);
            throw error;
        }
    },

    // Dans employeService
    synchroniserTousLesStatuts: async (): Promise<any> => {
        try {
            const response = await api.post('/admin/conges/sync-tous-statuts');
            return response.data;
        } catch (error) {
            console.error('Erreur synchronisation statuts:', error);
            throw error;
        }
    },
    // Dans employeService - Remplacer la méthode existante
    exportFicheEmploye: async (employeId: number): Promise<AxiosResponse<Blob>> => {
        return await api.get(`/employes/${employeId}/fiche-pdf`, {
            responseType: 'blob'
        });
    }
};

// Service pour l'authentification

// Service pour l'authentification - VERSION CORRIGÉE
export const authService = {
    login: async (credentials: { nomUtilisateur: string; motDePasse: string }) => {
        const response = await api.post('/auth/login', credentials);

        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }

        return response.data;
    },

    registerWithPhoto: async (formData: FormData): Promise<any> => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/auth/register-with-photo`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    },

    register: async (userData: RegisterData): Promise<any> => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
            return response.data;
        } catch (error: any) {
            console.error('❌ Registration error details:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            throw error.response?.data || error.message;
        }
    },

    getCurrentUser: async (): Promise<any> => {
        try {
            const response = await api.get('/auth/me');
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.reload();
            }
            throw error;
        }
    },

    logout: async () => {
        const response = await api.post('/auth/logout');
        return response.data;
    },

    updateProfile: async (userData: any) => {
        const response = await api.put('/auth/profile', userData);
        return response.data;
    },

    // CORRECTION : Méthode changePassword avec gestion d'erreur améliorée
    changePassword: async (currentPassword: string, newPassword: string) => {
        try {
            console.log('🔐 Tentative de changement de mot de passe...');

            // Essayez d'abord avec PUT sur change-password
            try {
                const response = await api.put('/auth/change-password', {
                    currentPassword,
                    newPassword
                });
                console.log('✅ Mot de passe changé avec succès');
                return response.data;
            } catch (putError: any) {
                // Si PUT échoue, essayez avec POST sur password
                if (putError.response?.status === 404 || putError.response?.status === 405) {
                    console.log('🔄 Tentative avec POST /auth/password');
                    const response = await api.post('/auth/password', {
                        currentPassword,
                        newPassword
                    });
                    console.log('✅ Mot de passe changé avec succès (POST)');
                    return response.data;
                }
                throw putError;
            }
        } catch (error: any) {
            console.error('❌ Erreur changement mot de passe:', error);
            throw error;
        }
    },

    uploadProfilePhoto: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/auth/upload-photo', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    refreshToken: async (token: string) => {
        try {
            const response = await api.post('/auth/refresh', { token });
            return response.data;
        } catch (error) {
            console.error('Refresh token error:', error);
            throw error;
        }
    },

    validateToken: async (token: string) => {
        try {
            const response = await api.post('/auth/validate', { token });
            return response.data;
        } catch (error) {
            console.error('Validate token error:', error);
            throw error;
        }
    },

    checkTokenValidity: (token: string): boolean => {
        if (!token) return false;

        try {
            const parts = token.split('.');
            if (parts.length !== 3) return false;

            const payload = JSON.parse(atob(parts[1]));
            return payload.exp * 1000 > Date.now();
        } catch {
            return false;
        }
    }
};

// Service pour les demandes de congé
export const demandeCongeService = {
    getAllDemandes: async (): Promise<DemandeConge[]> => {
        const response = await api.get('/demandes-conge');
        return response.data;
    },

    getById: async (id: number): Promise<DemandeConge> => {
        const response = await api.get(`/demandes-conge/${id}`);
        return response.data;
    },

    createDemandeConge: async (data: {
        employeId: number;
        typeConge: string;
        dateDebut: string;
        dateFin: string;
        motif: string;
        statut: "EN_ATTENTE" | "APPROUVE" | "REJETE" | "ANNULE"
    }): Promise<DemandeConge> => {
        const response = await api.post('/demandes-conge', data);
        return response.data;
    },

    update: async (id: number, data: Partial<DemandeConge>): Promise<DemandeConge> => {
        const response = await api.put(`/demandes-conge/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/demandes-conge/${id}`);
    },

    getByEmployeId: async (employeId: number): Promise<DemandeConge[]> => {
        const response = await api.get(`/demandes-conge/employe/${employeId}`);
        return response.data;
    },

    approve: async (id: number): Promise<DemandeConge> => {
        const response = await api.put(`/demandes-conge/${id}/approve`);
        return response.data;
    },

    reject: async (id: number, motif: string): Promise<DemandeConge> => {
        const response = await api.put(`/demandes-conge/${id}/reject`, { motifRejet: motif });
        return response.data;
    },

    cancel: async (id: number): Promise<DemandeConge> => {
        const response = await api.put(`/demandes-conge/${id}/cancel`);
        return response.data;
    },

    deleteDemandeConge: async (id: number): Promise<void> => {
        await api.delete(`/demandes-conge/${id}`);
    },

    updateDemandeConge: async (id: number, requestData: {
        employeId: number;
        typeConge: string;
        dateDebut: string;
        dateFin: string;
        motif: string;
        statut: "EN_ATTENTE" | "APPROUVE" | "REJETE" | "ANNULE"
    }): Promise<DemandeConge> => {
        const response = await api.put(`/demandes-conge/${id}`, requestData);
        return response.data;
    },

    getDemandeDetails: async (id: number): Promise<DemandeConge> => {
        const response = await api.get(`/demandes-conge/${id}/details`);
        return response.data;
    },

    getSoldeConge: async (employeId: number): Promise<number> => {
        const response = await api.get(`/demandes-conge/solde/${employeId}`);
        return response.data;
    },

    // Méthodes supplémentaires utiles
    getByStatut: async (statut: DemandeConge['statut']): Promise<DemandeConge[]> => {
        const response = await api.get(`/demandes-conge/statut/${statut}`);
        return response.data;
    },

    getByPeriode: async (dateDebut: string, dateFin: string): Promise<DemandeConge[]> => {
        const response = await api.get(`/demandes-conge/periode?dateDebut=${dateDebut}&dateFin=${dateFin}`);
        return response.data;
    },

    getCongesActifs: async (employeId: number): Promise<DemandeConge[]> => {
        try {
            const aujourdhui = new Date().toISOString().split('T')[0];
            const response = await api.get(`/demandes-conge/employe/${employeId}/actifs?date=${aujourdhui}`);
            return response.data;
        } catch (error) {
            console.error('Erreur récupération congés actifs:', error);
            return [];
        }
    }
};


// Service pour les absences
export const absenceService = {
    getAllAbsences: async (): Promise<Absence[]> => {
        const response = await api.get('/absences');
        return response.data;
    },

    getAbsenceById: async (id: number): Promise<Absence> => {
        const response = await api.get(`/absences/${id}`);
        return response.data;
    },

    createAbsence: async (data: {
        employeId: number;
        typeAbsenceId: number;
        dateAbsence: string;
        duree: 'JOURNEE' | 'MATIN' | 'APRES_MIDI';
        motif?: string;
        justificatif?: string;
    }): Promise<Absence> => {
        const response = await api.post('/absences', data);
        return response.data;
    },

    updateAbsence: async (id: number, data: {
        employeId: number;
        typeAbsenceId: number;
        dateAbsence: string;
        duree: 'JOURNEE' | 'MATIN' | 'APRES_MIDI';
        motif?: string;
        justificatif?: string;
    }): Promise<Absence> => {
        const response = await api.put(`/absences/${id}`, data);
        return response.data;
    },

    deleteAbsence: async (id: number): Promise<void> => {
        await api.delete(`/absences/${id}`);
    },

    getByEmployeId: async (employeId: number): Promise<Absence[]> => {
        const response = await api.get(`/absences/employe/${employeId}`);
        return response.data;
    },

    getByStatut: async (statut: Absence['statut']): Promise<Absence[]> => {
        const response = await api.get(`/absences/statut/${statut}`);
        return response.data;
    },

    validate: async (id: number): Promise<Absence> => {
        const response = await api.put(`/absences/${id}/validate`);
        return response.data;
    },

    reject: async (id: number, motif: string): Promise<Absence> => {
        const response = await api.put(`/absences/${id}/reject`, { motifRejet: motif });
        return response.data;
    },

    cancel: async (id: number): Promise<Absence> => {
        const response = await api.put(`/absences/${id}/cancel`);
        return response.data;
    },

    getStatistics: async (annee: number): Promise<any> => {
        const response = await api.get(`/absences/statistics/${annee}`);
        return response.data;
    }
};

//Service pour les affectations pastorales
// Service pour les affectations pastorales - VERSION CORRIGÉE
export const affectationPastoraleService = {
    // Récupérer toutes les affectations
    getAllAffectations: async (): Promise<AffectationPastorale[]> => {
        const response = await api.get('/affectations-pastorales');
        return response.data;
    },

    // Récupérer les affectations d'un pasteur spécifique
    getAffectationsByPasteur: async (pasteurId: number): Promise<AffectationPastorale[]> => {
        const response = await api.get(`/affectations-pastorales/pasteur/${pasteurId}`);
        return response.data;
    },

    // Créer une nouvelle affectation
    createAffectation: async (affectation: {
        district: string;
        dateDebut: string;
        dateFin: string | null;
        fonction: string;
        statut: string;
        lettreAffectation: string | null;
        observations: string | null;
        pasteur: { id: any }
    }): Promise<AffectationPastorale> => {
        const response = await api.post('/affectations-pastorales', affectation);
        return response.data;
    },

    // Mettre à jour une affectation
    updateAffectation: async (id: number, affectation: {
        district: string;
        dateDebut: string;
        dateFin: string | null;
        fonction: string;
        statut: string;
        lettreAffectation: string | null;
        observations: string | null;
        pasteur: { id: any }
    }): Promise<AffectationPastorale> => {
        const response = await api.put(`/affectations-pastorales/${id}`, affectation);
        return response.data;
    },

    // Supprimer une affectation
    deleteAffectation: async (id: number): Promise<void> => {
        await api.delete(`/affectations-pastorales/${id}`);
    },

    // Récupérer une affectation par ID
    getAffectationById: async (id: number): Promise<AffectationPastorale> => {
        const response = await api.get(`/affectations-pastorales/${id}`);
        return response.data;
    },

    // Récupérer les affectations par statut
    getAffectationsByStatut: async (statut: 'ACTIVE' | 'TERMINEE' | 'PROVISOIRE'): Promise<AffectationPastorale[]> => {
        const response = await api.get(`/affectations-pastorales/statut/${statut}`);
        return response.data;
    },

    // Récupérer les affectations par district
    getAffectationsByDistrict: async (district: string): Promise<AffectationPastorale[]> => {
        const response = await api.get(`/affectations-pastorales/district/${encodeURIComponent(district)}`);
        return response.data;
    }
};

// Service pour les types d'absence
export const typeAbsenceService = {
    getAllTypesAbsence: async (): Promise<TypeAbsence[]> => {
        try {
            const response = await api.get('/types-absence');
            return response.data;
        } catch (error) {
            console.warn('Endpoint /api/types-absence non disponible, utilisation des données mockées');

            // Données mockées en fallback
            return [
                {
                    id: 1,
                    code: 'MALADIE',
                    nom: 'Maladie',
                    estPaye: true,
                    necessiteJustificatif: true,
                    plafondAnnuel: 15,
                    couleur: '#EF4444',
                    description: 'Absence pour raison médicale'
                },
                {
                    id: 2,
                    code: 'CONGE_EXCEPTIONNEL',
                    nom: 'Congé exceptionnel',
                    estPaye: true,
                    necessiteJustificatif: false,
                    plafondAnnuel: 7,
                    couleur: '#3B82F6',
                    description: 'Congé pour événements familiaux exceptionnels'
                },
                {
                    id: 3,
                    code: 'AUTRE',
                    nom: 'Autre motif',
                    estPaye: false,
                    necessiteJustificatif: false,
                    couleur: '#6B7280',
                    description: 'Autres types d\'absence'
                }
            ];
        }
    },

    getTypeAbsenceById: async (id: number): Promise<TypeAbsence> => {
        const response = await api.get(`/types-absence/${id}`); // Enlevez /api/
        return response.data;
    },

    createTypeAbsence: async (typeAbsence: Omit<TypeAbsence, 'id'>): Promise<TypeAbsence> => {
        const response = await api.post('/types-absence', typeAbsence); // Enlevez /api/
        return response.data;
    },

    updateTypeAbsence: async (id: number, typeAbsence: Partial<TypeAbsence>): Promise<TypeAbsence> => {
        const response = await api.put(`/types-absence/${id}`, typeAbsence); // Enlevez /api/
        return response.data;
    },

    deleteTypeAbsence: async (id: number): Promise<void> => {
        await api.delete(`/types-absence/${id}`); // Enlevez /api/
    }
};
// Service pour les utilisateurs
export const userService = {
    uploadPhoto: async (userId: number, file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post(`/api/utilisateurs/${userId}/photo`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Méthode alternative si besoin
    uploadPhotoWithParam: async (userId: number, file: File, paramName: string = 'file') => {
        const formData = new FormData();
        formData.append(paramName, file);

        const response = await api.post(`/api/utilisateurs/${userId}/photo`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getProfile: async (): Promise<any> => {
        const response = await api.get('/utilisateurs/profile');
        return response.data;
    },

    updateProfile: async (userData: any): Promise<any> => {
        const response = await api.put('/utilisateurs/profile', userData);
        return response.data;
    }
};




export default api;