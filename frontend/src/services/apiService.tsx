// services/apiService.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

interface ApiResponse<T = any> {
    data?: T;
    error?: string;
    status: number;
}

interface RequestOptions extends RequestInit {
    headers?: Record<string, string>;
}

class ApiService {
    protected baseURL: string;

    constructor() {
        this.baseURL = API_BASE_URL;
    }

    protected async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
        const url = `${this.baseURL}${endpoint}`;
        const token = localStorage.getItem('authToken');

        const config: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers,
            },
            credentials: 'include',
            ...options,
        };

        try {
            const response = await fetch(url, config);

            if (response.status === 401) {
                window.location.href = '/login';
                return { status: 401, error: 'Unauthorized' };
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                return {
                    error: errorData.message || `HTTP error! status: ${response.status}`,
                    status: response.status
                };
            }

            if (response.status === 204) {
                return { status: response.status };
            }

            const data = await response.json() as T;
            return { data, status: response.status };
        } catch (error) {
            console.error(`API Error: ${error instanceof Error ? error.message : String(error)}`);
            return {
                error: 'Network error',
                status: 500
            };
        }
    }

    protected async get<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    protected async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    protected async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    protected async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }

    protected async uploadFile<T>(
        endpoint: string,
        file: File,
        additionalData: Record<string, any> = {}
    ): Promise<ApiResponse<T>> {
        const formData = new FormData();
        formData.append('file', file);

        Object.entries(additionalData).forEach(([key, value]) => {
            formData.append(key, value);
        });

        return this.request<T>(endpoint, {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
    }
}

// Interfaces pour les types (à mettre dans src/types/models.ts)
interface Employe {
    id: number;
    matricule: string;
    nom: string;
    prenom: string;
    dateNaissance: string;
    lieuNaissance?: string;
    nationalite?: string;
    cin?: string;
    adresse?: string;
    telephone?: string;
    email?: string;
    statutMatrimonial?: 'CELIBATAIRE' | 'MARIE' | 'DIVORCE' | 'VEUF';
    dateMariage?: string;
    poste: 'PASTEUR_TITULAIRE' | 'PASTEUR_ASSOCIE' | 'EVANGELISTE' | 'ANCIEN' | 'MISSIONNAIRE' | 'ENSEIGNANT' | 'SECRETAIRE_EXECUTIF' | 'TRESORIER' | 'ASSISTANT_RH' | 'AUTRE';
    typeContrat?: 'CDI' | 'CDD' | 'STAGE' | 'BENEVOLAT';
    dateDebut?: string;
    dateFin?: string;
    salaireBase?: number;
    pourcentageSalaire?: number;
    statut: 'ACTIF' | 'INACTIF' | 'EN_CONGE';
    dateAccreditation?: string;
    niveauAccreditation?: 'LOCAL' | 'DISTRICT' | 'FEDERATION' | 'UNION' | 'DIVISION' | 'CONFERENCE_GENERALE';
    groupeAccreditation?: string;
    superviseurHierarchique?: string;
    affectationActuelle?: string;
}

interface Conge {
    id: number;
    employeId: number;
    typeCongeId: number;
    dateDebut: string;
    dateFin: string;
    joursDemandes: number;
    motif?: string;
    statut: 'EN_ATTENTE' | 'APPROUVE' | 'REJETE' | 'ANNULE';
    approuvePar?: number;
    dateTraitement?: string;
    motifRejet?: string;
    employe?: Employe;
    typeConge?: TypeConge;
}

interface TypeConge {
    id: number;
    code: string;
    nom: string;
    joursAlloues: number;
    reportable: boolean;
    exigences?: string;
}

interface Document {
    id: number;
    employeId: number;
    typeDocument: 'CV' | 'DIPLOME' | 'CERTIFICAT' | 'CONTRAT' | 'PHOTO' | 'LETTRE_CREANCE' | 'ORDINATION' | 'ATTESTATION_TRAVAIL' | 'BULLETIN_PAIE' | 'CNI' | 'CNPS' | 'OSTIE' | 'AUTRE';
    nomFichier: string;
    cheminFichier: string;
    dateUpload: string;
    description?: string;
    employe?: Employe;
}

interface LettrePastorale {
    id: number;
    employeId: number;
    typeLettreId: number;
    numeroLettre: string;
    dateEmission: string;
    dateExpiration?: string;
    emetteur: string;
    reference?: string;
    documentPath?: string;
    observations?: string;
    employe?: Employe;
    typeLettre?: TypeLettrePastorale;
}

interface TypeLettrePastorale {
    id: number;
    code: string;
    nom: string;
    niveauAutorite: 'EGLISE_LOCALE' | 'DISTRICT' | 'FEDERATION' | 'UNION' | 'DIVISION';
    validiteAnnees?: number;
}

interface AffectationPastorale {
    id: number;
    pasteurId: number;
    lettreAffectationId?: number;
    egliseLocale: string;
    district: string;
    dateDebut: string;
    dateFin?: string;
    fonction: 'PASTEUR_TITULAIRE' | 'PASTEUR_ASSOCIE' | 'EVANGELISTE' | 'ANCIEN' | 'AUTRE';
    statut: 'ACTIVE' | 'TERMINEE' | 'PROVISOIRE';
    pasteur?: Employe;
    lettreAffectation?: LettrePastorale;
}

interface Formation {
    id: number;
    codeFormation?: string;
    nomFormation: string;
    typeFormation: 'THEOLOGIQUE' | 'MISSIONNAIRE' | 'ADMINISTRATIF' | 'MEDICAL' | 'EDUCATIF';
    niveau: 'CERTIFICAT' | 'DIPLOME' | 'LICENCE' | 'MASTER' | 'DOCTORAT';
    institution: 'FACULTÉ_ADVENTISTE' | 'SEMINAIRE' | 'UNIVERSITE_ADVENTISTE' | 'AUTRE';
    dureeSemaines?: number;
    obligatoirePasteur?: boolean;
    description?: string;
}

interface Utilisateur {
    id: number;
    nomUtilisateur: string;
    email?: string;
    role: 'ADMIN' | 'SECRETAIRE_FEDERAL' | 'RESPONSABLE_DISTRICT' | 'PASTEUR' | 'ASSISTANT_RH';
    employeId?: number;
    actif: boolean;
    dateCreation: string;
    employe?: Employe;
}

interface JournalActivite {
    id: number;
    utilisateurId?: number;
    action: string;
    entite: string;
    entiteId?: number;
    anciennesValeurs?: any;
    nouvellesValeurs?: any;
    adresseIp?: string;
    horodatage: string;
    utilisateur?: Utilisateur;
}

// Implémentation des services
export class EmployeService extends ApiService {
    async getAllEmployes(): Promise<ApiResponse<Employe[]>> {
        return this.get<Employe[]>('/employes');
    }

    async getEmployeById(id: number): Promise<ApiResponse<Employe>> {
        return this.get<Employe>(`/employes/${id}`);
    }

    async getEmployeByMatricule(matricule: string): Promise<ApiResponse<Employe>> {
        return this.get<Employe>(`/employes/matricule/${matricule}`);
    }

    async createEmploye(employe: Omit<Employe, 'id'>): Promise<ApiResponse<Employe>> {
        return this.post<Employe>('/employes', employe);
    }

    async updateEmploye(id: number, employe: Partial<Employe>): Promise<ApiResponse<Employe>> {
        return this.put<Employe>(`/employes/${id}`, employe);
    }

    async deleteEmploye(id: number): Promise<ApiResponse<void>> {
        return this.delete<void>(`/employes/${id}`);
    }

    async searchEmployes(query: string): Promise<ApiResponse<Employe[]>> {
        return this.get<Employe[]>(`/employes/search?query=${encodeURIComponent(query)}`);
    }

    async getEmployesByStatut(statut: Employe['statut']): Promise<ApiResponse<Employe[]>> {
        return this.get<Employe[]>(`/employes/statut/${statut}`);
    }

    async getEmployeCountByStatut(statut: Employe['statut']): Promise<ApiResponse<number>> {
        return this.get<number>(`/employes/count/statut/${statut}`);
    }

    async getPasteurs(): Promise<ApiResponse<Employe[]>> {
        return this.get<Employe[]>('/employes/pasteurs');
    }

    async getEmployeStats(): Promise<ApiResponse<{
        total: number;
        actifs: number;
        inactifs: number;
        enConge: number;
    }>> {
        const [totalRes, actifsRes, inactifsRes, enCongeRes] = await Promise.all([
            this.getAllEmployes(),
            this.getEmployeCountByStatut('ACTIF'),
            this.getEmployeCountByStatut('INACTIF'),
            this.getEmployeCountByStatut('EN_CONGE')
        ]);

        return {
            data: {
                total: totalRes.data?.length || 0,
                actifs: actifsRes.data || 0,
                inactifs: inactifsRes.data || 0,
                enConge: enCongeRes.data || 0
            },
            status: 200
        };
    }
}

export class CongeService extends ApiService {
    async getAllConges(): Promise<ApiResponse<Conge[]>> {
        return this.get<Conge[]>('/conges');
    }

    async getCongeById(id: number): Promise<ApiResponse<Conge>> {
        return this.get<Conge>(`/conges/${id}`);
    }

    async createConge(conge: Omit<Conge, 'id' | 'joursDemandes'>): Promise<ApiResponse<Conge>> {
        return this.post<Conge>('/conges', conge);
    }

    async updateConge(id: number, conge: Partial<Conge>): Promise<ApiResponse<Conge>> {
        return this.put<Conge>(`/conges/${id}`, conge);
    }

    async deleteConge(id: number): Promise<ApiResponse<void>> {
        return this.delete<void>(`/conges/${id}`);
    }

    async approuverConge(id: number): Promise<ApiResponse<Conge>> {
        return this.put<Conge>(`/conges/${id}/approuver`, {});
    }

    async rejeterConge(id: number, motif: string): Promise<ApiResponse<Conge>> {
        return this.put<Conge>(`/conges/${id}/rejeter`, { motif });
    }

    async getCongesByEmploye(employeId: number): Promise<ApiResponse<Conge[]>> {
        return this.get<Conge[]>(`/conges/employe/${employeId}`);
    }

    async getCongesByStatut(statut: Conge['statut']): Promise<ApiResponse<Conge[]>> {
        return this.get<Conge[]>(`/conges/statut/${statut}`);
    }
}

export class DocumentService extends ApiService {
    async getAllDocuments(): Promise<ApiResponse<Document[]>> {
        return this.get<Document[]>('/documents');
    }

    async getDocumentById(id: number): Promise<ApiResponse<Document>> {
        return this.get<Document>(`/documents/${id}`);
    }

    async uploadDocument(
        file: File,
        employeId: number,
        typeDocument: Document['typeDocument'],
        description?: string
    ): Promise<ApiResponse<Document>> {
        return this.uploadFile<Document>(
            '/documents',
            file,
            { employeId, typeDocument, description }
        );
    }

    async deleteDocument(id: number): Promise<ApiResponse<void>> {
        return this.delete<void>(`/documents/${id}`);
    }

    async getDocumentsByEmploye(employeId: number): Promise<ApiResponse<Document[]>> {
        return this.get<Document[]>(`/documents/employe/${employeId}`);
    }

    async getDocumentsByType(type: Document['typeDocument']): Promise<ApiResponse<Document[]>> {
        return this.get<Document[]>(`/documents/type/${type}`);
    }

    async downloadDocument(id: number): Promise<ApiResponse<Blob>> {
        const response = await fetch(`${this.baseURL}/documents/${id}/download`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (!response.ok) {
            return { error: 'Erreur lors du téléchargement', status: response.status };
        }

        const blob = await response.blob();
        return { data: blob, status: response.status };
    }
}

export class LettrePastoraleService extends ApiService {
    async getAllLettres(): Promise<ApiResponse<LettrePastorale[]>> {
        return this.get<LettrePastorale[]>('/lettres-pastorales');
    }

    async getLettreById(id: number): Promise<ApiResponse<LettrePastorale>> {
        return this.get<LettrePastorale>(`/lettres-pastorales/${id}`);
    }

    async createLettre(lettre: Omit<LettrePastorale, 'id'>): Promise<ApiResponse<LettrePastorale>> {
        return this.post<LettrePastorale>('/lettres-pastorales', lettre);
    }

    async updateLettre(id: number, lettre: Partial<LettrePastorale>): Promise<ApiResponse<LettrePastorale>> {
        return this.put<LettrePastorale>(`/lettres-pastorales/${id}`, lettre);
    }

    async deleteLettre(id: number): Promise<ApiResponse<void>> {
        return this.delete<void>(`/lettres-pastorales/${id}`);
    }

    async getLettresByEmploye(employeId: number): Promise<ApiResponse<LettrePastorale[]>> {
        return this.get<LettrePastorale[]>(`/lettres-pastorales/employe/${employeId}`);
    }

    async getTypesLettres(): Promise<ApiResponse<TypeLettrePastorale[]>> {
        return this.get<TypeLettrePastorale[]>('/types-lettres-pastorales');
    }
}

export class AffectationService extends ApiService {
    async getAllAffectations(): Promise<ApiResponse<AffectationPastorale[]>> {
        return this.get<AffectationPastorale[]>('/affectations-pastorales');
    }

    async getAffectationById(id: number): Promise<ApiResponse<AffectationPastorale>> {
        return this.get<AffectationPastorale>(`/affectations-pastorales/${id}`);
    }

    async createAffectation(affectation: Omit<AffectationPastorale, 'id'>): Promise<ApiResponse<AffectationPastorale>> {
        return this.post<AffectationPastorale>('/affectations-pastorales', affectation);
    }

    async updateAffectation(id: number, affectation: Partial<AffectationPastorale>): Promise<ApiResponse<AffectationPastorale>> {
        return this.put<AffectationPastorale>(`/affectations-pastorales/${id}`, affectation);
    }

    async deleteAffectation(id: number): Promise<ApiResponse<void>> {
        return this.delete<void>(`/affectations-pastorales/${id}`);
    }

    async getAffectationsByPasteur(pasteurId: number): Promise<ApiResponse<AffectationPastorale[]>> {
        return this.get<AffectationPastorale[]>(`/affectations-pastorales/pasteur/${pasteurId}`);
    }

    async getAffectationsActives(): Promise<ApiResponse<AffectationPastorale[]>> {
        return this.get<AffectationPastorale[]>('/affectations-pastorales/actives');
    }
}

export class FormationService extends ApiService {
    async getAllFormations(): Promise<ApiResponse<Formation[]>> {
        return this.get<Formation[]>('/formations');
    }

    async getFormationById(id: number): Promise<ApiResponse<Formation>> {
        return this.get<Formation>(`/formations/${id}`);
    }

    async createFormation(formation: Omit<Formation, 'id'>): Promise<ApiResponse<Formation>> {
        return this.post<Formation>('/formations', formation);
    }

    async updateFormation(id: number, formation: Partial<Formation>): Promise<ApiResponse<Formation>> {
        return this.put<Formation>(`/formations/${id}`, formation);
    }

    async deleteFormation(id: number): Promise<ApiResponse<void>> {
        return this.delete<void>(`/formations/${id}`);
    }

    async getFormationsByType(type: Formation['typeFormation']): Promise<ApiResponse<Formation[]>> {
        return this.get<Formation[]>(`/formations/type/${type}`);
    }

    async getFormationsObligatoires(): Promise<ApiResponse<Formation[]>> {
        return this.get<Formation[]>('/formations/obligatoires');
    }
}

export class UtilisateurService extends ApiService {
    async login(nomUtilisateur: string, motDePasse: string): Promise<ApiResponse<{ token: string }>> {
        return this.post<{ token: string }>('/auth/login', { nomUtilisateur, motDePasse });
    }

    async logout(): Promise<ApiResponse<void>> {
        return this.post<void>('/auth/logout', {});
    }

    async getProfile(): Promise<ApiResponse<Utilisateur>> {
        return this.get<Utilisateur>('/auth/profile');
    }

    async getAllUtilisateurs(): Promise<ApiResponse<Utilisateur[]>> {
        return this.get<Utilisateur[]>('/utilisateurs');
    }

    async createUtilisateur(utilisateur: Omit<Utilisateur, 'id' | 'dateCreation'>): Promise<ApiResponse<Utilisateur>> {
        return this.post<Utilisateur>('/utilisateurs', utilisateur);
    }

    async updateUtilisateur(id: number, utilisateur: Partial<Utilisateur>): Promise<ApiResponse<Utilisateur>> {
        return this.put<Utilisateur>(`/utilisateurs/${id}`, utilisateur);
    }

    async deleteUtilisateur(id: number): Promise<ApiResponse<void>> {
        return this.delete<void>(`/utilisateurs/${id}`);
    }

    async changerMotDePasse(
        id: number,
        ancienMotDePasse: string,
        nouveauMotDePasse: string
    ): Promise<ApiResponse<void>> {
        return this.put<void>(`/utilisateurs/${id}/mot-de-passe`, {
            ancienMotDePasse,
            nouveauMotDePasse
        });
    }
}

export class JournalService extends ApiService {
    async getJournaux(page = 0, size = 50): Promise<ApiResponse<JournalActivite[]>> {
        return this.get<JournalActivite[]>(`/journaux?page=${page}&size=${size}`);
    }

    async getJournauxByUtilisateur(utilisateurId: number, page = 0, size = 50): Promise<ApiResponse<JournalActivite[]>> {
        return this.get<JournalActivite[]>(`/journaux/utilisateur/${utilisateurId}?page=${page}&size=${size}`);
    }

    async getJournauxByEntite(entite: string, entiteId: number): Promise<ApiResponse<JournalActivite[]>> {
        return this.get<JournalActivite[]>(`/journaux/entite/${entite}/${entiteId}`);
    }
}

// Instances exportées des services
export const employeService = new EmployeService();
export const congeService = new CongeService();
export const documentService = new DocumentService();
export const lettrePastoraleService = new LettrePastoraleService();
export const affectationService = new AffectationService();
export const formationService = new FormationService();
export const utilisateurService = new UtilisateurService();
export const journalService = new JournalService();

// Export par défaut pour une utilisation facile
const api = {
    employeService,
    congeService,
    documentService,
    lettrePastoraleService,
    affectationService,
    formationService,
    utilisateurService,
    journalService
};

export default api;