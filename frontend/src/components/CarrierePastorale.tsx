import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, MapPin, Users } from 'lucide-react';
import type { Employe } from '../services/api';
import type {AffectationPastorale} from '../services/api';

interface CarrierePastoraleProps {
    employe: Employe;
}

const CarrierePastorale: React.FC<CarrierePastoraleProps> = ({ employe }) => {
    const [affectations, setAffectations] = useState<AffectationPastorale[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingAffectation, setEditingAffectation] = useState<AffectationPastorale | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAffectations();
    }, [employe.id]);

    const loadAffectations = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/affectations-pastorales/pasteur/${employe.id}`);
            const data = await response.json();
            setAffectations(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erreur lors du chargement des affectations:', error);
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
                await fetch(`http://localhost:8080/api/affectations-pastorales/${id}`, {
                    method: 'DELETE'
                });
                loadAffectations();
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
            }
        }
    };

    const handleSave = async (affectationData: any) => {
        try {
            const url = editingAffectation
                ? `http://localhost:8080/api/affectations-pastorales/${editingAffectation.id}`
                : 'http://localhost:8080/api/affectations-pastorales';

            const method = editingAffectation ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...affectationData,
                    pasteur: { id: employe.id }
                })
            });

            if (response.ok) {
                setShowForm(false);
                setEditingAffectation(null);
                loadAffectations();
            }
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    };

    if (loading) {
        return <div>Chargement...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Carrière Pastorale</h3>
                <button
                    onClick={handleCreate}
                    className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle affectation
                </button>
            </div>

            {affectations.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-gray-600">Aucune affectation pastorale enregistrée</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {affectations.map((affectation) => (
                        <div key={affectation.id} className="bg-white p-4 rounded-lg shadow border">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-lg">{affectation.district}</h4>
                                    <p className="text-gray-600">{affectation.egliseLocale}</p>
                                    <div className="flex items-center mt-2 text-sm text-gray-500">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        {new Date(affectation.dateDebut).toLocaleDateString('fr-FR')}
                                        {affectation.dateFin && (
                                            <> - {new Date(affectation.dateFin).toLocaleDateString('fr-FR')}</>
                                        )}
                                    </div>
                                    <div className="flex items-center mt-1 text-sm text-gray-500">
                                        <MapPin className="h-4 w-4 mr-1" />
                                        {affectation.fonction}
                                    </div>
                                    <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                                        affectation.statut === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                            affectation.statut === 'TERMINEE' ? 'bg-gray-100 text-gray-800' :
                                                'bg-yellow-100 text-yellow-800'
                                    }`}>
                    {affectation.statut}
                  </span>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(affectation)}
                                        className="p-1 text-blue-600 hover:text-blue-800"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(affectation.id)}
                                        className="p-1 text-red-600 hover:text-red-800"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <AffectationForm
                    affectation={editingAffectation}
                    onClose={() => {
                        setShowForm(false);
                        setEditingAffectation(null);
                    }}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

// Composant pour le formulaire d'affectation
const AffectationForm: React.FC<{
    affectation: AffectationPastorale | null;
    onClose: () => void;
    onSave: (data: any) => void;
}> = ({ affectation, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        egliseLocale: affectation?.egliseLocale || '',
        district: affectation?.district || '',
        dateDebut: affectation?.dateDebut || '',
        dateFin: affectation?.dateFin || '',
        fonction: affectation?.fonction || '',
        statut: affectation?.statut || 'ACTIVE',
        lettreAffectation: affectation?.lettreAffectation || '',
        observations: affectation?.observations || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    // @ts-ignore
    // @ts-ignore
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">
                    {affectation ? 'Modifier l\'affectation' : 'Nouvelle affectation'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">District</label>
                        <input
                            type="text"
                            required
                            value={formData.district}
                            onChange={(e) => setFormData({...formData, district: e.target.value})}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Église locale</label>
                        <input
                            type="text"
                            required
                            value={formData.egliseLocale}
                            onChange={(e) => setFormData({...formData, egliseLocale: e.target.value})}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Fonction</label>
                        <select
                            required
                            value={formData.fonction}
                            onChange={(e) => setFormData({...formData, fonction: e.target.value})}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                        >
                            <option value="">Sélectionner une fonction</option>
                            <option value="PASTEUR_TITULAIRE">Pasteur Titulaire</option>
                            <option value="PASTEUR_ASSOCIE">Pasteur Associé</option>
                            <option value="PASTEUR_STAGIAIRE">Pasteur Stagiaire</option>
                            <option value="PIONNIER">Pionnier</option>
                            <option value="EVANGELISTE">Évangéliste</option>
                            <option value="ANCIEN">Ancien</option>
                            <option value="RESPONSABLE_DISTRICT">Responsable de District</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date début</label>
                            <input
                                type="date"
                                required
                                value={formData.dateDebut}
                                onChange={(e) => setFormData({...formData, dateDebut: e.target.value})}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date fin</label>
                            <input
                                type="date"
                                value={formData.dateFin}
                                onChange={(e) => setFormData({...formData, dateFin: e.target.value})}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                            />
                        </div>
                    </div>



                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
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

export default CarrierePastorale;