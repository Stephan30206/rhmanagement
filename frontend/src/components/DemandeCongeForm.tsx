import React, { useState, useEffect } from 'react';
import {X, Save, AlertCircle, Trash2, Edit} from 'lucide-react';
import {
    demandeCongeService,
    employeService,
    type Employe,
    type DemandeConge
} from '../services/api';

interface DemandeCongeFormProps {
    demande?: DemandeConge | null;
    onClose: () => void;
    onSave: () => void;
    mode?: 'create' | 'edit' | 'view';
}

interface FormData {
    employeId: string;
    typeConge: string;
    dateDebut: string;
    dateFin: string;
    motif: string;
    statut: 'EN_ATTENTE' | 'APPROUVE' | 'REJETE' | 'ANNULE';
}

const DemandeCongeForm: React.FC<DemandeCongeFormProps> = ({
                                                               demande,
                                                               onClose,
                                                               onSave,
                                                               mode = 'create'
                                                           }) => {
    const [formData, setFormData] = useState<FormData>({
        employeId: '',
        typeConge: '',
        dateDebut: '',
        dateFin: '',
        motif: '',
        statut: 'EN_ATTENTE'
    });

    const [employes, setEmployes] = useState<Employe[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
    const [demandeDetails, setDemandeDetails] = useState<any>(null);
    const [employeSolde, setEmployeSolde] = useState<number>(0);
    const [demandesExistantes, setDemandesExistantes] = useState<DemandeConge[]>([]);

    useEffect(() => {
        const loadData = async () => {
            setLoadingData(true);
            try {
                // @ts-ignore
                const [employesData] = await Promise.all([
                    employeService.getAllEmployes()
                ]);

                setEmployes(employesData || []);

                if (demande && mode !== 'create') {
                    setFormData({
                        employeId: demande.employeId?.toString() || '',
                        typeConge: demande.typeConge?.toString() || '',
                        dateDebut: demande.dateDebut.split('T')[0] || '',
                        dateFin: demande.dateFin.split('T')[0] || '',
                        motif: demande.motif || '',
                        statut: demande.statut || 'EN_ATTENTE'
                    });

                    if (mode === 'view' && demande.id) {
                        try {
                            const details = await demandeCongeService.getDemandeDetails(demande.id);
                            setDemandeDetails(details);
                        } catch (err) {
                            console.error('Erreur chargement détails:', err);
                        }
                    }
                }

                setError('');
            } catch (err: any) {
                console.error('Erreur lors du chargement des données:', err);
                setError('Erreur lors du chargement des données. Veuillez réessayer.');
            } finally {
                setLoadingData(false);
            }
        };

        loadData();
    }, [demande, mode]);

    // Charger les demandes existantes quand l'employé change
    useEffect(() => {
        const loadDemandesExistantes = async () => {
            if (formData.employeId) {
                try {
                    const demandes = await demandeCongeService.getByEmployeId(parseInt(formData.employeId));
                    setDemandesExistantes(demandes || []);
                } catch (err) {
                    console.error('Erreur chargement demandes existantes:', err);
                    setDemandesExistantes([]);
                }
            }
        };

        loadDemandesExistantes();
    }, [formData.employeId]);

    // Charger le solde de congé
    useEffect(() => {
        const loadSolde = async () => {
            if (formData.employeId) {
                try {
                    const solde = await demandeCongeService.getSoldeConge(parseInt(formData.employeId));
                    setEmployeSolde(solde);
                } catch (err) {
                    console.error('Erreur chargement solde:', err);
                    setEmployeSolde(25);
                }
            }
        };

        loadSolde();
    }, [formData.employeId]);

    // Fonction pour calculer le solde disponible (sans JAMAIS inclure la demande actuelle)
    const calculerSoldeActuel = (): number => {
        if (!formData.employeId) return employeSolde;

        // Filtrer seulement les demandes APPROUVEES (toujours exclure la demande actuelle)
        const demandesApprouvees = demandesExistantes.filter(d =>
            d.statut === 'APPROUVE' && d.id !== demande?.id
        );

        // Calculer le total des jours déjà pris (sans la demande actuelle)
        const totalJoursPris = demandesApprouvees.reduce((total, d) => {
            if (d.joursDemandes) {
                return total + d.joursDemandes;
            } else {
                const dateDebut = new Date(d.dateDebut);
                const dateFin = new Date(d.dateFin);
                const timeDiff = dateFin.getTime() - dateDebut.getTime();
                const jours = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
                return total + jours;
            }
        }, 0);

        return employeSolde - totalJoursPris;
    };

    // Calculer le nombre de jours de congé
    const calculateDays = (dateDebut: string, dateFin: string): number => {
        if (!dateDebut || !dateFin) return 0;

        const debut = new Date(dateDebut);
        const fin = new Date(dateFin);
        const timeDiff = fin.getTime() - debut.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    };

    // Validation des dates
    const validateDates = (dateDebut: string, dateFin: string): string | null => {
        if (!dateDebut || !dateFin) return null;

        const debut = new Date(dateDebut);
        const fin = new Date(dateFin);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Reset time part for accurate comparison
        debut.setHours(0, 0, 0, 0);
        fin.setHours(0, 0, 0, 0);

        if (debut < today && mode === 'create') {
            return 'La date de début ne peut pas être dans le passé';
        }

        if (fin < debut) {
            return 'La date de fin doit être postérieure à la date de début';
        }

        return null;
    };

    const validateForm = (): boolean => {
        const errors: { [key: string]: string } = {};

        if (!formData.employeId) {
            errors.employeId = 'Veuillez sélectionner un employé';
        }

        if (!formData.typeConge.trim()) {
            errors.typeConge = 'Veuillez saisir un type de congé';
        }

        if (!formData.dateDebut) {
            errors.dateDebut = 'La date de début est obligatoire';
        }

        if (!formData.dateFin) {
            errors.dateFin = 'La date de fin est obligatoire';
        }

        // Validation des dates
        const dateError = validateDates(formData.dateDebut, formData.dateFin);
        if (dateError) {
            errors.dates = dateError;
        }

        if (joursDemandes > soldeActuel) {
            errors.solde = `Solde insuffisant. L'employé a ${soldeActuel} jour(s) disponible(s)`;
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === 'view') return;

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            const requestData = {
                employeId: parseInt(formData.employeId),
                typeConge: formData.typeConge,
                dateDebut: new Date(formData.dateDebut).toISOString(),
                dateFin: new Date(formData.dateFin).toISOString(),
                motif: formData.motif,
                statut: formData.statut
            };

            if (mode === 'create') {
                await demandeCongeService.createDemandeConge(requestData);
            } else if (mode === 'edit' && demande?.id) {
                await demandeCongeService.updateDemandeConge(demande.id, requestData);
            }

            onSave();
            onClose();
        } catch (err: any) {
            console.error('Erreur détaillée:', err);
            setError(err.response?.data?.message || 'Erreur lors de la sauvegarde. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!demande?.id || !window.confirm('Êtes-vous sûr de vouloir supprimer cette demande ?')) {
            return;
        }

        setLoading(true);
        try {
            await demandeCongeService.deleteDemandeConge(demande.id);
            onSave();
            onClose();
        } catch (err: any) {
            console.error('Erreur suppression:', err);
            setError(err.response?.data?.message || 'Erreur lors de la suppression.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === 'statut') {
            setFormData(prev => ({
                ...prev,
                [name]: value as 'EN_ATTENTE' | 'APPROUVE' | 'REJETE' | 'ANNULE'
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // Clear validation errors for this field
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }

        if ((name === 'dateDebut' || name === 'dateFin') && validationErrors.dates) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.dates;
                return newErrors;
            });
        }

        if ((name === 'dateDebut' || name === 'dateFin' || name === 'employeId') && validationErrors.solde) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.solde;
                return newErrors;
            });
        }
    };

    const joursDemandes = calculateDays(formData.dateDebut, formData.dateFin);
    const soldeActuel = calculerSoldeActuel();
    const resteConges = soldeActuel - joursDemandes;
    const employeSelectionne = employes.find(e => e.id === parseInt(formData.employeId));

    if (loadingData) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg p-8">
                    <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span>Chargement des données...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {mode === 'create' && 'Nouvelle demande de congé'}
                        {mode === 'edit' && 'Modifier la demande de congé'}
                        {mode === 'view' && 'Détails de la demande de congé'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                        disabled={loading}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-start space-x-2">
                            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Mode visualisation - Affichage des détails */}
                    {mode === 'view' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Employé</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {demandeDetails?.employeNom || employeSelectionne?.prenom} {demandeDetails?.employePrenom || employeSelectionne?.nom}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Matricule</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {demandeDetails?.employeMatricule || employeSelectionne?.matricule}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Type de congé</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {formData.typeConge || 'Non spécifié'}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Statut</label>
                                    <p className="mt-1 text-sm text-gray-900 capitalize">
                                        {formData.statut.toLowerCase()}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date de début</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {new Date(formData.dateDebut).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date de fin</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {new Date(formData.dateFin).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Solde disponible actuel</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {soldeActuel} jour{soldeActuel !== 1 ? 's' : ''}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Durée demandée</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {joursDemandes} jour{joursDemandes !== 1 ? 's' : ''}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Reste après cette demande</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {resteConges} jour{resteConges !== 1 ? 's' : ''}
                                    {resteConges < 0 && (
                                        <span className="text-red-600 ml-2">(Dépassement!)</span>
                                    )}
                                </p>
                            </div>

                            {formData.motif && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Motif</label>
                                    <p className="mt-1 text-sm text-gray-900">{formData.motif}</p>
                                </div>
                            )}

                            <div className="flex justify-end space-x-4 pt-6 border-t">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                                >
                                    Fermer
                                </button>
                                {formData.statut === 'EN_ATTENTE' && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                // Passer en mode édition
                                                window.location.href = window.location.href + '?mode=edit';
                                            }}
                                            className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center transition-colors"
                                        >
                                            <Edit className="w-4 h-4 mr-2" />
                                            Modifier
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleDelete}
                                            disabled={loading}
                                            className="px-6 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 flex items-center transition-colors disabled:opacity-50"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            {loading ? 'Suppression...' : 'Supprimer'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Mode création/édition - Formulaire */}
                    {mode !== 'view' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="employeId" className="block text-sm font-medium text-gray-700">
                                        Employé *
                                    </label>
                                    <select
                                        id="employeId"
                                        name="employeId"
                                        value={formData.employeId}
                                        onChange={handleChange}
                                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                            validationErrors.employeId ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        disabled={mode === 'edit'}
                                    >
                                        <option value="">Sélectionner un employé</option>
                                        {employes.map((employe) => (
                                            <option key={employe.id} value={employe.id}>
                                                {employe.prenom} {employe.nom} ({employe.matricule})
                                            </option>
                                        ))}
                                    </select>
                                    {validationErrors.employeId && (
                                        <p className="mt-1 text-sm text-red-600">{validationErrors.employeId}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="typeConge" className="block text-sm font-medium text-gray-700">
                                        Type de congé *
                                    </label>
                                    <input
                                        type="text"
                                        id="typeConge"
                                        name="typeConge"
                                        value={formData.typeConge}
                                        onChange={handleChange}
                                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                            validationErrors.typeConge ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Ex: Congé annuel, Congé maladie..."
                                    />
                                    {validationErrors.typeConge && (
                                        <p className="mt-1 text-sm text-red-600">{validationErrors.typeConge}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="dateDebut" className="block text-sm font-medium text-gray-700">
                                        Date de début *
                                    </label>
                                    <input
                                        type="date"
                                        id="dateDebut"
                                        name="dateDebut"
                                        value={formData.dateDebut}
                                        onChange={handleChange}
                                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                            validationErrors.dateDebut || validationErrors.dates ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {validationErrors.dateDebut && (
                                        <p className="mt-1 text-sm text-red-600">{validationErrors.dateDebut}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="dateFin" className="block text-sm font-medium text-gray-700">
                                        Date de fin *
                                    </label>
                                    <input
                                        type="date"
                                        id="dateFin"
                                        name="dateFin"
                                        value={formData.dateFin}
                                        onChange={handleChange}
                                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                            validationErrors.dateFin || validationErrors.dates ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {validationErrors.dateFin && (
                                        <p className="mt-1 text-sm text-red-600">{validationErrors.dateFin}</p>
                                    )}
                                </div>
                            </div>

                            {validationErrors.dates && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                    {validationErrors.dates}
                                </div>
                            )}

                            <div>
                                <label htmlFor="motif" className="block text-sm font-medium text-gray-700">
                                    Motif
                                </label>
                                <textarea
                                    id="motif"
                                    name="motif"
                                    rows={3}
                                    value={formData.motif}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Raison de la demande de congé..."
                                />
                            </div>

                            {mode === 'edit' && (
                                <div>
                                    <label htmlFor="statut" className="block text-sm font-medium text-gray-700">
                                        Statut
                                    </label>
                                    <select
                                        id="statut"
                                        name="statut"
                                        value={formData.statut}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="EN_ATTENTE">En attente</option>
                                        <option value="APPROUVE">Approuvé</option>
                                        <option value="REJETE">Rejeté</option>
                                        <option value="ANNULE">Annulé</option>
                                    </select>
                                </div>
                            )}

                            {/* Informations sur le solde */}
                            {formData.employeId && (
                                <div className="bg-gray-50 p-4 rounded-md">
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">Informations sur le solde</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600">Solde annuel:</span>
                                            <span className="ml-2 font-medium">{employeSolde} jour{employeSolde !== 1 ? 's' : ''}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Jours déjà pris:</span>
                                            <span className="ml-2 font-medium">
                                                {demandesExistantes
                                                    .filter(d => d.statut === 'APPROUVE' && d.id !== demande?.id)
                                                    .reduce((total, d) => total + (d.joursDemandes || calculateDays(d.dateDebut, d.dateFin)), 0)}
                                                jour{demandesExistantes.filter(d => d.statut === 'APPROUVE' && d.id !== demande?.id).length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Solde disponible:</span>
                                            <span className="ml-2 font-medium">{soldeActuel} jour{soldeActuel !== 1 ? 's' : ''}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Jours demandés:</span>
                                            <span className="ml-2 font-medium">{joursDemandes} jour{joursDemandes !== 1 ? 's' : ''}</span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-gray-600">Reste après validation:</span>
                                            <span className={`ml-2 font-medium ${resteConges < 0 ? 'text-red-600' : ''}`}>
                                                {resteConges} jour{resteConges !== 1 ? 's' : ''}
                                                {resteConges < 0 && ' (Dépassement!)'}
                                            </span>
                                        </div>
                                    </div>
                                    {validationErrors.solde && (
                                        <div className="mt-2 text-sm text-red-600">{validationErrors.solde}</div>
                                    )}
                                </div>
                            )}

                            <div className="flex justify-end space-x-4 pt-6 border-t">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={loading}
                                    className="px-6 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center transition-colors disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {loading ? 'Enregistrement...' : (mode === 'create' ? 'Créer' : 'Modifier')}
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

export default DemandeCongeForm;