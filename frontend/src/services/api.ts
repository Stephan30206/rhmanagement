import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

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

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

// @ts-ignore
export const employeService = {
    uploadPhoto: async (id: number, file: File): Promise<Employe> => {
        const formData = new FormData();
        formData.append('file', file);

        console.log('Envoi photo, ID:', id, 'Fichier:', file.name, 'Taille:', file.size);

        const response = await api.post(`/employes/${id}/photo`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Fonction pour supprimer la photo
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

    createEmploye: async (employe: {
        matricule: string;
        nom: string;
        prenom: string;
        dateNaissance: string;
        lieuNaissance: string;
        nationalite: string;
        cin: string;
        adresse: string;
        telephone: string;
        email: string;
        photoProfil: string;
        statutMatrimonial: string;
        dateMariage: null;
        contactUrgenceNom: string;
        contactUrgenceLien: string;
        contactUrgenceTelephone: string;
        nomPere: string;
        nomMere: string;
        poste: string;
        organisationEmployeur: string;
        typeContrat: string;
        dateDebut: null;
        dateFin: null;
        salaireBase: number;
        pourcentageSalaire: number;
        statut: string;
        dateAccreditation: null;
        niveauAccreditation: string;
        groupeAccreditation: string;
        superviseurHierarchique: string;
        affectationActuelle: string
    }): Promise<Employe> => {
        const response = await api.post('/employes', employe);
        return response.data;
    },

    updateEmploye: async (id: number, employe: {
        matricule: string;
        nom: string;
        prenom: string;
        dateNaissance: string;
        lieuNaissance: string;
        nationalite: string;
        cin: string;
        adresse: string;
        telephone: string;
        email: string;
        photoProfil: string;
        statutMatrimonial: string;
        dateMariage: null;
        contactUrgenceNom: string;
        contactUrgenceLien: string;
        contactUrgenceTelephone: string;
        nomPere: string;
        nomMere: string;
        poste: string;
        organisationEmployeur: string;
        typeContrat: string;
        dateDebut: null;
        dateFin: null;
        salaireBase: number;
        pourcentageSalaire: number;
        statut: string;
        dateAccreditation: null;
        niveauAccreditation: string;
        groupeAccreditation: string;
        superviseurHierarchique: string;
        affectationActuelle: string
    }): Promise<Employe> => {
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

    // Nouvelles méthodes pour la gestion des enfants
    // Correction pour les méthodes enfants
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

    // Correction pour les méthodes diplômes
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

    // Méthodes pour l'historique professionnel
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

// Méthode pour l'export de l'état de service
    exportEtatService: async (employeId: number): Promise<any> => {
        const response = await api.get(`/employes/${employeId}/etat-service/export`, {
            responseType: 'blob'
        });
        return response;
    },

    // Méthodes pour les compétences
    getCompetences: async (employeId: number): Promise<any[]> => {
        const response = await api.get(`/employes/${employeId}/competences`);
        return response.data;
    },

    saveCompetence: async (employeId: number, competence: any): Promise<any> => {
        const response = await api.post(`/employes/${employeId}/competences`, competence);
        return response.data;
    },

    updateCompetence: async (employeId: number, competenceId: number, competence: any): Promise<any> => {
        const response = await api.put(`/employes/${employeId}/competences/${competenceId}`, competence);
        return response.data;
    },

    deleteCompetence: async (employeId: number, competenceId: number): Promise<void> => {
        await api.delete(`/employes/${employeId}/competences/${competenceId}`);
    },

    // Méthodes pour les formations
    getFormations: async (employeId: number): Promise<any[]> => {
        const response = await api.get(`/employes/${employeId}/formations`);
        return response.data;
    },

    saveFormation: async (employeId: number, formation: any): Promise<any> => {
        const response = await api.post(`/employes/${employeId}/formations`, formation);
        return response.data;
    },

    updateFormation: async (employeId: number, formationId: number, formation: any): Promise<any> => {
        const response = await api.put(`/employes/${employeId}/formations/${formationId}`, formation);
        return response.data;
    },
    deleteFormation: async (employeId: number, formationId: number): Promise<void> => {
        await api.delete(`/employes/${employeId}/formations/${formationId}`);
    },

    // Méthodes pour les documents
    uploadDocument: async (employeId: number, file: File, documentData: any): Promise<any> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('nom', documentData.nom);
        formData.append('typeDocument', documentData.typeDocument);

        // Ajouter description seulement si elle existe
        if (documentData.description) {
            formData.append('description', documentData.description);
        }

        console.log('Envoi des données:', {
            employeId,
            nom: documentData.nom,
            typeDocument: documentData.typeDocument,
            description: documentData.description,
            fileName: file.name,
            fileSize: file.size
        });

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

export const userService = {
    // Méthode d'upload de photo
    // Ajoutez cette fonction dans userService
    uploadPhotoWithParam: async (userId: number, file: File, paramName: string) => {
        const formData = new FormData();
        formData.append(paramName, file);

        const response = await api.post(`/utilisateurs/${userId}/photo`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Autres méthodes utilisateur

    // Vaovao
    uploadPhoto: async (userId: number, file: File): Promise<any> => {
        const formData = new FormData();
        formData.append('file', file); // Le backend attend 'file'

        console.log('Upload photo utilisateur:', {
            userId,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
        });

        try {
            const response = await api.post(`/utilisateurs/${userId}/photo`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error: any) {
            console.error('Erreur upload photo:', error.response?.data);
            throw error;
        }
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

// Dans services/api.ts
export interface RegisterData {
    nom_utilisateur: string;
    mot_de_passe: string;
    email: string;
    nom: string;
    prenom: string;
    telephone: string;
    poste: string;
    role?: string; // Optionnel, peut être défini par défaut côté serveur
}

// Nouveau service d'authentification
export const authService = {
    login: async (credentials: { nom_utilisateur: string; mot_de_passe: string; remember: boolean }) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
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

    updateProfile: async (data: any) => {
        const response = await fetch('/api/utilisateurs/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    changePassword: async (userId: number, newPassword: string) => {
        const response = await fetch(`/api/utilisateurs/${userId}/password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ newPassword })
        });
        return response.json();
    },

    uploadProfilePhoto: async (userId: number, formData: FormData) => {
        const response = await fetch(`/api/utilisateurs/${userId}/photo`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });
        return response.json();
    }
};
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

// CORRECTION : Utilisez demandeCongeService au lieu de DemandeCongeService
export const demandeCongeService = {
    getAllDemandes: async (): Promise<DemandeConge[]> => {
        const response = await api.get('/demandes-conge');
        return response.data;
    },

    getTypesConge: async (): Promise<TypeConge[]> => {
        // CORRECTION : Utilisez l'endpoint correct
        const response = await api.get('/types-conge');
        return response.data;
    },

    createDemandeConge: async (demande: {
        employeId: number;
        typeCongeId: number;
        dateDebut: string;
        dateFin: string;
        motif: string;
        statut: string
    }): Promise<DemandeConge> => {
        const response = await api.post('/demandes-conge', demande);
        return response.data;
    },

    updateDemandeConge: async (id: number, demande: Partial<DemandeConge>): Promise<DemandeConge> => {
        const response = await api.put(`/demandes-conge/${id}`, demande);
        return response.data;
    },

    deleteDemandeConge: async (id: number): Promise<void> => {
        await api.delete(`/demandes-conge/${id}`);
    },
    updateDemandeCongeMotif: async (id: number, motif: string): Promise<DemandeConge> => {
        const response = await api.patch(`/demandes-conge/${id}/motif`, { motif });
        return response.data;
    },

    getDemandesByEmployeId: async (employeId: number): Promise<DemandeConge[]> => {
        const response = await api.get(`/demandes-conge/employe/${employeId}`);
        return response.data;
    }
};
// Interfaces pour les nouvelles entités
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

// CORRECTION : Implémenter correctement le service des types de congé
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


export default api;

