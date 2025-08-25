
import React, { useState, useEffect, useRef } from 'react';
import { X, Save, User, Phone, Briefcase, DollarSign, Percent, Upload, Camera, Plus, Trash2 } from 'lucide-react';
import { type Employe, employeService } from '../services/api';

interface EmployeFormProps {
    employe?: Employe | null;
    onClose: () => void;
    onSave: () => void;
}

interface Enfant {
    nom: string;
    dateNaissance: string;
}

interface Diplome {
    typeDiplome: string;
    intitule: string;
    ecole: string;
    anneeObtention: string;
}

const EmployeForm: React.FC<EmployeFormProps> = ({ employe, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        matricule: '',
        nom: '',
        prenom: '',
        dateNaissance: '',
        lieuNaissance: '',
        nationalite: 'Malgache',
        cin: '',
        adresse: '',
        telephone: '',
        email: '',
        photoProfil: '',
        statutMatrimonial: 'CELIBATAIRE',
        dateMariage: '',
        nomConjoint: '',
        dateNaissanceConjoint: '',
        nombreEnfants: 0,
        numeroCNAPS: '',
        contactUrgenceNom: '',
        contactUrgenceLien: '',
        contactUrgenceTelephone: '',
        nomPere: '',
        nomMere: '',
        poste: 'PASTEUR_TITULAIRE',
        organisationEmployeur: '',
        typeContrat: 'CDD',
        dateDebut: '',
        dateFin: '',
        salaireBase: '',
        pourcentageSalaire: '',
        statut: 'ACTIF',
        dateAccreditation: '',
        niveauAccreditation: 'LOCAL',
        groupeAccreditation: '',
        superviseurHierarchique: '',
        affectationActuelle: ''
    });

    const [enfants, setEnfants] = useState<Enfant[]>([]);
    const [nouvelEnfant, setNouvelEnfant] = useState<Enfant>({ nom: '', dateNaissance: '' });
    const [diplomes, setDiplomes] = useState<Diplome[]>([]);
    const [nouveauDiplome, setNouveauDiplome] = useState<Diplome>({
        typeDiplome: '',
        intitule: '',
        ecole: '',
        anneeObtention: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [, setUploadingPhoto] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (employe) {
            setFormData({
                matricule: employe.matricule || '',
                nom: employe.nom || '',
                prenom: employe.prenom || '',
                dateNaissance: employe.dateNaissance || '',
                lieuNaissance: employe.lieuNaissance || '',
                nationalite: employe.nationalite || 'Malgache',
                cin: employe.cin || '',
                adresse: employe.adresse || '',
                telephone: employe.telephone || '',
                email: employe.email || '',
                photoProfil: employe.photoProfil || '',
                statutMatrimonial: employe.statutMatrimonial || 'CELIBATAIRE',
                dateMariage: employe.dateMariage || '',
                nomConjoint: employe.nomConjoint || '',
                dateNaissanceConjoint: employe.dateNaissanceConjoint || '',
                nombreEnfants: employe.nombreEnfants || 0,
                numeroCNAPS: employe.numeroCNAPS || '',
                contactUrgenceNom: employe.contactUrgenceNom || '',
                contactUrgenceLien: employe.contactUrgenceLien || '',
                contactUrgenceTelephone: employe.contactUrgenceTelephone || '',
                nomPere: employe.nomPere || '',
                nomMere: employe.nomMere || '',
                poste: employe.poste || 'PASTEUR_TITULAIRE',
                organisationEmployeur: employe.organisationEmployeur || '',
                typeContrat: employe.typeContrat || 'CDD',
                dateDebut: employe.dateDebut || '',
                dateFin: employe.dateFin || '',
                salaireBase: employe.salaireBase?.toString() || '',
                pourcentageSalaire: employe.pourcentageSalaire?.toString() || '',
                statut: employe.statut || 'ACTIF',
                dateAccreditation: employe.dateAccreditation || '',
                niveauAccreditation: employe.niveauAccreditation || 'LOCAL',
                groupeAccreditation: employe.groupeAccreditation || '',
                superviseurHierarchique: employe.superviseurHierarchique || '',
                affectationActuelle: employe.affectationActuelle || ''
            });

            if (employe.photoProfil) {
                setPhotoPreview(`http://localhost:8080/uploads/${employe.photoProfil}`);
            }

            // Charger les enfants et diplômes depuis l'API
            if (employe.id) {
                loadEnfants(employe.id);
                loadDiplomes(employe.id);
            }
        }
    }, [employe]);

    const loadEnfants = async (employeId: number) => {
        try {
            const data = await employeService.getEnfants(employeId);
            setEnfants(data);
        } catch (error) {
            console.error('Erreur chargement enfants:', error);
        }
    };

    const loadDiplomes = async (employeId: number) => {
        try {
            const data = await employeService.getDiplomes(employeId);
            setDiplomes(data);
        } catch (error) {
            console.error('Erreur chargement diplômes:', error);
        }
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setError('Le fichier est trop volumineux (max 10MB)');
                return;
            }

            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                setError('Type de fichier non supporté. Utilisez JPEG, PNG ou GIF.');
                return;
            }

            setPhotoFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setPhotoPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
            setError('');
        }
    };

    const handleRemovePhoto = async () => {
        if (employe?.id && employe.photoProfil) {
            try {
                await employeService.deletePhoto(employe.id);
                setPhotoPreview(null);
                setPhotoFile(null);
                setFormData(prev => ({ ...prev, photoProfil: '' }));
            } catch (error) {
                console.error('Erreur suppression photo:', error);
            }
        } else {
            setPhotoPreview(null);
            setPhotoFile(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const employeData = {
                ...formData,
                salaireBase: formData.salaireBase ? parseFloat(formData.salaireBase) : 0,
                pourcentageSalaire: formData.pourcentageSalaire ? parseFloat(formData.pourcentageSalaire) : 0,
                dateMariage: formData.dateMariage || null,
                dateDebut: formData.dateDebut || null,
                dateFin: formData.dateFin || null,
                dateAccreditation: formData.dateAccreditation || null,
                nombreEnfants: enfants.length
            };

            let savedEmploye: Employe;

            if (employe) {
                // @ts-ignore
                savedEmploye = await employeService.updateEmploye(employe.id, employeData);
            } else {
                // @ts-ignore
                savedEmploye = await employeService.createEmploye(employeData);
            }

            // Sauvegarder les enfants
            for (const enfant of enfants) {
                await employeService.saveEnfant(savedEmploye.id, enfant);
            }

            // Sauvegarder les diplômes
            for (const diplome of diplomes) {
                await employeService.saveDiplome(savedEmploye.id, diplome);
            }

            // Upload de la photo
            if (photoFile && savedEmploye.id) {
                // @ts-ignore
                setUploadingPhoto(true);
                try {
                    await employeService.uploadPhoto(savedEmploye.id, photoFile);
                } catch (uploadError) {
                    console.error('Erreur upload photo:', uploadError);
                    setError('Erreur lors de l\'upload de la photo, mais l\'employé a été sauvegardé');
                }
            }

            onSave();
            onClose();
        } catch (err: any) {
            console.error('Erreur complète:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la sauvegarde';
            setError(`Erreur: ${errorMessage}`);
        } finally {
            setLoading(false);
            setUploadingPhoto(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddEnfant = () => {
        if (nouvelEnfant.nom && nouvelEnfant.dateNaissance) {
            setEnfants([...enfants, { ...nouvelEnfant }]);
            setNouvelEnfant({ nom: '', dateNaissance: '' });
        }
    };

    const handleRemoveEnfant = (index: number) => {
        const newEnfants = [...enfants];
        newEnfants.splice(index, 1);
        setEnfants(newEnfants);
    };

    const handleAddDiplome = () => {
        if (nouveauDiplome.typeDiplome && nouveauDiplome.intitule) {
            setDiplomes([...diplomes, { ...nouveauDiplome }]);
            setNouveauDiplome({ typeDiplome: '', intitule: '', ecole: '', anneeObtention: '' });
        }
    };

    const handleRemoveDiplome = (index: number) => {
        const newDiplomes = [...diplomes];
        newDiplomes.splice(index, 1);
        setDiplomes(newDiplomes);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {employe ? 'Modifier l\'employé' : 'Nouvel employé'}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100">
                        <X className="w-5 h-5"/>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    {/* Informations personnelles */}

                    {/* Informations personnelles */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <User className="w-5 h-5 mr-2"/>
                            Informations personnelles
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Matricule *</label>
                                <input
                                    type="text"
                                    name="matricule"
                                    value={formData.matricule}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nom *</label>
                                <input
                                    type="text"
                                    name="nom"
                                    value={formData.nom}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Prénom *</label>
                                <input
                                    type="text"
                                    name="prenom"
                                    value={formData.prenom}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date de naissance *</label>
                                <input
                                    type="date"
                                    name="dateNaissance"
                                    value={formData.dateNaissance}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Lieu de naissance</label>
                                <input
                                    type="text"
                                    name="lieuNaissance"
                                    value={formData.lieuNaissance}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nationalité</label>
                                <input
                                    type="text"
                                    name="nationalite"
                                    value={formData.nationalite}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">CIN</label>
                                <input
                                    type="text"
                                    name="cin"
                                    value={formData.cin}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Statut matrimonial</label>
                                <select
                                    name="statutMatrimonial"
                                    value={formData.statutMatrimonial}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="CELIBATAIRE">Célibataire</option>
                                    <option value="MARIE">Marié(e)</option>
                                    <option value="DIVORCE">Divorcé(e)</option>
                                    <option value="VEUF">Veuf/Veuve</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Numéro CNAPS</label>
                                <input
                                    type="text"
                                    name="numeroCNAPS"
                                    value={formData.numeroCNAPS}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Informations familiales pour les personnes mariées */}
                    {formData.statutMatrimonial === 'MARIE' && (
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Informations familiales</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date de mariage</label>
                                    <input
                                        type="date"
                                        name="dateMariage"
                                        value={formData.dateMariage}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nom du conjoint</label>
                                    <input
                                        type="text"
                                        name="nomConjoint"
                                        value={formData.nomConjoint}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date de naissance du conjoint</label>
                                    <input
                                        type="date"
                                        name="dateNaissanceConjoint"
                                        value={formData.dateNaissanceConjoint}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Gestion des enfants */}
                            <div className="mt-6">
                                <h4 className="text-md font-medium text-gray-900 mb-3">Enfants</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Nom</label>
                                        <input
                                            type="text"
                                            value={nouvelEnfant.nom}
                                            onChange={(e) => setNouvelEnfant({...nouvelEnfant, nom: e.target.value})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Date de naissance</label>
                                        <input
                                            type="date"
                                            value={nouvelEnfant.dateNaissance}
                                            onChange={(e) => setNouvelEnfant({...nouvelEnfant, dateNaissance: e.target.value})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddEnfant}
                                    className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Ajouter un enfant
                                </button>

                                {enfants.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        {enfants.map((enfant, index) => (
                                            <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                                                <span>{enfant.nom} - {enfant.dateNaissance}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveEnfant(index)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Diplômes et formations */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Diplômes et formations</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Type de diplôme</label>
                                <select
                                    value={nouveauDiplome.typeDiplome}
                                    onChange={(e) => setNouveauDiplome({...nouveauDiplome, typeDiplome: e.target.value})}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Sélectionner</option>
                                    <option value="CEPE">CEPE</option>
                                    <option value="BEPC">BEPC</option>
                                    <option value="BACC">BACC</option>
                                    <option value="LICENCE">Licence</option>
                                    <option value="MASTER">Master</option>
                                    <option value="DOCTORAT">Doctorat</option>
                                    <option value="AUTRE">Autre</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Intitulé</label>
                                <input
                                    type="text"
                                    value={nouveauDiplome.intitule}
                                    onChange={(e) => setNouveauDiplome({...nouveauDiplome, intitule: e.target.value})}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">École/Université</label>
                                <input
                                    type="text"
                                    value={nouveauDiplome.ecole}
                                    onChange={(e) => setNouveauDiplome({...nouveauDiplome, ecole: e.target.value})}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Année d'obtention</label>
                                <input
                                    type="number"
                                    value={nouveauDiplome.anneeObtention}
                                    onChange={(e) => setNouveauDiplome({...nouveauDiplome, anneeObtention: e.target.value})}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    min="1900"
                                    max="2100"
                                />
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleAddDiplome}
                            className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Ajouter un diplôme
                        </button>

                        {diplomes.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {diplomes.map((diplome, index) => (
                                    <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                                        <span>{diplome.typeDiplome} - {diplome.intitule} ({diplome.anneeObtention})</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveDiplome(index)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <Phone className="w-5 h-5 mr-2"/>
                            Contact
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                                <input
                                    type="tel"
                                    name="telephone"
                                    value={formData.telephone}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="md:col-span-2 lg:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">Adresse</label>
                                <textarea
                                    name="adresse"
                                    value={formData.adresse}
                                    onChange={handleChange}
                                    rows={3}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact d'urgence */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Contact d'urgence</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nom</label>
                                <input
                                    type="text"
                                    name="contactUrgenceNom"
                                    value={formData.contactUrgenceNom}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Lien</label>
                                <input
                                    type="text"
                                    name="contactUrgenceLien"
                                    value={formData.contactUrgenceLien}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                                <input
                                    type="tel"
                                    name="contactUrgenceTelephone"
                                    value={formData.contactUrgenceTelephone}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Informations familiales */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Informations familiales</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nom du père</label>
                                <input
                                    type="text"
                                    name="nomPere"
                                    value={formData.nomPere}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nom de la mère</label>
                                <input
                                    type="text"
                                    name="nomMere"
                                    value={formData.nomMere}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Informations professionnelles */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <Briefcase className="w-5 h-5 mr-2"/>
                            Informations professionnelles
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Poste *</label>
                                <select
                                    name="poste"
                                    value={formData.poste}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="PASTEUR_TITULAIRE">Pasteur titulaire</option>
                                    <option value="PASTEUR_ASSOCIE">Pasteur associé</option>
                                    <option value="EVANGELISTE">Évangéliste</option>
                                    <option value="ANCIEN">Ancien</option>
                                    <option value="MISSIONNAIRE">Missionnaire</option>
                                    <option value="ENSEIGNANT">Enseignant</option>
                                    <option value="SECRETAIRE_EXECUTIF">Secrétaire exécutif</option>
                                    <option value="TRESORIER">Trésorier</option>
                                    <option value="ASSISTANT_RH">Assistant RH</option>
                                    <option value="AUTRE">Autre</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Statut *</label>
                                <select
                                    name="statut"
                                    value={formData.statut}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="ACTIF">Actif</option>
                                    <option value="INACTIF">Inactif</option>
                                    <option value="EN_CONGE">En congé</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Type de contrat</label>
                                <select
                                    name="typeContrat"
                                    value={formData.typeContrat}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="CDI">CDI</option>
                                    <option value="CDD">CDD</option>
                                    <option value="STAGE">Stage</option>
                                    <option value="BENEVOLAT">Bénévolat</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date de début</label>
                                <input
                                    type="date"
                                    name="dateDebut"
                                    value={formData.dateDebut}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date de fin</label>
                                <input
                                    type="date"
                                    name="dateFin"
                                    value={formData.dateFin}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Organisation
                                    employeur</label>
                                <input
                                    type="text"
                                    name="organisationEmployeur"
                                    value={formData.organisationEmployeur}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 flex items-center">
                                    <DollarSign className="w-4 h-4 mr-1"/>
                                    Salaire base
                                </label>
                                <input
                                    type="number"
                                    name="salaireBase"
                                    value={formData.salaireBase}
                                    onChange={handleChange}
                                    step="0.01"
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 flex items-center">
                                    <Percent className="w-4 h-4 mr-1"/>
                                    Pourcentage salaire
                                </label>
                                <input
                                    type="number"
                                    name="pourcentageSalaire"
                                    value={formData.pourcentageSalaire}
                                    onChange={handleChange}
                                    step="0.01"
                                    max="100"
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Accréditation */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Accréditation</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date d'accréditation</label>
                                <input
                                    type="date"
                                    name="dateAccreditation"
                                    value={formData.dateAccreditation}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Niveau
                                    d'accréditation</label>
                                <select
                                    name="niveauAccreditation"
                                    value={formData.niveauAccreditation}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="LOCAL">Local</option>
                                    <option value="DISTRICT">District</option>
                                    <option value="FEDERATION">Fédération</option>
                                    <option value="UNION">Union</option>
                                    <option value="DIVISION">Division</option>
                                    <option value="CONFERENCE_GENERALE">Conférence générale</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Groupe
                                    d'accréditation</label>
                                <input
                                    type="text"
                                    name="groupeAccreditation"
                                    value={formData.groupeAccreditation}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Supervision et affectation */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Supervision et affectation</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Superviseur
                                    hiérarchique</label>
                                <input
                                    type="text"
                                    name="superviseurHierarchique"
                                    value={formData.superviseurHierarchique}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Affectation actuelle</label>
                                <input
                                    type="text"
                                    name="affectationActuelle"
                                    value={formData.affectationActuelle}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION PHOTO DE PROFIL */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <Camera className="w-5 h-5 mr-2" />
                            Photo de profil
                        </h3>
                        <div className="flex items-center space-x-6">
                            <div className="flex-shrink-0">
                                {photoPreview ? (
                                    <img
                                        src={photoPreview}
                                        alt="Preview"
                                        className="h-32 w-32 rounded-full object-cover border-2 border-gray-300"
                                    />
                                ) : (
                                    <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center border-2 border-dashed border-gray-300">
                                        <User className="h-16 w-16 text-gray-400" />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-3">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handlePhotoChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    {photoPreview ? 'Changer la photo' : 'Ajouter une photo'}
                                </button>
                                {photoPreview && (
                                    <button
                                        type="button"
                                        onClick={handleRemovePhoto}
                                        className="ml-3 inline-flex items-center px-4 py-2 bg-red-100 border border-transparent rounded-md shadow-sm text-sm font-medium text-red-700 hover:bg-red-200"
                                    >
                                        Supprimer
                                    </button>
                                )}
                                <p className="text-sm text-gray-500">
                                    PNG, JPG, JPEG jusqu'à 10MB
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-6 border-t sticky bottom-0 bg-white pb-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                        >
                            <Save className="w-4 h-4 mr-2"/>
                            {loading ? 'Sauvegarde...' : (employe ? 'Mettre à jour' : 'Créer')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeForm;