import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, MapPin, Users } from 'lucide-react';
import type { Employe } from '../services/api';
import type { AffectationPastorale } from '../services/api';
import { affectationPastoraleService } from '../services/api';

interface CarrierePastoraleProps {
    employe: Employe;
}

interface AffectationFormData {
    district: string;
    dateDebut: string;
    dateFin: string;
    fonction: string;
    statut: string;
    lettreAffectation: string;
    observations: string;
}

const CarrierePastorale: React.FC<CarrierePastoraleProps> = ({ employe }) => {
    const [affectations, setAffectations] = useState<AffectationPastorale[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingAffectation, setEditingAffectation] = useState<AffectationPastorale | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadAffectations();
    }, [employe.id]);

    const determineStatut = (dateFin: string): string => {
        const aujourdhui = new Date();
        const dateFinObj = dateFin ? new Date(dateFin) : null;

        if (dateFinObj && dateFinObj < aujourdhui) {
            return 'TERMINEE';
        }
        return 'ACTIVE';
    };

    const loadAffectations = async () => {
        try {
            setLoading(true);
            setError(null);

            // ✅ Utiliser le service API au lieu de fetch direct
            const data = await affectationPastoraleService.getAffectationsByPasteur(employe.id);
            setAffectations(Array.isArray(data) ? data : []);

        } catch (error: any) {
            console.error('Erreur lors du chargement des affectations:', error);

            // Gestion d'erreurs plus détaillée
            if (error.response?.status === 403) {
                setError('Accès refusé. Vérifiez vos droits d\'accès.');
            } else if (error.response?.status === 401) {
                setError('Session expirée. Veuillez vous reconnecter.');
            } else if (error.response?.status === 404) {
                setError('Endpoint non trouvé. Vérifiez la configuration du serveur.');
            } else {
                setError(error.message || 'Erreur lors du chargement des affectations');
            }

            setAffectations([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingAffectation(null);
        setShowForm(true);
    };

    const handleEdit = (affectation: AffectationPastorale) => {
        setEditingAffectation(affectation);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette affectation ?')) {
            try {
                // ✅ Suppression avec le service API
                await affectationPastoraleService.deleteAffectation(id);
                loadAffectations();
            } catch (error: any) {
                console.error('Erreur lors de la suppression:', error);
                const message = error.response?.data?.message ||
                    error.message ||
                    'Erreur lors de la suppression de l\'affectation';
                alert(message);
            }
        }
    };

    const handleSave = async (affectationData: AffectationFormData) => {
        try {
            setSaving(true);

            const statutAuto = determineStatut(affectationData.dateDebut);

            const requestData = {
                district: affectationData.district,
                dateDebut: affectationData.dateDebut,
                dateFin: affectationData.dateFin || null,
                fonction: affectationData.fonction,
                statut: statutAuto,
                lettreAffectation: affectationData.lettreAffectation || null,
                observations: affectationData.observations || null,
                pasteur: { id: employe.id }
            };

            let savedAffectation;

            if (editingAffectation) {
                // ✅ Modification avec le service API
                savedAffectation = await affectationPastoraleService.updateAffectation(
                    editingAffectation.id,
                    requestData
                );
            } else {
                // ✅ Création avec le service API
                savedAffectation = await affectationPastoraleService.createAffectation(requestData);
            }

            console.log('Affectation sauvegardée:', savedAffectation);
            setShowForm(false);
            setEditingAffectation(null);
            loadAffectations();

        } catch (error: any) {
            console.error('Erreur détaillée lors de la sauvegarde:', error);

            const message = error.response?.data?.message ||
                error.message ||
                'Erreur lors de la sauvegarde de l\'affectation';
            alert(message);
        } finally {
            setSaving(false);
        }
    };

    const formatPeriode = (dateDebut: string, dateFin: string | undefined) => {
        const aujourdhui = new Date();
        const dateFinObj = dateFin ? new Date(dateFin) : null;
        const estTerminee = dateFinObj && dateFinObj < aujourdhui;

        return {
            texte: `${new Date(dateDebut).toLocaleDateString('fr-FR')}${
                dateFin ? ` au ${new Date(dateFin).toLocaleDateString('fr-FR')}` : ''
            }`,
            estTerminee
        };
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">Carrière Pastorale</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            {employe.prenom} {employe.nom} - {employe.poste?.replace('_', ' ')}
                        </p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Nouvelle affectation
                    </button>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex items-center">
                        <div className="text-red-400 mr-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-red-800 font-medium">Erreur de chargement</h4>
                            <p className="text-red-700 text-sm mt-1">{error}</p>
                        </div>
                    </div>
                    <button
                        onClick={loadAffectations}
                        className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900">Carrière Pastorale</h3>
                    <p className="text-sm text-gray-600 mt-1">
                        {employe.prenom} {employe.nom} - {employe.poste?.replace('_', ' ')}
                    </p>
                </div>
                <button
                    onClick={handleCreate}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle affectation
                </button>
            </div>

            {affectations.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Aucune affectation pastorale</h4>
                    <p className="text-gray-600 mb-4">Commencez par ajouter une nouvelle affectation pour ce pasteur.</p>
                    <button
                        onClick={handleCreate}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter une affectation
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {affectations.map((affectation) => {
                        const periode = formatPeriode(affectation.dateDebut, affectation.dateFin);

                        return (
                            <div key={affectation.id} className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-lg text-gray-900">{affectation.district}</h4>
                                        <div className="flex items-center mt-3 text-sm text-gray-600">
                                            <MapPin className="h-4 w-4 mr-2" />
                                            <span className="font-medium">Fonction: </span>
                                            <span className="ml-1 capitalize">
                                                {affectation.fonction?.toLowerCase().replace('_', ' ')}
                                            </span>
                                        </div>
                                        <div className="flex items-center mt-2 text-sm text-gray-600">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            <span className="font-medium">Période: </span>
                                            <span className="ml-1">
                                                {periode.texte}
                                                {periode.estTerminee && (
                                                    <span className="ml-2 text-xs text-red-600 font-medium">
                                                        (Terminée)
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                        {affectation.lettreAffectation && (
                                            <div className="mt-2 text-sm text-gray-600">
                                                <span className="font-medium">Lettre d'affectation: </span>
                                                {affectation.lettreAffectation}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(affectation)}
                                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                                            title="Modifier"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(affectation.id)}
                                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                                            title="Supprimer"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t pt-3">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                        affectation.statut === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                            affectation.statut === 'TERMINEE' ? 'bg-gray-100 text-gray-800' :
                                                'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {affectation.statut === 'ACTIVE' ? 'En cours' :
                                            affectation.statut === 'TERMINEE' ? 'Terminée' : 'Provisoire'}
                                    </span>

                                    {affectation.observations && (
                                        <div className="text-xs text-gray-500">
                                            <span className="font-medium">Observations: </span>
                                            {affectation.observations}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showForm && (
                <AffectationForm
                    affectation={editingAffectation}
                    employe={employe}
                    onClose={() => {
                        setShowForm(false);
                        setEditingAffectation(null);
                    }}
                    onSave={handleSave}
                    loading={saving}
                    determineStatut={determineStatut}
                />
            )}
        </div>
    );
};

// Composant pour le formulaire d'affectation
const AffectationForm: React.FC<{
    affectation: AffectationPastorale | null;
    employe: Employe;
    onClose: () => void;
    onSave: (data: any) => void;
    loading: boolean;
    determineStatut: (dateDebut: string, dateFin: string | null) => string;
}> = ({ affectation, employe, onClose, onSave, loading, determineStatut }) => {
    const [formData, setFormData] = useState({
        district: affectation?.district || '',
        dateDebut: affectation?.dateDebut ? affectation.dateDebut.split('T')[0] : '',
        dateFin: affectation?.dateFin ? affectation.dateFin.split('T')[0] : '',
        fonction: affectation?.fonction || employe.poste || '',
        statut: affectation?.statut || 'ACTIVE',
        lettreAffectation: affectation?.lettreAffectation || '',
        observations: affectation?.observations || ''
    });

    const [statutAuto, setStatutAuto] = useState('ACTIVE');

    // Mettre à jour le statut automatique quand les dates changent
    useEffect(() => {
        const nouveauStatut = determineStatut(formData.dateDebut, formData.dateFin || null);
        setStatutAuto(nouveauStatut);
    }, [formData.dateDebut, formData.dateFin, determineStatut]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation des champs requis
        if (!formData.district.trim()) {
            alert('Le district est obligatoire');
            return;
        }
        if (!formData.dateDebut) {
            alert('La date de début est obligatoire');
            return;
        }
        if (!formData.fonction) {
            alert('La fonction est obligatoire');
            return;
        }

        // Utiliser le statut déterminé automatiquement
        const dataAEnvoyer = {
            ...formData,
            statut: statutAuto
        };

        onSave(dataAEnvoyer);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {affectation ? 'Modifier l\'affectation' : 'Nouvelle affectation'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                        disabled={loading}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            District *
                        </label>
                        <input
                            type="text"
                            name="district"
                            required
                            value={formData.district}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Nom du district"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fonction *
                        </label>
                        <select
                            name="fonction"
                            required
                            value={formData.fonction}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={loading}
                        >
                            <option value="">Sélectionner une fonction</option>
                            <option value="EVANGELISTE">Évangéliste</option>
                            <option value="PASTEUR_STAGIAIRE">Pasteur stagiaire</option>
                            <option value="PASTEUR_AUTORISE">Pasteur autorisé</option>
                            <option value="PASTEUR_CONSACRE">Pasteur consacré</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            Poste actuel: <span className="font-medium">{employe.poste?.replace('_', ' ') || 'Non défini'}</span>
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date début *
                            </label>
                            <input
                                type="date"
                                name="dateDebut"
                                required
                                value={formData.dateDebut}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date fin
                            </label>
                            <input
                                type="date"
                                name="dateFin"
                                value={formData.dateFin}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Optionnel"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-md">
                        <p className="text-sm text-blue-800">
                            <strong>Statut automatique:</strong> {statutAuto === 'TERMINEE' ? 'Terminée' : 'Active'}
                            {statutAuto === 'TERMINEE' && (
                                <span className="ml-2 text-xs text-blue-600">
                                    (La date de fin est passée)
                                </span>
                            )}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Lettre d'affectation
                        </label>
                        <input
                            type="text"
                            name="lettreAffectation"
                            value={formData.lettreAffectation}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Référence de la lettre d'affectation"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Observations
                        </label>
                        <textarea
                            name="observations"
                            value={formData.observations}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Notes et observations"
                            disabled={loading}
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                            disabled={loading}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Enregistrement...
                                </div>
                            ) : (
                                `${affectation ? 'Modifier' : 'Créer'} l'affectation`
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CarrierePastorale;