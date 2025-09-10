import React from 'react';
import { X, Calendar, User, Clock, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import type {Absence} from '../services/api';

interface AbsenceDetailsProps {
    absence: Absence;
    onClose: () => void;
    onRefresh: () => void;
}

const AbsenceDetails: React.FC<AbsenceDetailsProps> = ({ absence, onClose}) => {
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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'EN_ATTENTE':
                return <AlertCircle className="w-5 h-5" />;
            case 'VALIDE':
                return <CheckCircle className="w-5 h-5" />;
            case 'REJETE':
                return <XCircle className="w-5 h-5" />;
            case 'ANNULE':
                return <XCircle className="w-5 h-5" />;
            default:
                return <AlertCircle className="w-5 h-5" />;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-900">Détails de l'absence</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Informations employé */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <User className="w-5 h-5 mr-2" />
                                Informations employé
                            </h3>
                            <div className="space-y-2">
                                <p><strong>Nom:</strong> {absence.employe?.prenom} {absence.employe?.nom}</p>
                                <p><strong>Matricule:</strong> {absence.employe?.matricule}</p>
                                <p><strong>Poste:</strong> {absence.employe?.poste}</p>
                            </div>
                        </div>

                        {/* Informations absence */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Calendar className="w-5 h-5 mr-2" />
                                Informations absence
                            </h3>
                            <div className="space-y-2">
                                <p><strong>Type:</strong> {absence.typeAbsence?.nom}</p>
                                <p><strong>Date:</strong> {new Date(absence.dateAbsence).toLocaleDateString('fr-FR')}</p>
                                <p><strong>Durée:</strong> {absence.duree === 'JOURNEE' ? 'Journée' : absence.duree === 'MATIN' ? 'Matin' : 'Après-midi'}</p>
                                <p>
                                    <strong>Statut:</strong>{' '}
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(absence.statut)}`}>
                                        {getStatusIcon(absence.statut)} {absence.statut.toLowerCase()}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Motif */}
                    {absence.motif && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center">
                                <FileText className="w-5 h-5 mr-2" />
                                Motif
                            </h3>
                            <p className="text-blue-800">{absence.motif}</p>
                        </div>
                    )}

                    {/* Dates */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Clock className="w-5 h-5 mr-2" />
                            Dates
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Date de création</p>
                                <p className="font-medium">
                                    {new Date(absence.dateCreation).toLocaleDateString('fr-FR')}
                                </p>
                            </div>
                            {absence.dateModification && (
                                <div>
                                    <p className="text-sm text-gray-600">Dernière modification</p>
                                    <p className="font-medium">
                                        {new Date(absence.dateModification).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Justificatif */}
                    {absence.justificatif && (
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <h3 className="text-lg font-semibold text-green-900 mb-2">
                                Justificatif
                            </h3>
                            <a
                                href={`http://localhost:8080/uploads/${absence.justificatif}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-800 underline"
                            >
                                Voir le justificatif
                            </a>
                        </div>
                    )}
                </div>

                <div className="flex justify-end space-x-4 p-6 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AbsenceDetails;