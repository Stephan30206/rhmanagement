import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Upload } from 'lucide-react';
import api, { absenceService, employeService, typeAbsenceService, type TypeAbsence, type Employe } from '../services/api';
import CustomDropdown from './CustomDropdown';

interface AbsenceFormProps {
    onClose: () => void;
    onSave: () => void;
    absence?: any;
}

const AbsenceForm: React.FC<AbsenceFormProps> = ({ onClose, onSave, absence }) => {
    const [formData, setFormData] = useState({
        employeId: absence?.employeId?.toString() || '',
        typeAbsenceId: absence?.typeAbsenceId?.toString() || '',
        dateAbsence: absence?.dateAbsence ? new Date(absence.dateAbsence).toISOString().split('T')[0] : '',
        duree: absence?.duree || 'JOURNEE',
        motif: absence?.motif || '',
        justificatif: null as File | null
    });

    const [typesAbsence, setTypesAbsence] = useState<TypeAbsence[]>([]);
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
                    typeAbsenceService.getAllTypesAbsence(),
                    employeService.getAllEmployes()
                ]);
                setTypesAbsence(typesData || []);
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

    const employeOptions = employes.map(employe => ({
        value: employe.id.toString(),
        label: `${employe.prenom} ${employe.nom} - ${employe.matricule}`
    }));

    const validateForm = (): boolean => {
        const errors: { [key: string]: string } = {};

        if (!formData.employeId) {
            errors.employeId = 'Veuillez sélectionner un employé';
        }

        if (!formData.typeAbsenceId) {
            errors.typeAbsenceId = 'Veuillez sélectionner un type d\'absence';
        }

        if (!formData.dateAbsence) {
            errors.dateAbsence = 'La date d\'absence est obligatoire';
        } else {
            const selectedDate = new Date(formData.dateAbsence);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                errors.dateAbsence = 'La date d\'absence ne peut pas être dans le passé';
            }
        }

        const selectedType = typesAbsence.find(t => t.id === parseInt(formData.typeAbsenceId));
        if (selectedType?.necessiteJustificatif && !formData.justificatif && !absence?.justificatif) {
            errors.justificatif = 'Un justificatif est requis pour ce type d\'absence';
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
            // D'abord uploader le justificatif si nécessaire
            let justificatifPath = absence?.justificatif;

            if (formData.justificatif) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', formData.justificatif);

                const uploadResponse = await api.post('/upload/justificatif', uploadFormData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                justificatifPath = uploadResponse.data.filePath;
            }

            // Ensuite créer/mettre à jour l'absence avec les données JSON
            const requestData = {
                employeId: parseInt(formData.employeId),
                typeAbsenceId: parseInt(formData.typeAbsenceId),
                dateAbsence: formData.dateAbsence,
                duree: formData.duree,
                motif: formData.motif,
                justificatif: justificatifPath
            };

            if (absence) {
                await absenceService.updateAbsence(absence.id, requestData);
            } else {
                await absenceService.createAbsence(requestData);
            }

            onSave();
            onClose();
        } catch (err: any) {
            console.error('Erreur détaillée:', err.response?.data);
            if (err.response?.data?.message) {
                setError(`Erreur: ${err.response.data.message}`);
            } else {
                setError('Erreur lors de la création de l\'absence. Veuillez réessayer.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFormData(prev => ({ ...prev, justificatif: file }));

        if (validationErrors.justificatif) {
            setValidationErrors(prev => ({ ...prev, justificatif: '' }));
        }
    };

    const selectedType = typesAbsence.find(t => t.id === parseInt(formData.typeAbsenceId));
    employes.find(e => e.id === parseInt(formData.employeId));
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
                        {absence ? 'Modifier l\'absence' : 'Nouvelle absence'}
                    </h2>
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
                            <CustomDropdown
                                options={employeOptions}
                                value={formData.employeId}
                                onChange={(value) => {
                                    setFormData(prev => ({ ...prev, employeId: value }));
                                    if (validationErrors.employeId) {
                                        setValidationErrors(prev => ({ ...prev, employeId: '' }));
                                    }
                                }}
                                placeholder="Sélectionner un employé"
                                searchPlaceholder="Rechercher un employé..."
                                disabled={!!absence}
                                error={!!validationErrors.employeId}
                                className="w-full"
                            />
                            {validationErrors.employeId && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.employeId}</p>
                            )}
                        </div>

                        {/* Type d'absence */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Type d'absence *
                            </label>
                            <select
                                name="typeAbsenceId"
                                value={formData.typeAbsenceId}
                                onChange={handleChange}
                                required
                                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                    validationErrors.typeAbsenceId ? 'border-red-500' : 'border-gray-300'
                                }`}
                            >
                                <option value="">Sélectionner un type</option>
                                {typesAbsence.map(type => (
                                    <option key={type.id} value={type.id}>
                                        {type.nom} {type.plafondAnnuel && `(${type.plafondAnnuel} jours/an)`}
                                    </option>
                                ))}
                            </select>
                            {validationErrors.typeAbsenceId && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.typeAbsenceId}</p>
                            )}
                        </div>

                        {/* Date et durée */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date d'absence *
                                </label>
                                <input
                                    type="date"
                                    name="dateAbsence"
                                    value={formData.dateAbsence}
                                    onChange={handleChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                        validationErrors.dateAbsence ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {validationErrors.dateAbsence && (
                                    <p className="text-red-500 text-sm mt-1">{validationErrors.dateAbsence}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Durée
                                </label>
                                <select
                                    name="duree"
                                    value={formData.duree}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                >
                                    <option value="JOURNEE">Journée entière</option>
                                    <option value="MATIN">Matin seulement</option>
                                    <option value="APRES_MIDI">Après-midi seulement</option>
                                </select>
                            </div>
                        </div>

                        {/* Informations sur le type sélectionné */}
                        {selectedType && (
                            <div className="bg-blue-50 border border-blue-200 px-4 py-3 rounded">
                                <p className="text-sm text-blue-800">
                                    <strong>Type:</strong> {selectedType.nom}
                                    {selectedType.plafondAnnuel && (
                                        <span className="ml-2">
                                            • Plafond: {selectedType.plafondAnnuel} jours/an
                                        </span>
                                    )}
                                    {selectedType.necessiteJustificatif && (
                                        <span className="ml-2">• Justificatif requis</span>
                                    )}
                                    {!selectedType.estPaye && (
                                        <span className="ml-2">• Non payé</span>
                                    )}
                                </p>
                            </div>
                        )}

                        {/* Justificatif */}
                        {selectedType?.necessiteJustificatif && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Justificatif *
                                </label>
                                <div className="flex items-center space-x-4">
                                    <label className="flex-1 cursor-pointer">
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            className="hidden"
                                        />
                                        <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:border-blue-500 transition-colors">
                                            <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                                            <p className="text-sm text-gray-600">
                                                {formData.justificatif
                                                    ? formData.justificatif.name
                                                    : 'Cliquez pour télécharger un justificatif'
                                                }
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                PDF, JPG, PNG (max 5MB)
                                            </p>
                                        </div>
                                    </label>
                                </div>
                                {validationErrors.justificatif && (
                                    <p className="text-red-500 text-sm mt-1">{validationErrors.justificatif}</p>
                                )}
                                {absence?.justificatif && !formData.justificatif && (
                                    <p className="text-green-600 text-sm mt-2">
                                        ✓ Justificatif déjà fourni
                                    </p>
                                )}
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
                                placeholder="Décrivez la raison de cette absence..."
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-6 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Enregistrement...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    <span>{absence ? 'Modifier' : 'Créer l\'absence'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AbsenceForm;