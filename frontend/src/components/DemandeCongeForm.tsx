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
                            const details = demandeCongeService.getDemandeDetails(demande.id);
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


    // Calculer le nombre de jours de congé
    const calculateDays = (dateDebut: string, dateFin: string): number => {
        if (!dateDebut || !dateFin) return 0;

        const debut = new Date(dateDebut);
        const fin = new Date(dateFin);
        const timeDiff = fin.getTime() - debut.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
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
                demandeCongeService.updateDemandeConge(demande.id, requestData);
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
            demandeCongeService.deleteDemandeConge(demande.id);
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
    };

    const joursDemandes = calculateDays(formData.dateDebut, formData.dateFin);
    const totalConges = 25;
    const resteConges = totalConges - joursDemandes;
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
                                        {formData.typeConge}
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
                                <label className="block text-sm font-medium text-gray-700">Durée</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {joursDemandes} jour{joursDemandes > 1 ? 's' : ''}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Reste</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {resteConges} jour{resteConges > 1 ? 's' : ''}
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
                                            onClick={() => window.location.reload()}
                                            className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center transition-colors"
                                        >
                                            <Edit className="w-4 h-4 mr-2" />
                                            Modifier
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleDelete}
                                            disabled={loading}
                                            className="px-6 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center transition-colors"
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
                            <div className="grid grid-cols-1 gap-6">
                                {/* Employé */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Employé *
                                    </label>
                                    <select
                                        name="employeId"
                                        value={formData.employeId}
                                        onChange={handleChange}
                                        required
                                        disabled={mode === 'edit'}
                                        className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                            validationErrors.employeId ? 'border-red-500' : 'border-gray-300'
                                        } ${mode === 'edit' ? 'bg-gray-100' : ''}`}
                                    >
                                        <option value="">Sélectionner un employé</option>
                                        {employes.map(employe => (
                                            <option key={employe.id} value={employe.id}>
                                                {employe.prenom} {employe.nom} - {employe.matricule}
                                            </option>
                                        ))}
                                    </select>
                                    {validationErrors.employeId && (
                                        <p className="text-red-500 text-sm mt-1">{validationErrors.employeId}</p>
                                    )}
                                </div>

                                {/* Type de congé */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Type de congé *
                                    </label>
                                    <input
                                        type="text"
                                        name="typeConge"
                                        value={formData.typeConge}
                                        onChange={handleChange}
                                        required
                                        placeholder="Ex: Congé annuel, Congé maladie, Congé maternité..."
                                        className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                            validationErrors.typeConge ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {validationErrors.typeConge && (
                                        <p className="text-red-500 text-sm mt-1">{validationErrors.typeConge}</p>
                                    )}
                                </div>


                                {/* Dates */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Date de début *
                                        </label>
                                        <input
                                            type="date"
                                            name="dateDebut"
                                            value={formData.dateDebut}
                                            onChange={handleChange}
                                            min={mode === 'create' ? new Date().toISOString().split('T')[0] : undefined}
                                            required
                                            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                                validationErrors.dateDebut || validationErrors.dates ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                        {validationErrors.dateDebut && (
                                            <p className="text-red-500 text-sm mt-1">{validationErrors.dateDebut}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Date de fin *
                                        </label>
                                        <input
                                            type="date"
                                            name="dateFin"
                                            value={formData.dateFin}
                                            onChange={handleChange}
                                            min={formData.dateDebut || new Date().toISOString().split('T')[0]}
                                            required
                                            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                                validationErrors.dateFin || validationErrors.dates ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                        {validationErrors.dateFin && (
                                            <p className="text-red-500 text-sm mt-1">{validationErrors.dateFin}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Erreur de validation des dates */}
                                {validationErrors.dates && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                        {validationErrors.dates}
                                    </div>
                                )}

                                {/* Motif */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Motif
                                    </label>
                                    <textarea
                                        name="motif"
                                        value={formData.motif}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Décrivez la raison de votre demande de congé (optionnel)..."
                                    />
                                </div>

                                {/* Statut (uniquement en mode édition) */}
                                {mode === 'edit' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Statut
                                        </label>
                                        <select
                                            name="statut"
                                            value={formData.statut}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        >
                                            <option value="EN_ATTENTE">En attente</option>
                                            <option value="APPROUVE">Approuvé</option>
                                            <option value="REJETE">Rejeté</option>
                                            <option value="ANNULE">Annulé</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Boutons */}
                            <div className="flex justify-end space-x-4 pt-6 border-t">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={loading}
                                    className="px-6 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                                >
                                    Annuler
                                </button>
                                {mode === 'edit' && (
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        disabled={loading}
                                        className="px-6 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        {loading ? 'Suppression...' : 'Supprimer'}
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center transition-colors"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {loading ? 'Envoi...' : (mode === 'create' ? 'Soumettre' : 'Mettre à jour')}
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