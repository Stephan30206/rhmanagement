import React, { useState, useEffect } from 'react';
import { Search, Eye, Calendar, User, CheckCircle, XCircle } from 'lucide-react';
import { absenceService, type Absence } from '../services/api';
import AbsenceDetails from './AbsenceDetails';

interface AbsenceListProps {
    onEditAbsence: (absence: Absence) => void;
    onCreateAbsence: () => void;
}

const AbsenceList: React.FC<AbsenceListProps> = ({}) => {
    const [absences, setAbsences] = useState<Absence[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedAbsence, setSelectedAbsence] = useState<Absence | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    useEffect(() => {
        loadAbsences();
    }, []);

    const loadAbsences = async () => {
        setLoading(true);
        try {
            const data = await absenceService.getAllAbsences();
            setAbsences(data || []);
            setError('');
        } catch (err: any) {
            console.error('Erreur lors du chargement des absences:', err);
            setError('Erreur lors du chargement des absences. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (absence: Absence) => {
        setSelectedAbsence(absence);
        setShowDetails(true);
    };

    const handleValidateAbsence = async (id: number) => {
        try {
            await absenceService.validate(id);
            loadAbsences(); // Recharger la liste
        } catch (err) {
            console.error('Erreur lors de la validation:', err);
            alert('Erreur lors de la validation de l\'absence');
        }
    };

    const handleRejectAbsence = async (id: number) => {
        const motif = prompt('Motif de rejet (optionnel):');
        try {
            await absenceService.reject(id, motif || '');
            loadAbsences(); // Recharger la liste
        } catch (err) {
            console.error('Erreur lors du rejet:', err);
            alert('Erreur lors du rejet de l\'absence');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'EN_ATTENTE':
                return 'bg-yellow-100 text-yellow-800';
            case 'VALIDE':
                return 'bg-green-100 text-green-800';
            case 'REJETE':
                return 'bg-red-100 text-red-800';
            case 'ANNULE':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredAbsences = absences.filter(absence => {
        const matchesSearch = absence.employe?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            absence.employe?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            absence.typeAbsence?.nom?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || absence.statut === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filtres et recherche */}
            <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rechercher</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Rechercher par nom, prénom ou type..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                    <div className="w-full sm:w-48">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="EN_ATTENTE">En attente</option>
                            <option value="VALIDE">Validé</option>
                            <option value="REJETE">Rejeté</option>
                            <option value="ANNULE">Annulé</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Liste des absences */}
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                {error && (
                    <div className="bg-red-100 border-b border-red-200 px-6 py-4 text-red-700">
                        {error}
                    </div>
                )}

                {filteredAbsences.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune absence</h3>
                        <p className="text-gray-600">
                            {absences.length === 0
                                ? "Commencez par créer votre première absence"
                                : "Aucune absence ne correspond à vos critères de recherche"
                            }
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Employé
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Durée
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Statut
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {filteredAbsences.map((absence) => (
                                <tr key={absence.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {absence.employe?.photoProfil ? (
                                                <img
                                                    src={`http://localhost:8080/uploads/${absence.employe.photoProfil}`}
                                                    alt={`${absence.employe.prenom} ${absence.employe.nom}`}
                                                    className="w-8 h-8 rounded-full object-cover mr-3"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                </div>
                                            )}
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {absence.employe?.prenom} {absence.employe?.nom}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {absence.employe?.matricule}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div
                                                className="w-3 h-3 rounded-full mr-2"
                                                style={{ backgroundColor: absence.typeAbsence?.couleur || '#6B7280' }}
                                            ></div>
                                            <span className="text-sm text-gray-900">
                                                    {absence.typeAbsence?.nom}
                                                </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(absence.dateAbsence).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {absence.duree === 'JOURNEE' ? 'Journée' :
                                            absence.duree === 'MATIN' ? 'Matin' : 'Après-midi'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(absence.statut)}`}>
                                                {absence.statut.toLowerCase()}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => handleViewDetails(absence)}
                                                className="text-blue-600 hover:text-blue-900 p-1"
                                                title="Voir les détails"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>

                                            {absence.statut === 'EN_ATTENTE' && (
                                                <>
                                                    <button
                                                        onClick={() => handleValidateAbsence(absence.id)}
                                                        className="text-green-600 hover:text-green-900 p-1"
                                                        title="Valider"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectAbsence(absence.id)}
                                                        className="text-red-600 hover:text-red-900 p-1"
                                                        title="Rejeter"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showDetails && selectedAbsence && (
                <AbsenceDetails
                    absence={selectedAbsence}
                    onClose={() => setShowDetails(false)}
                    onRefresh={loadAbsences}
                />
            )}
        </div>
    );
};

export default AbsenceList;