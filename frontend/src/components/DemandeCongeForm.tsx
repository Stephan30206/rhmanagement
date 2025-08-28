import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { demandeCongeService, employeService, typeCongeService, type TypeConge, type Employe } from '../services/api';

interface DemandeCongeFormProps {
    onClose: () => void;
    onSave: () => void;
}

const DemandeCongeForm: React.FC<DemandeCongeFormProps> = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({
        employeId: '',
        typeCongeId: '',
        dateDebut: '',
        dateFin: '',
        motif: ''
    });

    const [typesConge, setTypesConge] = useState<TypeConge[]>([]);
    const [employes, setEmployes] = useState<Employe[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const loadData = async () => {
            setLoadingData(true);
            try {
                const [typesData, employesData] = await Promise.all([
                    typeCongeService.getAllTypesConge(), // Fixed: use the proper service method
                    employeService.getAllEmployes()
                ]);
                setTypesConge(typesData || []);
                setEmployes(employesData || []);
                setError('');
            } catch (err: any) {
                console.error('Erreur lors du chargement des données:', err);
                setError('Erreur lors du chargement des données. Veuillez réessayer.');
            } finally {
                setLoadingData(false);
            }
        };

        loadData();
    }, []);

    // Validation des dates
    const validateDates = (dateDebut: string, dateFin: string): string | null => {
        if (!dateDebut || !dateFin) return null;

        const debut = new Date(dateDebut);
        const fin = new Date(dateFin);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (debut < today) {
            return 'La date de début ne peut pas être dans le passé';
        }

        if (fin <= debut) {
            return 'La date de fin doit être postérieure à la date de début';
        }

        // Vérifier que ce n'est pas un weekend (optionnel)
        const dayOfWeek = debut.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            return 'La date de début ne peut pas être un weekend';
        }

        return null;
    };

    // Calculer le nombre de jours de congé
    const calculateDays = (dateDebut: string, dateFin: string): number => {
        if (!dateDebut || !dateFin) return 0;

        const debut = new Date(dateDebut);
        const fin = new Date(dateFin);
        const timeDiff = fin.getTime() - debut.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 pour inclure le jour de début
    };

    const validateForm = (): boolean => {
        const errors: { [key: string]: string } = {};

        if (!formData.employeId) {
            errors.employeId = 'Veuillez sélectionner un employé';
        }

        if (!formData.typeCongeId) {
            errors.typeCongeId = 'Veuillez sélectionner un type de congé';
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

        // Vérifier si le nombre de jours demandés ne dépasse pas le nombre alloué
        if (formData.typeCongeId && formData.dateDebut && formData.dateFin) {
            const typeConge = typesConge.find(t => t.id === parseInt(formData.typeCongeId));
            const joursdemandes = calculateDays(formData.dateDebut, formData.dateFin);

            if (typeConge && joursdemandes > typeConge.joursAlloues) {
                errors.dates = `Le nombre de jours demandés (${joursdemandes}) dépasse le nombre alloué (${typeConge.joursAlloues})`;
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Formater les dates correctement pour le backend
            const requestData = {
                employeId: Number(formData.employeId), // Utiliser Number au lieu de parseInt
                typeCongeId: Number(formData.typeCongeId), // Utiliser Number au lieu de parseInt
                dateDebut: new Date(formData.dateDebut).toISOString().split('T')[0], // Format YYYY-MM-DD
                dateFin: new Date(formData.dateFin).toISOString().split('T')[0], // Format YYYY-MM-DD
                motif: formData.motif || '',
                statut: 'EN_ATTENTE'
            };

            console.log('Données formatées:', requestData);
            await demandeCongeService.createDemandeConge(requestData);
// Succès
            onSave();
            onClose();
        } catch (err: any) {
            console.error('Erreur détaillée:', err.response?.data);

            // Afficher plus de détails d'erreur
            if (err.response?.data?.message) {
                setError(`Erreur: ${err.response.data.message}`);
            } else {
                setError('Erreur lors de la création de la demande. Veuillez réessayer.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Effacer les erreurs de validation pour ce champ
        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: '' }));
        }

        // Effacer l'erreur des dates si on modifie une date
        if ((name === 'dateDebut' || name === 'dateFin') && validationErrors.dates) {
            setValidationErrors(prev => ({ ...prev, dates: '' }));
        }
    };

    const joursdemandes = calculateDays(formData.dateDebut, formData.dateFin);
    const typeCongeSelectionne = typesConge.find(t => t.id === parseInt(formData.typeCongeId));

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
                    <h2 className="text-2xl font-bold text-gray-900">Nouvelle demande de congé</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-md hover:bg-gray-100 transition-colors"
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
                                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                    validationErrors.employeId ? 'border-red-500' : 'border-gray-300'
                                }`}
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
                            <select
                                name="typeCongeId"
                                value={formData.typeCongeId}
                                onChange={handleChange}
                                required
                                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                    validationErrors.typeCongeId ? 'border-red-500' : 'border-gray-300'
                                }`}
                            >
                                <option value="">Sélectionner un type</option>
                                {typesConge.map(type => (
                                    <option key={type.id} value={type.id}>
                                        {type.nom} ({type.joursAlloues} jours)
                                    </option>
                                ))}
                            </select>
                            {validationErrors.typeCongeId && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.typeCongeId}</p>
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
                                    min={new Date().toISOString().split('T')[0]} // Date minimum = aujourd'hui
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

                        {/* Informations sur la durée */}
                        {joursdemandes > 0 && (
                            <div className="bg-blue-50 border border-blue-200 px-4 py-3 rounded">
                                <p className="text-sm text-blue-800">
                                    <strong>Durée demandée :</strong> {joursdemandes} jour{joursdemandes > 1 ? 's' : ''}
                                    {typeCongeSelectionne && (
                                        <span className="ml-2">
                                            (sur {typeCongeSelectionne.joursAlloues} jour{typeCongeSelectionne.joursAlloues > 1 ? 's' : ''} alloué{typeCongeSelectionne.joursAlloues > 1 ? 's' : ''})
                                        </span>
                                    )}
                                </p>
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
                        <button
                            type="submit"
                            disabled={loading || loadingData}
                            className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center transition-colors"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {loading ? 'Envoi...' : 'Soumettre'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DemandeCongeForm;