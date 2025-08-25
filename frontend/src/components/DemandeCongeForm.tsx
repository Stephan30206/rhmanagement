import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { demandeCongeService, employeService, type TypeConge, type Employe } from '../services/api';

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
    const [error, setError] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                const [typesData, employesData] = await Promise.all([
                    demandeCongeService.getTypesConge(),
                    employeService.getAllEmployes()
                ]);
                setTypesConge(typesData);
                setEmployes(employesData);
            } catch (err) {
                setError('Erreur lors du chargement des données');
                console.error('Erreur:', err);
            }
        };

        loadData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await demandeCongeService.createDemandeConge({
                ...formData,
                employeId: parseInt(formData.employeId),
                typeCongeId: parseInt(formData.typeCongeId)
            });

            onSave();
            onClose();
        } catch (err) {
            setError('Erreur lors de la création de la demande');
            console.error('Erreur:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-900">Nouvelle demande de congé</h2>
                    <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Employé *</label>
                            <select
                                name="employeId"
                                value={formData.employeId}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Sélectionner un employé</option>
                                {employes.map(employe => (
                                    <option key={employe.id} value={employe.id}>
                                        {employe.prenom} {employe.nom} - {employe.matricule}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Type de congé *</label>
                            <select
                                name="typeCongeId"
                                value={formData.typeCongeId}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Sélectionner un type</option>
                                {typesConge.map(type => (
                                    <option key={type.id} value={type.id}>
                                        {type.nom} ({type.joursAlloues} jours)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date de début *</label>
                                <input
                                    type="date"
                                    name="dateDebut"
                                    value={formData.dateDebut}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date de fin *</label>
                                <input
                                    type="date"
                                    name="dateFin"
                                    value={formData.dateFin}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Motif</label>
                            <textarea
                                name="motif"
                                value={formData.motif}
                                onChange={handleChange}
                                rows={3}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Décrivez la raison de votre demande de congé..."
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-6 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
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