// constants/index.js

// API Configuration
export const API_CONFIG = {
    BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
    TIMEOUT: 10000,
    MAX_RETRIES: 3,
};

// Statuts des employés
export const STATUT_EMPLOYE = {
    ACTIF: 'ACTIF',
    INACTIF: 'INACTIF',
    EN_CONGE: 'EN_CONGE'
};

// Types de contrats
export const TYPE_CONTRAT = {
    CDI: 'CDI',
    CDD: 'CDD',
    STAGE: 'STAGE',
    BENEVOLAT: 'BENEVOLAT'
};

// Postes disponibles
export const POSTES = {
    PASTEUR_TITULAIRE: 'PASTEUR_TITULAIRE',
    PASTEUR_ASSOCIE: 'PASTEUR_ASSOCIE',
    EVANGELISTE: 'EVANGELISTE',
    ANCIEN: 'ANCIEN',
    MISSIONNAIRE: 'MISSIONNAIRE',
    ENSEIGNANT: 'ENSEIGNANT',
    SECRETAIRE_EXECUTIF: 'SECRETAIRE_EXECUTIF',
    TRESORIER: 'TRESORIER',
    ASSISTANT_RH: 'ASSISTANT_RH',
    AUTRE: 'AUTRE'
};

// Labels des postes pour l'affichage
export const POSTES_LABELS = {
    [POSTES.PASTEUR_TITULAIRE]: 'Pasteur Titulaire',
    [POSTES.PASTEUR_ASSOCIE]: 'Pasteur Associé',
    [POSTES.EVANGELISTE]: 'Évangéliste',
    [POSTES.ANCIEN]: 'Ancien',
    [POSTES.MISSIONNAIRE]: 'Missionnaire',
    [POSTES.ENSEIGNANT]: 'Enseignant',
    [POSTES.SECRETAIRE_EXECUTIF]: 'Secrétaire Exécutif',
    [POSTES.TRESORIER]: 'Trésorier',
    [POSTES.ASSISTANT_RH]: 'Assistant RH',
    [POSTES.AUTRE]: 'Autre'
};

// Statut matrimonial
export const STATUT_MATRIMONIAL = {
    CELIBATAIRE: 'CELIBATAIRE',
    MARIE: 'MARIE',
    DIVORCE: 'DIVORCE',
    VEUF: 'VEUF'
};

// Labels du statut matrimonial
export const STATUT_MATRIMONIAL_LABELS = {
    [STATUT_MATRIMONIAL.CELIBATAIRE]: 'Célibataire',
    [STATUT_MATRIMONIAL.MARIE]: 'Marié(e)',
    [STATUT_MATRIMONIAL.DIVORCE]: 'Divorcé(e)',
    [STATUT_MATRIMONIAL.VEUF]: 'Veuf/Veuve'
};

// Niveaux d'accréditation
export const NIVEAU_ACCREDITATION = {
    LOCAL: 'LOCAL',
    DISTRICT: 'DISTRICT',
    FEDERATION: 'FEDERATION',
    UNION: 'UNION',
    DIVISION: 'DIVISION',
    CONFERENCE_GENERALE: 'CONFERENCE_GENERALE'
};

// Labels des niveaux d'accréditation
export const NIVEAU_ACCREDITATION_LABELS = {
    [NIVEAU_ACCREDITATION.LOCAL]: 'Local',
    [NIVEAU_ACCREDITATION.DISTRICT]: 'District',
    [NIVEAU_ACCREDITATION.FEDERATION]: 'Fédération',
    [NIVEAU_ACCREDITATION.UNION]: 'Union',
    [NIVEAU_ACCREDITATION.DIVISION]: 'Division',
    [NIVEAU_ACCREDITATION.CONFERENCE_GENERALE]: 'Conférence Générale'
};

