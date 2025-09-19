import React, { useState, useEffect } from 'react';
import { X, Edit, Mail, Phone, MapPin, User, Briefcase, Download, History, GraduationCap, Users, Shield, Calendar } from 'lucide-react';
import { type Employe, employeService } from '../services/api';
import CarrierePastorale from "./CarrierePastorale.tsx";

interface EmployeDetailsProps {
    employe: Employe;
    onClose: () => void;
    onEdit: (employe: Employe) => void;
}

const EmployeDetails: React.FC<EmployeDetailsProps> = ({ employe, onClose, onEdit }) => {
    const [details, setDetails] = useState<Employe | null>(null);
    const [historique, setHistorique] = useState<any[]>([]);
    const [enfants, setEnfants] = useState<any[]>([]);
    const [diplomes, setDiplomes] = useState<any[]>([]);
    const [showHistorique, setShowHistorique] = useState(false);

    useEffect(() => {
        const loadDetails = async () => {
            try {
                const data = await employeService.getEmployeById(employe.id);
                setDetails(data);

                // Charger l'historique professionnel
                const historiqueData = await employeService.getHistorique(employe.id);
                setHistorique(historiqueData);

                // Charger les enfants
                const enfantsData = await employeService.getEnfants(employe.id);
                setEnfants(enfantsData);

                // Charger les diplômes
                const diplomesData = await employeService.getDiplomes(employe.id);
                console.log('Diplômes chargés:', diplomesData);
                setDiplomes(diplomesData);
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
            <div className="bg-white rounded-lg p-6 w-full">
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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

    const getPosteName = (poste: string) => {
        const postes = {
            'PASTEUR_TITULAIRE': 'Pasteur stagiaire',
            'PASTEUR_ASSOCIE': 'Pasteur autorisé',
            'EVANGELISTE': 'Évangéliste',
            'ANCIEN': 'Ancien',
            'MISSIONNAIRE': 'Pasteur consacré',
            'ENSEIGNANT': 'Enseignant',
            'SECRETAIRE_EXECUTIF': 'Secrétaire exécutif',
            'TRESORIER': 'Trésorier',
            'ASSISTANT_RH': 'Assistant RH',
            'AUTRE': 'Autre'
        };
        return postes[poste as keyof typeof postes] || poste;
    };

    const getStatutMatrimonialName = (statut: string) => {
        const statuts = {
            'CELIBATAIRE': 'Célibataire',
            'MARIE': 'Marié(e)',
            'DIVORCE': 'Divorcé(e)',
            'VEUF': 'Veuf/Veuve'
        };
        return statuts[statut as keyof typeof statuts] || statut;
    };

    const getContratName = (contrat: string) => {
        const contrats = {
            'CDD': 'CDD',
            'CDI': 'CDI',
            'BENEVOLAT': 'Bénévolat'
        };
        return contrats[contrat as keyof typeof contrats] || contrat;
    };

    const getNiveauAccreditation = (niveau: string | undefined) => {
        const niveaux = {
            'DISTRICT': 'District',
            'FEDERATION': 'Fédération'
        };
        return niveaux[niveau as keyof typeof niveaux] || niveau;
    };

    return (
        <div className="bg-white rounded-lg w-full overflow-y-auto border-2 border-blue-500">
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

            {/* Photo de profil */}
            <div className="flex items-center justify-center mb-6 mt-6">
                {details.photoProfil ? (
                    <img
                        src={`http://localhost:8080/uploads/${details.photoProfil}`}
                        alt={`${details.prenom} ${details.nom}`}
                        className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                ) : (
                    <div className="h-32 w-32 rounded-full bg-blue-500 flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg">
                        {details.prenom?.[0]}{details.nom?.[0]}
                    </div>
                )}
            </div>

            {/* Historique professionnel */}
            {showHistorique && (
                <div className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] overflow-y-auto p-6 mt-4 mx-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">Historique professionnel</h3>
                        <button onClick={() => setShowHistorique(false)} className="p-2 hover:bg-gray-100 rounded">
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
            )}

            {/* Content */}
            <div className="p-6 space-y-8">
                {/* Informations personnelles */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        Informations personnelles
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                            <p className="text-gray-900">{getStatutMatrimonialName(details.statutMatrimonial)}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Numéro CNAPS</label>
                            <p className="text-gray-900">{details.numeroCNAPS || 'Non spécifié'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Nom du père</label>
                            <p className="text-gray-900">{details.nomPere || 'Non spécifié'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Nom de la mère</label>
                            <p className="text-gray-900">{details.nomMere || 'Non spécifié'}</p>
                        </div>
                    </div>
                </div>

                {/* Informations familiales */}
                {details.statutMatrimonial === 'MARIE' && (
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <Users className="w-5 h-5 mr-2" />
                            Informations familiales
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Date de mariage</label>
                                <p className="text-gray-900">{formatDate(details.dateMariage)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Nom du conjoint</label>
                                <p className="text-gray-900">{details.nomConjoint || 'Non spécifié'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Date de naissance du conjoint</label>
                                <p className="text-gray-900">{formatDate(details.dateNaissanceConjoint)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Nombre d'enfants</label>
                                <p className="text-gray-900">{enfants.length || 0}</p>
                            </div>
                        </div>

                        {/* Liste des enfants */}
                        {enfants.length > 0 && (
                            <div className="mt-4">
                                <h4 className="text-md font-medium text-gray-900 mb-3">Enfants</h4>
                                <div className="space-y-2">
                                    {enfants.map((enfant, index) => (
                                        <div key={index} className="bg-gray-50 p-3 rounded-md">
                                            <p className="font-medium">{enfant.nom}</p>
                                            <p className="text-sm text-gray-600">Né(e) le {formatDate(enfant.dateNaissance)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                        }
                    </div>
                )}

                {/* Contact */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <Phone className="w-5 h-5 mr-2" />
                        Contact
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        <div className="md:col-span-2 lg:col-span-3">
                            <label className="text-sm font-medium text-gray-500">Adresse</label>
                            <p className="text-gray-900 flex items-center">
                                <MapPin className="w-4 h-4 mr-2" />
                                {details.adresse || 'Non spécifiée'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contact d'urgence */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <Shield className="w-5 h-5 mr-2" />
                        Contact d'urgence
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Nom</label>
                            <p className="text-gray-900">{details.contactUrgenceNom || 'Non spécifié'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Lien</label>
                            <p className="text-gray-900">{details.contactUrgenceLien || 'Non spécifié'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Téléphone</label>
                            <p className="text-gray-900">{details.contactUrgenceTelephone || 'Non spécifié'}</p>
                        </div>
                    </div>
                </div>

                {/* Diplômes et formations */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <GraduationCap className="w-5 h-5 mr-2" />
                        Diplômes et formations
                    </h3>
                    {diplomes.length > 0 ? (
                        <div className="space-y-3">
                            {diplomes.map((diplome, index) => (
                                <div key={index} className="bg-gray-50 p-4 ">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Type</label>
                                            <p className="text-gray-900">{diplome.typeDiplome}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Intitulé</label>
                                            <p className="text-gray-900">{diplome.intitule}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">École/Université</label>
                                            <p className="text-gray-900">{diplome.ecole || 'Non spécifiée'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Année d'obtention</label>
                                            <p className="text-gray-900">{diplome.anneeObtention || 'Non spécifiée'}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">Aucun diplôme enregistré</p>
                    )}
                </div>

                {employe.poste.includes('PASTEUR') || employe.poste.includes('EVANGELISTE') || employe.poste.includes('MISSIONNAIRE') ? (
                    <div className="mt-6">
                        <CarrierePastorale employe={employe} />
                    </div>
                ) : null}

                {/* Informations professionnelles */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <Briefcase className="w-5 h-5 mr-2" />
                        Informations professionnelles
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Poste</label>
                            <p className="text-gray-900">{getPosteName(details.poste)}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Statut</label>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(details.statut)}`}>
                                {details.statut}
                            </span>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Type de contrat</label>
                            <p className="text-gray-900">{getContratName(details.typeContrat)}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Organisation employeur</label>
                            <p className="text-gray-900">{details.organisationEmployeur || 'Non spécifiée'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Date de début</label>
                            <p className="text-gray-900">{formatDate(details.dateDebut)}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Date de fin</label>
                            <p className="text-gray-900">{formatDate(details.dateFin)}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Salaire base</label>
                            <p className="text-gray-900">{details.salaireBase ? `${details.salaireBase.toLocaleString()} MGA` : 'Non spécifié'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Pourcentage salaire</label>
                            <p className="text-gray-900">{details.pourcentageSalaire ? `${details.pourcentageSalaire}%` : 'Non spécifié'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Superviseur hiérarchique</label>
                            <p className="text-gray-900">{details.superviseurHierarchique || 'Non spécifié'}</p>
                        </div>
                    </div>
                </div>

                {/* Accréditation */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <Calendar className="w-5 h-5 mr-2" />
                        Accréditation
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Date d'accréditation</label>
                            <p className="text-gray-900">{formatDate(details.dateAccreditation)}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Niveau d'accréditation</label>
                            <p className="text-gray-900">{getNiveauAccreditation(details.niveauAccreditation)}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Groupe d'accréditation</label>
                            <p className="text-gray-900">{details.groupeAccreditation || 'Non spécifié'}</p>
                        </div>
                    </div>
                </div>

                {/* Affectation actuelle */}
                {details.affectationActuelle && (
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Affectation actuelle
                        </h3>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{details.affectationActuelle}</p>
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
    );
};

export default EmployeDetails;