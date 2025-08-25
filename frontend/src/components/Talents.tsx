import React, { useState, useEffect } from 'react';
import { Plus, Award, Book, Edit, Trash2, Download, User, Search } from 'lucide-react';
import { employeService, type Employe } from '../services/api';

interface Competence {
    id?: number;
    nom: string;
    niveau: 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE' | 'EXPERT';
    categorie: string;
    dateAcquisition: string;
}

interface Formation {
    id?: number;
    intitule: string;
    organisme: string;
    dateDebut: string;
    dateFin: string;
    dureeHeures: number;
    certificat: string;
}

const Talents: React.FC = () => {
    const [employes, setEmployes] = useState<Employe[]>([]);
    const [selectedEmploye, setSelectedEmploye] = useState<Employe | null>(null);
    const [competences, setCompetences] = useState<Competence[]>([]);
    const [formations, setFormations] = useState<Formation[]>([]);
    const [showCompetenceForm, setShowCompetenceForm] = useState(false);
    const [showFormationForm, setShowFormationForm] = useState(false);
    const [editingCompetence, setEditingCompetence] = useState<Competence | null>(null);
    const [editingFormation, setEditingFormation] = useState<Formation | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEmployes();
    }, []);

    useEffect(() => {
        if (selectedEmploye) {
            loadCompetences();
            loadFormations();
        }
    }, [selectedEmploye]);

    const loadEmployes = async () => {
        try {
            const data = await employeService.getAllEmployes();
            setEmployes(data);
            if (data.length > 0 && !selectedEmploye) {
                setSelectedEmploye(data[0]);
            }
        } catch (error) {
            console.error('Erreur chargement employés:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadCompetences = async () => {
        if (!selectedEmploye) return;
        try {
            const data = await employeService.getCompetences(selectedEmploye.id);
            setCompetences(data);
        } catch (error) {
            console.error('Erreur chargement compétences:', error);
        }
    };

    const loadFormations = async () => {
        if (!selectedEmploye) return;
        try {
            const data = await employeService.getFormations(selectedEmploye.id);
            setFormations(data);
        } catch (error) {
            console.error('Erreur chargement formations:', error);
        }
    };

    const handleSaveCompetence = async (competence: Competence) => {
        if (!selectedEmploye) return;
        try {
            if (editingCompetence?.id) {
                await employeService.updateCompetence(selectedEmploye.id, editingCompetence.id, competence);
            } else {
                await employeService.saveCompetence(selectedEmploye.id, competence);
            }
            setShowCompetenceForm(false);
            setEditingCompetence(null);
            loadCompetences();
        } catch (error) {
            console.error('Erreur sauvegarde compétence:', error);
        }
    };

    const handleSaveFormation = async (formation: Formation) => {
        if (!selectedEmploye) return;
        try {
            if (editingFormation?.id) {
                await employeService.updateFormation(selectedEmploye.id, editingFormation.id, formation);
            } else {
                await employeService.saveFormation(selectedEmploye.id, formation);
            }
            setShowFormationForm(false);
            setEditingFormation(null);
            loadFormations();
        } catch (error) {
            console.error('Erreur sauvegarde formation:', error);
        }
    };

    const handleDeleteCompetence = async (id: number) => {
        if (!selectedEmploye) return;
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette compétence ?')) {
            try {
                await employeService.deleteCompetence(selectedEmploye.id, id);
                loadCompetences();
            } catch (error) {
                console.error('Erreur suppression compétence:', error);
            }
        }
    };

    const handleDeleteFormation = async (id: number) => {
        if (!selectedEmploye) return;
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
            try {
                await employeService.deleteFormation(selectedEmploye.id, id);
                loadFormations();
            } catch (error) {
                console.error('Erreur suppression formation:', error);
            }
        }
    };

    const getNiveauColor = (niveau: string) => {
        switch (niveau) {
            case 'DEBUTANT': return 'bg-yellow-100 text-yellow-800';
            case 'INTERMEDIAIRE': return 'bg-blue-100 text-blue-800';
            case 'AVANCE': return 'bg-green-100 text-green-800';
            case 'EXPERT': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredEmployes = employes.filter(emp =>
        emp.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.matricule.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Gestion des talents</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Suivi des compétences et formations des employés
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Liste des employés */}
                <div className="lg:col-span-1">
                    <div className="bg-white shadow rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Employés</h3>
                        <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {filteredEmployes.map((employe) => (
                                <div
                                    key={employe.id}
                                    onClick={() => setSelectedEmploye(employe)}
                                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                        selectedEmploye?.id === employe.id
                                            ? 'bg-blue-100 border border-blue-300'
                                            : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        {employe.photoProfil ? (
                                            <img
                                                src={`http://localhost:8080/uploads/${employe.photoProfil}`}
                                                alt={`${employe.prenom} ${employe.nom}`}
                                                className="h-8 w-8 rounded-full object-cover mr-3"
                                            />
                                        ) : (
                                            <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3">
                                                {employe.prenom[0]}{employe.nom[0]}
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {employe.prenom} {employe.nom}
                                            </p>
                                            <p className="text-xs text-gray-500">{employe.matricule}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Détails des talents */}
                <div className="lg:col-span-3">
                    {selectedEmploye ? (
                        <div className="space-y-6">
                            <div className="bg-white shadow rounded-lg p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center">
                                        {selectedEmploye.photoProfil ? (
                                            <img
                                                src={`http://localhost:8080/uploads/${selectedEmploye.photoProfil}`}
                                                alt={`${selectedEmploye.prenom} ${selectedEmploye.nom}`}
                                                className="h-16 w-16 rounded-full object-cover mr-4"
                                            />
                                        ) : (
                                            <div className="h-16 w-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                                                {selectedEmploye.prenom[0]}{selectedEmploye.nom[0]}
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">
                                                {selectedEmploye.prenom} {selectedEmploye.nom}
                                            </h3>
                                            <p className="text-gray-600">{selectedEmploye.matricule} • {selectedEmploye.poste}</p>
                                        </div>
                                    </div>
                                    <button className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                        <Download className="w-4 h-4 mr-2" />
                                        Exporter
                                    </button>
                                </div>

                                {/* Compétences */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-lg font-medium text-gray-900 flex items-center">
                                            <Award className="w-5 h-5 mr-2" />
                                            Compétences
                                        </h4>
                                        <button
                                            onClick={() => {
                                                setEditingCompetence(null);
                                                setShowCompetenceForm(true);
                                            }}
                                            className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                                        >
                                            <Plus className="w-4 h-4 mr-1" />
                                            Ajouter
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {competences.map((competence) => (
                                            <div key={competence.id} className="border rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h5 className="font-medium text-gray-900">{competence.nom}</h5>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditingCompetence(competence);
                                                                setShowCompetenceForm(true);
                                                            }}
                                                            className="text-blue-600 hover:text-blue-800"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteCompetence(competence.id!)}
                                                            className="text-red-600 hover:text-red-800"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 text-xs rounded-full ${getNiveauColor(competence.niveau)}`}>
                            {competence.niveau}
                          </span>
                                                    <span className="text-sm text-gray-600">{competence.categorie}</span>
                                                </div>
                                                {competence.dateAcquisition && (
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        Acquis le: {new Date(competence.dateAcquisition).toLocaleDateString('fr-FR')}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                        {competences.length === 0 && (
                                            <div className="col-span-2 text-center py-8 text-gray-500">
                                                <Award className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                                <p>Aucune compétence enregistrée</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Formations */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-lg font-medium text-gray-900 flex items-center">
                                            <Book className="w-5 h-5 mr-2" />
                                            Formations
                                        </h4>
                                        <button
                                            onClick={() => {
                                                setEditingFormation(null);
                                                setShowFormationForm(true);
                                            }}
                                            className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                                        >
                                            <Plus className="w-4 h-4 mr-1" />
                                            Ajouter
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {formations.map((formation) => (
                                            <div key={formation.id} className="border rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h5 className="font-medium text-gray-900">{formation.intitule}</h5>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditingFormation(formation);
                                                                setShowFormationForm(true);
                                                            }}
                                                            className="text-blue-600 hover:text-blue-800"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteFormation(formation.id!)}
                                                            className="text-red-600 hover:text-red-800"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">{formation.organisme}</p>
                                                <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>
                            {new Date(formation.dateDebut).toLocaleDateString('fr-FR')} -{' '}
                              {new Date(formation.dateFin).toLocaleDateString('fr-FR')}
                          </span>
                                                    <span>{formation.dureeHeures} heures</span>
                                                </div>
                                                {formation.certificat && (
                                                    <p className="text-xs text-blue-600 mt-2">Certificat: {formation.certificat}</p>
                                                )}
                                            </div>
                                        ))}
                                        {formations.length === 0 && (
                                            <div className="text-center py-8 text-gray-500">
                                                <Book className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                                <p>Aucune formation enregistrée</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white shadow rounded-lg p-12 text-center">
                            <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Sélectionnez un employé</h3>
                            <p className="text-gray-600">Choisissez un employé dans la liste pour voir et gérer ses talents</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals pour ajouter/modifier compétences et formations */}
            {showCompetenceForm && (
                <CompetenceForm
                    competence={editingCompetence}
                    onClose={() => {
                        setShowCompetenceForm(false);
                        setEditingCompetence(null);
                    }}
                    onSave={handleSaveCompetence}
                />
            )}

            {showFormationForm && (
                <FormationForm
                    formation={editingFormation}
                    onClose={() => {
                        setShowFormationForm(false);
                        setEditingFormation(null);
                    }}
                    onSave={handleSaveFormation}
                />
            )}
        </div>
    );
};

// Composant pour le formulaire de compétence
const CompetenceForm: React.FC<{
    competence: Competence | null;
    onClose: () => void;
    onSave: (competence: Competence) => void;
}> = ({ competence, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        nom: competence?.nom || '',
        niveau: competence?.niveau || 'DEBUTANT',
        categorie: competence?.categorie || '',
        dateAcquisition: competence?.dateAcquisition || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-medium mb-4">
                    {competence ? 'Modifier la compétence' : 'Nouvelle compétence'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nom de la compétence</label>
                        <input
                            type="text"
                            required
                            value={formData.nom}
                            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Niveau</label>
                        <select
                            value={formData.niveau}
                            onChange={(e) => setFormData({ ...formData, niveau: e.target.value as any })}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="DEBUTANT">Débutant</option>
                            <option value="INTERMEDIAIRE">Intermédiaire</option>
                            <option value="AVANCE">Avancé</option>
                            <option value="EXPERT">Expert</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                        <input
                            type="text"
                            value={formData.categorie}
                            onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Date d'acquisition</label>
                        <input
                            type="date"
                            value={formData.dateAcquisition}
                            onChange={(e) => setFormData({ ...formData, dateAcquisition: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Enregistrer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Composant pour le formulaire de formation
const FormationForm: React.FC<{
    formation: Formation | null;
    onClose: () => void;
    onSave: (formation: Formation) => void;
}> = ({ formation, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        intitule: formation?.intitule || '',
        organisme: formation?.organisme || '',
        dateDebut: formation?.dateDebut || '',
        dateFin: formation?.dateFin || '',
        dureeHeures: formation?.dureeHeures || 0,
        certificat: formation?.certificat || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-medium mb-4">
                    {formation ? 'Modifier la formation' : 'Nouvelle formation'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Intitulé de la formation</label>
                        <input
                            type="text"
                            required
                            value={formData.intitule}
                            onChange={(e) => setFormData({ ...formData, intitule: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Organisme</label>
                        <input
                            type="text"
                            value={formData.organisme}
                            onChange={(e) => setFormData({ ...formData, organisme: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date de début</label>
                            <input
                                type="date"
                                required
                                value={formData.dateDebut}
                                onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date de fin</label>
                            <input
                                type="date"
                                value={formData.dateFin}
                                onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Durée (heures)</label>
                        <input
                            type="number"
                            value={formData.dureeHeures}
                            onChange={(e) => setFormData({ ...formData, dureeHeures: parseInt(e.target.value) })}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Certificat</label>
                        <input
                            type="text"
                            value={formData.certificat}
                            onChange={(e) => setFormData({ ...formData, certificat: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Enregistrer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Talents;