// Statuts des congés
export const STATUT_CONGE = {
    EN_ATTENTE: 'EN_ATTENTE',
    APPROUVE: 'APPROUVE',
    REJETE: 'REJETE',
    ANNULE: 'ANNULE'
};

// Labels des statuts de congés
export const STATUT_CONGE_LABELS = {
    [STATUT_CONGE.EN_ATTENTE]: 'En attente',
    [STATUT_CONGE.APPROUVE]: 'Approuvé',
    [STATUT_CONGE.REJETE]: 'Rejeté',
    [STATUT_CONGE.ANNULE]: 'Annulé'
};

// Types de congés
export const TYPE_CONGE = {
    CONGE_ANNUEL: 'CONGE_ANNUEL',
    PERMISSION: 'PERMISSION',
    MALADIE: 'MALADIE',
    MATERNITE: 'MATERNITE',
    PATERNITE: 'PATERNITE',
    MISSION: 'MISSION'
};

// Labels des types de congés
export const TYPE_CONGE_LABELS = {
    [TYPE_CONGE.CONGE_ANNUEL]: 'Congé annuel',
    [TYPE_CONGE.PERMISSION]: 'Permission',
    [TYPE_CONGE.MALADIE]: 'Congé maladie',
    [TYPE_CONGE.MATERNITE]: 'Congé maternité',
    [TYPE_CONGE.PATERNITE]: 'Congé paternité',
    [TYPE_CONGE.MISSION]: 'Congé mission'
};

// Types de documents
export const TYPE_DOCUMENT = {
    CV: 'CV',
    DIPLOME: 'DIPLOME',
    CERTIFICAT: 'CERTIFICAT',
    CONTRAT: 'CONTRAT',
    PHOTO: 'PHOTO',
    LETTRE_CREANCE: 'LETTRE_CREANCE',
    ORDINATION: 'ORDINATION',
    ATTESTATION_TRAVAIL: 'ATTESTATION_TRAVAIL',
    BULLETIN_PAIE: 'BULLETIN_PAIE',
    CNI: 'CNI',
    CNPS: 'CNPS',
    OSTIE: 'OSTIE',
    AUTRE: 'AUTRE'
};

// Labels des types de documents
export const TYPE_DOCUMENT_LABELS = {
    [TYPE_DOCUMENT.CV]: 'CV',
    [TYPE_DOCUMENT.DIPLOME]: 'Diplôme',
    [TYPE_DOCUMENT.CERTIFICAT]: 'Certificat',
    [TYPE_DOCUMENT.CONTRAT]: 'Contrat',
    [TYPE_DOCUMENT.PHOTO]: 'Photo d\'identité',
    [TYPE_DOCUMENT.LETTRE_CREANCE]: 'Lettre de créance',
    [TYPE_DOCUMENT.ORDINATION]: 'Ordination',
    [TYPE_DOCUMENT.ATTESTATION_TRAVAIL]: 'Attestation de travail',
    [TYPE_DOCUMENT.BULLETIN_PAIE]: 'Bulletin de paie',
    [TYPE_DOCUMENT.CNI]: 'CNI',
    [TYPE_DOCUMENT.CNPS]: 'CNPS',
    [TYPE_DOCUMENT.OSTIE]: 'OSTIE',
    [TYPE_DOCUMENT.AUTRE]: 'Autre'
};

// Rôles des utilisateurs
export const ROLES = {
    ADMIN: 'ADMIN',
    SECRETAIRE_FEDERAL: 'SECRETAIRE_FEDERAL',
    RESPONSABLE_DISTRICT: 'RESPONSABLE_DISTRICT',
    PASTEUR: 'PASTEUR',
    ASSISTANT_RH: 'ASSISTANT_RH'
};

// Labels des rôles
export const ROLES_LABELS = {
    [ROLES.ADMIN]: 'Administrateur',
    [ROLES.SECRETAIRE_FEDERAL]: 'Secrétaire Fédéral',
    [ROLES.RESPONSABLE_DISTRICT]: 'Responsable District',
    [ROLES.PASTEUR]: 'Pasteur',
    [ROLES.ASSISTANT_RH]: 'Assistant RH'
};

// Types de formations
export const TYPE_FORMATION = {
    THEOLOGIQUE: 'THEOLOGIQUE',
    MISSIONNAIRE: 'MISSIONNAIRE',
    ADMINISTRATIF: 'ADMINISTRATIF',
    MEDICAL: 'MEDICAL',
    EDUCATIF: 'EDUCATIF'
};

// Labels des types de formations
export const TYPE_FORMATION_LABELS = {
    [TYPE_FORMATION.THEOLOGIQUE]: 'Théologique',
    [TYPE_FORMATION.MISSIONNAIRE]: 'Missionnaire',
    [TYPE_FORMATION.ADMINISTRATIF]: 'Administratif',
    [TYPE_FORMATION.MEDICAL]: 'Médical',
    [TYPE_FORMATION.EDUCATIF]: 'Éducatif'
};

// Niveaux de formation
export const NIVEAU_FORMATION = {
    CERTIFICAT: 'CERTIFICAT',
    DIPLOME: 'DIPLOME',
    LICENCE: 'LICENCE',
    MASTER: 'MASTER',
    DOCTORAT: 'DOCTORAT'
};

// Labels des niveaux de formation
export const NIVEAU_FORMATION_LABELS = {
    [NIVEAU_FORMATION.CERTIFICAT]: 'Certificat',
    [NIVEAU_FORMATION.DIPLOME]: 'Diplôme',
    [NIVEAU_FORMATION.LICENCE]: 'Licence',
    [NIVEAU_FORMATION.MASTER]: 'Master',
    [NIVEAU_FORMATION.DOCTORAT]: 'Doctorat'
};

// Institutions de formation
export const INSTITUTION_FORMATION = {
    FACULTE_ADVENTISTE: 'FACULTE_ADVENTISTE',
    SEMINAIRE: 'SEMINAIRE',
    UNIVERSITE_ADVENTISTE: 'UNIVERSITE_ADVENTISTE',
    AUTRE: 'AUTRE'
};

// Labels des institutions
export const INSTITUTION_FORMATION_LABELS = {
    [INSTITUTION_FORMATION.FACULTE_ADVENTISTE]: 'Faculté Adventiste',
    [INSTITUTION_FORMATION.SEMINAIRE]: 'Séminaire',
    [INSTITUTION_FORMATION.UNIVERSITE_ADVENTISTE]: 'Université Adventiste',
    [INSTITUTION_FORMATION.AUTRE]: 'Autre'
};

// Niveaux d'autorité pour les lettres pastorales
export const NIVEAU_AUTORITE = {
    EGLISE_LOCALE: 'EGLISE_LOCALE',
    DISTRICT: 'DISTRICT',
    FEDERATION: 'FEDERATION',
    UNION: 'UNION',
    DIVISION: 'DIVISION'
};

// Labels des niveaux d'autorité
export const NIVEAU_AUTORITE_LABELS = {
    [NIVEAU_AUTORITE.EGLISE_LOCALE]: 'Église Locale',
    [NIVEAU_AUTORITE.DISTRICT]: 'District',
    [NIVEAU_AUTORITE.FEDERATION]: 'Fédération',
    [NIVEAU_AUTORITE.UNION]: 'Union',
    [NIVEAU_AUTORITE.DIVISION]: 'Division'
};

// Statuts des affectations
export const STATUT_AFFECTATION = {
    ACTIVE: 'ACTIVE',
    TERMINEE: 'TERMINEE',
    PROVISOIRE: 'PROVISOIRE'
};

// Labels des statuts d'affectation
export const STATUT_AFFECTATION_LABELS = {
    [STATUT_AFFECTATION.ACTIVE]: 'Active',
    [STATUT_AFFECTATION.TERMINEE]: 'Terminée',
    [STATUT_AFFECTATION.PROVISOIRE]: 'Provisoire'
};

