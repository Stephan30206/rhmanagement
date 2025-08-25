import React, { useState, useEffect } from 'react';
import { X, Edit, Mail, Phone, MapPin, User, Briefcase, Download, History } from 'lucide-react';
import { type Employe, employeService } from '../services/api';

interface EmployeDetailsProps {
    employe: Employe;
    onClose: () => void;
    onEdit: (employe: Employe) => void;
}

const EmployeDetails: React.FC<EmployeDetailsProps> = ({ employe, onClose, onEdit }) => {
    const [details, setDetails] = useState<Employe | null>(null);
    const [historique, setHistorique] = useState<any[]>([]);
    const [showHistorique, setShowHistorique] = useState(false);

    useEffect(() => {
        const loadDetails = async () => {
            try {
                const data = await employeService.getEmployeById(employe.id);
                setDetails(data);

                // Charger l'historique professionnel
                const historiqueData = await employeService.getHistorique(employe.id);
                setHistorique(historiqueData);
            } catch (error) {
                console.error('Erreur lors du chargement des détails:', error);
            }
        };

        loadDetails();
    }, [employe.id]);

    const handlePrint = () => {
        window.print();
    };

    if (!details) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                </div>
            </div>
        );
    }

    const formatDate = (date: string | undefined) => {
        if (!date) return 'Non spécifiée';
        return new Date(date).toLocaleDateString('fr-FR');
    };

    const getStatusColor = (statut: string) => {
        switch (statut) {
            case 'ACTIF': return 'bg-green-100 text-green-800';
            case 'INACTIF': return 'bg-red-100 text-red-800';
            case 'EN_CONGE': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-900">Détails de l'employé</h2>
                    <div className="flex space-x-2">
                        <button
                            onClick={handlePrint}
                            className="p-2 rounded-md hover:bg-gray-100 text-blue-600"
                            title="Imprimer"
                        >
                            <Download className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setShowHistorique(!showHistorique)}
                            className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
                            title="Historique professionnel"
                        >
                            <History className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-md hover:bg-gray-100"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-center mb-6 mt-6">
                    {details.photoProfil ? (
                        <img
                            src={`http://localhost:8080/uploads/${details.photoProfil}`}
                            alt={`${details.prenom} ${details.nom}`}
                            className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                    ) : (
                        <div className="h-32 w-32 rounded-full bg-blue-500 flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg">
                            {details.prenom[0]}{details.nom[0]}
                        </div>
                    )}
                </div>

                {/* Historique professionnel modal */}
                {showHistorique && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
                        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] overflow-y-auto p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold">Historique professionnel</h3>
                                <button onClick={() => setShowHistorique(false)}>
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                {historique.length > 0 ? (
                                    historique.map((item, index) => (
                                        <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                                            <p className="font-semibold">{item.poste} - {item.organisation}</p>
                                            <p className="text-sm text-gray-600">
                                                {formatDate(item.dateDebut)} - {item.dateFin ? formatDate(item.dateFin) : 'Présent'}
                                            </p>
                                            {item.salairePleinTemps && (
                                                <p className="text-sm">Salaire: {item.salairePleinTemps} MGA</p>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p>Aucun historique professionnel</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Informations personnelles */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <User className="w-5 h-5 mr-2" />
                            Informations personnelles
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Nom complet</label>
                                <p className="text-gray-900">{details.prenom} {details.nom}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Matricule</label>
                                <p className="text-gray-900">{details.matricule}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Date de naissance</label>
                                <p className="text-gray-900">{formatDate(details.dateNaissance)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Lieu de naissance</label>
                                <p className="text-gray-900">{details.lieuNaissance || 'Non spécifié'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">CIN</label>
                                <p className="text-gray-900">{details.cin || 'Non spécifié'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Nationalité</label>
                                <p className="text-gray-900">{details.nationalite}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Statut matrimonial</label>
                                <p className="text-gray-900">{details.statutMatrimonial}</p>
                            </div>
                            {details.statutMatrimonial === 'MARIE' && (
                                <>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Date de mariage</label>
                                        <p className="text-gray-900">{formatDate(details.dateMariage)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Nom du conjoint</label>
                                        <p className="text-gray-900">{details.nomConjoint || 'Non spécifié'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Nombre d'enfants</label>
                                        <p className="text-gray-900">{details.nombreEnfants || 0}</p>
                                    </div>
                                </>
                            )}
                            <div>
                                <label className="text-sm font-medium text-gray-500">Numéro CNAPS</label>
                                <p className="text-gray-900">{details.numeroCNAPS || 'Non spécifié'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <Phone className="w-5 h-5 mr-2" />
                            Contact
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Téléphone</label>
                                <p className="text-gray-900">{details.telephone || 'Non spécifié'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Email</label>
                                <p className="text-gray-900 flex items-center">
                                    <Mail className="w-4 h-4 mr-2" />
                                    {details.email || 'Non spécifié'}
                                </p>
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-gray-500">Adresse</label>
                                <p className="text-gray-900 flex items-center">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    {details.adresse || 'Non spécifiée'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Informations professionnelles */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <Briefcase className="w-5 h-5 mr-2" />
                            Informations professionnelles
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Poste</label>
                                <p className="text-gray-900">{details.poste.replace('_', ' ')}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Statut</label>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(details.statut)}`}>
                                    {details.statut}
                                </span>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Type de contrat</label>
                                <p className="text-gray-900">{details.typeContrat}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Date de début</label>
                                <p className="text-gray-900">{details.dateDebut ? formatDate(details.dateDebut) : 'Non spécifiée'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Salaire base</label>
                                <p className="text-gray-900">{details.salaireBase ? `${details.salaireBase.toLocaleString()} MGA` : 'Non spécifié'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Pourcentage</label>
                                <p className="text-gray-900">{details.pourcentageSalaire ? `${details.pourcentageSalaire}%` : 'Non spécifié'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Informations supplémentaires */}
                    {details.affectationActuelle && (
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Affectation actuelle
                            </h3>
                            <p className="text-gray-900">{details.affectationActuelle}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end space-x-4 p-6 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                        Fermer
                    </button>
                    <button
                        onClick={() => onEdit(details)}
                        className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center"
                    >
                        <Edit className="w-4 h-4 mr-2" />
                        Modifier
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmployeDetails;