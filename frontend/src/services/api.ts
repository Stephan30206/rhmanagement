import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

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
    statut: 'ACTIF' | 'INACTIF' | 'EN_CONGE';
    dateAccreditation?: string;
    niveauAccreditation?: string;
    groupeAccreditation?: string;
    superviseurHierarchique?: string;
    affectationActuelle?: string;
}

export interface TypeConge {
    description: string;
    id: number;
    code: string;
    nom: string;
    joursAlloues: number;
    reportable: boolean;
    exigences?: string;
}

export interface DemandeConge {
    id: number;
    employeId: number;
    typeCongeId: number;
    dateDebut: string;
    dateFin: string;
    joursDemandes?: number;
    motif?: string;
    statut: 'EN_ATTENTE' | 'APPROUVE' | 'REJETE' | 'ANNULE';
    approuvePar?: number;
    dateTraitement?: string;
    motifRejet?: string;
    employe?: Employe;
    typeConge?: TypeConge;
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
    nom_utilisateur: string;
    mot_de_passe: string;
    email: string;
    nom: string;
    prenom: string;
    telephone: string;
    poste: string;
    role?: string;
}

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Intercepteur pour le débogage
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

// Service pour les employés
export const employeService = {
    uploadPhoto: async (id: number, file: File): Promise<Employe> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post(`/employes/${id}/photo`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
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

    searchEmployes: async (searchTerm: string): Promise<Employe[]> => {
        const response = await api.get(`/employes/search?term=${encodeURIComponent(searchTerm)}`);
        return response.data;
    },

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
        const response = await api.get(`/employes/${employeId}/etat-service/export`, {
            responseType: 'blob'
        });
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

    uploadDocument: async (employeId: number, file: File, documentData: any): Promise<Document> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('nom', documentData.nom);
        formData.append('typeDocument', documentData.typeDocument);

        if (documentData.description) {
            formData.append('description', documentData.description);
        }

        const response = await api.post(`/employes/${employeId}/documents`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getDocuments: async (employeId: number): Promise<Document[]> => {
        const response = await api.get(`/employes/${employeId}/documents`);
        return response.data;
    },

    deleteDocument: async (employeId: number, documentId: number): Promise<void> => {
        await api.delete(`/employes/${employeId}/documents/${documentId}`);
    }
};

// Service pour l'authentification
export const authService = {
    login: async (credentials: { nomUtilisateur: string; motDePasse: string }) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        } catch (error: any) {
            console.error('Erreur de login détaillée:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });

            const errorMessage = error.response?.data?.error ||
                error.response?.data?.message ||
                'Erreur de connexion';

            throw new Error(errorMessage);
        }
    },

    register: async (userData: RegisterData) => {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            throw new Error('Erreur lors de l\'inscription');
        }

        return response.json();
    },

    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    logout: async () => {
        await api.post('/auth/logout');
    },

    getProfile: async (): Promise<any> => {
        const response = await api.get('/auth/profile');
        return response.data;
    },

    updateProfile: async (userData: any): Promise<any> => {
        const response = await api.put('/auth/profile', userData);
        return response.data;
    },

    changePassword: async (currentPassword: string, newPassword: string): Promise<any> => {
        const response = await api.put('/auth/change-password', {
            currentPassword,
            newPassword
        });
        return response.data;
    },

    uploadProfilePhoto: async (file: File): Promise<any> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/auth/upload-photo', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
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

    createDemandeConge: async (data: Partial<DemandeConge>): Promise<DemandeConge> => {
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
        typeCongeId: number;
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

    // Méthodes supplémentaires utiles
    getByStatut: async (statut: DemandeConge['statut']): Promise<DemandeConge[]> => {
        const response = await api.get(`/demandes-conge/statut/${statut}`);
        return response.data;
    },

    getByPeriode: async (dateDebut: string, dateFin: string): Promise<DemandeConge[]> => {
        const response = await api.get(`/demandes-conge/periode?dateDebut=${dateDebut}&dateFin=${dateFin}`);
        return response.data;
    },

    getSoldeConge: async (employeId: number, typeCongeId: number): Promise<number> => {
        const response = await api.get(`/demandes-conge/solde/${employeId}/${typeCongeId}`);
        return response.data;
    }
};

// Service pour les types de congé
export const typeCongeService = {
    getAllTypesConge: async (): Promise<TypeConge[]> => {
        const response = await api.get('/types-conge');
        return response.data;
    },

    getTypeCongeById: async (id: number): Promise<TypeConge> => {
        const response = await api.get(`/types-conge/${id}`);
        return response.data;
    },

    createTypeConge: async (typeConge: Omit<TypeConge, 'id'>): Promise<TypeConge> => {
        const response = await api.post('/types-conge', typeConge);
        return response.data;
    },

    updateTypeConge: async (id: number, typeConge: Partial<TypeConge>): Promise<TypeConge> => {
        const response = await api.put(`/types-conge/${id}`, typeConge);
        return response.data;
    },

    deleteTypeConge: async (id: number): Promise<void> => {
        await api.delete(`/types-conge/${id}`);
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
    uploadPhoto: async (userId: number, file: File): Promise<any> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post(`/utilisateurs/${userId}/photo`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    uploadPhotoWithParam: async (userId: number, file: File, paramName: string): Promise<any> => {
        const formData = new FormData();
        formData.append(paramName, file);

        const response = await api.post(`/utilisateurs/${userId}/photo`, formData, {
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