// Messages d'erreur
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Erreur de connexion. Vérifiez votre connexion internet.',
    SERVER_ERROR: 'Erreur serveur. Veuillez réessayer plus tard.',
    UNAUTHORIZED: 'Accès non autorisé. Veuillez vous reconnecter.',
    FORBIDDEN: 'Accès interdit. Vous n\'avez pas les permissions nécessaires.',
    NOT_FOUND: 'Ressource non trouvée.',
    VALIDATION_ERROR: 'Erreur de validation des données.',
    DUPLICATE_ERROR: 'Cette entrée existe déjà.',
    DELETE_ERROR: 'Impossible de supprimer cet élément.'
};

// Messages de succès
export const SUCCESS_MESSAGES = {
    CREATE_SUCCESS: 'Créé avec succès',
    UPDATE_SUCCESS: 'Mis à jour avec succès',
    DELETE_SUCCESS: 'Supprimé avec succès',
    SAVE_SUCCESS: 'Enregistré avec succès',
    UPLOAD_SUCCESS: 'Fichier téléchargé avec succès',
    DOWNLOAD_SUCCESS: 'Fichier téléchargé',
    EMAIL_SENT: 'Email envoyé avec succès'
};

// Configuration de pagination
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
    MAX_PAGE_SIZE: 100
};

// Configuration des fichiers
export const FILE_CONFIG = {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ],
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', '.xls', '.xlsx']
};

// Configuration des dates
export const DATE_CONFIG = {
    DEFAULT_FORMAT: 'DD/MM/YYYY',
    API_FORMAT: 'YYYY-MM-DD',
    DATETIME_FORMAT: 'DD/MM/YYYY HH:mm',
    TIME_FORMAT: 'HH:mm'
};

// Navigation - Éléments du menu
export const MENU_ITEMS = [
    {
        id: 'dashboard',
        name: 'Tableau de bord',
        path: '/',
        icon: 'Home',
        permissions: ['ADMIN', 'SECRETAIRE_FEDERAL', 'RESPONSABLE_DISTRICT', 'PASTEUR', 'ASSISTANT_RH']
    },
    {
        id: 'employes',
        name: 'Employés',
        path: '/employes',
        icon: 'Users',
        permissions: ['ADMIN', 'SECRETAIRE_FEDERAL', 'ASSISTANT_RH']
    },
    {
        id: 'conges',
        name: 'Congés',
        path: '/conges',
        icon: 'Calendar',
        permissions: ['ADMIN', 'SECRETAIRE_FEDERAL', 'RESPONSABLE_DISTRICT', 'ASSISTANT_RH']
    },
    {
        id: 'documents',
        name: 'Documents',
        path: '/documents',
        icon: 'FileText',
        permissions: ['ADMIN', 'SECRETAIRE_FEDERAL', 'ASSISTANT_RH']
    },
    {
        id: 'talents',
        name: 'Talents',
        path: '/talents',
        icon: 'Award',
        permissions: ['ADMIN', 'SECRETAIRE_FEDERAL', 'ASSISTANT_RH']
    },
    {
        id: 'etat-service',
        name: 'État de service',
        path: '/etat-service',
        icon: 'BarChart3',
        permissions: ['ADMIN', 'SECRETAIRE_FEDERAL', 'ASSISTANT_RH']
    }
];

// Configuration des couleurs de statut
export const STATUS_COLORS = {
    [STATUT_EMPLOYE.ACTIF]: 'green',
    [STATUT_EMPLOYE.INACTIF]: 'red',
    [STATUT_EMPLOYE.EN_CONGE]: 'yellow',

    [STATUT_CONGE.EN_ATTENTE]: 'yellow',
    [STATUT_CONGE.APPROUVE]: 'green',
    [STATUT_CONGE.REJETE]: 'red',
    [STATUT_CONGE.ANNULE]: 'gray',

    [STATUT_AFFECTATION.ACTIVE]: 'green',
    [STATUT_AFFECTATION.TERMINEE]: 'gray',
    [STATUT_AFFECTATION.PROVISOIRE]: 'yellow'
};

// Configuration des notifications
export const NOTIFICATION_CONFIG = {
    DURATION: 5000, // 5 secondes
    MAX_NOTIFICATIONS: 5,
    TYPES: {
        SUCCESS: 'success',
        ERROR: 'error',
        WARNING: 'warning',
        INFO: 'info'
    }
};

// Configuration du localStorage
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'auth_token',
    USER_DATA: 'user_data',
    PREFERENCES: 'user_preferences',
    THEME: 'theme',
    LANGUAGE: 'language'
};

// Configuration des regex de validation
export const VALIDATION_PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^(\+261|0)[23478][0-9]{7}$/, // Format téléphone Madagascar
    CIN: /^[0-9]{12}$/, // 12 chiffres pour CIN Madagascar
    MATRICULE: /^EMP[0-9]{6}$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/ // Au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
};

// Messages de validation
export const VALIDATION_MESSAGES = {
    REQUIRED: 'Ce champ est obligatoire',
    INVALID_EMAIL: 'Adresse email invalide',
    INVALID_PHONE: 'Numéro de téléphone invalide',
    INVALID_CIN: 'Numéro CIN invalide (12 chiffres)',
    INVALID_PASSWORD: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre',
    MIN_LENGTH: (min) => `Minimum ${min} caractères requis`,
    MAX_LENGTH: (max) => `Maximum ${max} caractères autorisés`,
    PASSWORDS_NOT_MATCH: 'Les mots de passe ne correspondent pas',
    INVALID_DATE: 'Date invalide',
    FUTURE_DATE: 'La date ne peut pas être dans le futur',
    PAST_DATE: 'La date ne peut pas être dans le passé'
};

// Configuration par défaut des formulaires
export const FORM_DEFAULTS = {
    EMPLOYE: {
        nationalite: 'Malgache',
        statutMatrimonial: STATUT_MATRIMONIAL.CELIBATAIRE,
        typeContrat: TYPE_CONTRAT.CDD,
        statut: STATUT_EMPLOYE.ACTIF,
        niveauAccreditation: NIVEAU_ACCREDITATION.LOCAL,
        salaireBase: 0,
        pourcentageSalaire: 100
    }
};

export default {
    API_CONFIG,
    STATUT_EMPLOYE,
    TYPE_CONTRAT,
    POSTES,
    POSTES_LABELS,
    STATUT_MATRIMONIAL,
    STATUT_MATRIMONIAL_LABELS,
    NIVEAU_ACCREDITATION,
    NIVEAU_ACCREDITATION_LABELS,
    STATUT_CONGE,
    STATUT_CONGE_LABELS,
    TYPE_CONGE,
    TYPE_CONGE_LABELS,
    TYPE_DOCUMENT,
    TYPE_DOCUMENT_LABELS,
    ROLES,
    ROLES_LABELS,
    TYPE_FORMATION,
    TYPE_FORMATION_LABELS,
    NIVEAU_FORMATION,
    NIVEAU_FORMATION_LABELS,
    INSTITUTION_FORMATION,
    INSTITUTION_FORMATION_LABELS,
    NIVEAU_AUTORITE,
    NIVEAU_AUTORITE_LABELS,
    STATUT_AFFECTATION,
    STATUT_AFFECTATION_LABELS,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    PAGINATION,
    FILE_CONFIG,
    DATE_CONFIG,
    MENU_ITEMS,
    STATUS_COLORS,
    NOTIFICATION_CONFIG,
    STORAGE_KEYS,
    VALIDATION_PATTERNS,
    VALIDATION_MESSAGES,
    FORM_DEFAULTS
};