import React, { useState } from "react";
import { UserPlus, User, Mail, Lock, Phone, MapPin, Calendar, Briefcase, ArrowRight, ArrowLeft } from "lucide-react";
import { authService, type RegisterData } from "../services/api";

interface RegisterFormProps {
    onRegister: (user: any) => void;
    onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegister, onSwitchToLogin }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        // Étape 1: Informations de base
        nomUtilisateur: "",
        email: "",
        motDePasse: "",
        confirmPassword: "",

        // Étape 2: Informations personnelles
        nom: "",
        prenom: "",
        telephone: "",
        genre: "",
        dateNaissance: "",

        // Étape 3: Informations professionnelles
        poste: "ADMIN",
        adresse: ""
    });

    const steps = [
        { number: 1, title: "Compte", icon: User },
        { number: 2, title: "Personnel", icon: User },
        { number: 3, title: "Profession", icon: Briefcase }
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateStep = (step: number): boolean => {
        setError("");

        if (step === 1) {
            if (!formData.nomUtilisateur || !formData.email || !formData.motDePasse || !formData.confirmPassword) {
                setError("Veuillez remplir tous les champs obligatoires");
                return false;
            }
            if (formData.motDePasse.length < 6) {
                setError("Le mot de passe doit contenir au moins 6 caractères");
                return false;
            }
            if (formData.motDePasse !== formData.confirmPassword) {
                setError("Les mots de passe ne correspondent pas");
                return false;
            }
        }

        if (step === 2) {
            if (!formData.nom || !formData.prenom) {
                setError("Le nom et le prénom sont obligatoires");
                return false;
            }
        }

        return true;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const prevStep = () => {
        setError("");
        setCurrentStep(prev => prev - 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!validateStep(3)) {
            setLoading(false);
            return;
        }

        try {
            const userData: RegisterData = {
                nomUtilisateur: formData.nomUtilisateur,
                motDePasse: formData.motDePasse,
                email: formData.email,
                nom: formData.nom,
                prenom: formData.prenom,
                telephone: formData.telephone,
                poste: formData.poste,
                adresse: formData.adresse,
                dateNaissance: formData.dateNaissance,
                genre: formData.genre,
                statut: "ACTIF",
                actif: true
            };

            const response = await authService.register(userData);
            onRegister(response);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Erreur lors de l'inscription");
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                                <User className="w-4 h-4 mr-1" />
                                <span>Nom d'utilisateur</span>
                            </div>
                            <input
                                type="text"
                                name="nomUtilisateur"
                                value={formData.nomUtilisateur}
                                onChange={handleChange}
                                required
                                className="w-full border-b border-gray-400 focus:border-blue-700 focus:outline-none py-2"
                                placeholder="Votre nom d'utilisateur"
                            />
                        </div>

                        <div>
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                                <Mail className="w-4 h-4 mr-1" />
                                <span>Email professionnel</span>
                            </div>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full border-b border-gray-400 focus:border-blue-700 focus:outline-none py-2"
                                placeholder="admin@fmc.mg"
                            />
                        </div>

                        <div>
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                                <Lock className="w-4 h-4 mr-1" />
                                <span>Mot de passe</span>
                            </div>
                            <input
                                type="password"
                                name="motDePasse"
                                value={formData.motDePasse}
                                onChange={handleChange}
                                required
                                minLength={6}
                                className="w-full border-b border-gray-400 focus:border-blue-700 focus:outline-none py-2"
                                placeholder="Votre mot de passe"
                            />
                        </div>

                        <div>
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                                <Lock className="w-4 h-4 mr-1" />
                                <span>Confirmer le mot de passe</span>
                            </div>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className="w-full border-b border-gray-400 focus:border-blue-700 focus:outline-none py-2"
                                placeholder="Confirmez votre mot de passe"
                            />
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                    Prénom
                                </label>
                                <input
                                    type="text"
                                    name="prenom"
                                    value={formData.prenom}
                                    onChange={handleChange}
                                    required
                                    className="w-full border-b border-gray-400 focus:border-blue-700 focus:outline-none py-2"
                                    placeholder="Votre prénom"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                    Nom
                                </label>
                                <input
                                    type="text"
                                    name="nom"
                                    value={formData.nom}
                                    onChange={handleChange}
                                    required
                                    className="w-full border-b border-gray-400 focus:border-blue-700 focus:outline-none py-2"
                                    placeholder="Votre nom"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                                <User className="w-4 h-4 mr-1" />
                                <span>Genre</span>
                            </div>
                            <select
                                name="genre"
                                value={formData.genre}
                                onChange={handleChange}
                                className="w-full border-b border-gray-400 focus:border-blue-700 focus:outline-none py-2 bg-transparent"
                            >
                                <option value="">Sélectionnez votre genre</option>
                                <option value="M">Masculin</option>
                                <option value="F">Féminin</option>
                            </select>
                        </div>

                        <div>
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                                <Calendar className="w-4 h-4 mr-1" />
                                <span>Date de naissance</span>
                            </div>
                            <input
                                type="date"
                                name="dateNaissance"
                                value={formData.dateNaissance}
                                onChange={handleChange}
                                className="w-full border-b border-gray-400 focus:border-blue-700 focus:outline-none py-2"
                            />
                        </div>

                        <div>
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                                <Phone className="w-4 h-4 mr-1" />
                                <span>Téléphone</span>
                            </div>
                            <input
                                type="tel"
                                name="telephone"
                                value={formData.telephone}
                                onChange={handleChange}
                                className="w-full border-b border-gray-400 focus:border-blue-700 focus:outline-none py-2"
                                placeholder="+261 XX XX XXX XX"
                            />
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                                <Briefcase className="w-4 h-4 mr-1" />
                                <span>Poste</span>
                            </div>
                            <select
                                name="poste"
                                value={formData.poste}
                                onChange={handleChange}
                                required
                                className="w-full border-b border-gray-400 focus:border-blue-700 focus:outline-none py-2 bg-transparent"
                            >
                                <option value="ADMIN">Administrateur RH FMC</option>
                                <option value="ASSISTANT_RH">Assistant RH</option>
                                <option value="SECRETAIRE_FEDERAL">Secrétaire Fédéral</option>
                                <option value="RESPONSABLE_DISTRICT">Responsable District</option>
                            </select>
                        </div>

                        <div>
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                                <MapPin className="w-4 h-4 mr-1" />
                                <span>Adresse</span>
                            </div>
                            <input
                                type="text"
                                name="adresse"
                                value={formData.adresse}
                                onChange={handleChange}
                                className="w-full border-b border-gray-400 focus:border-blue-700 focus:outline-none py-2"
                                placeholder="Votre adresse complète"
                            />
                        </div>

                        <div className="bg-blue-50 p-4 rounded border border-blue-200">
                            <h4 className="font-medium text-blue-900 mb-2 text-sm">Récapitulatif</h4>
                            <div className="text-xs text-blue-800 space-y-1">
                                <p><strong>Nom d'utilisateur:</strong> {formData.nomUtilisateur}</p>
                                <p><strong>Email:</strong> {formData.email}</p>
                                <p><strong>Nom complet:</strong> {formData.prenom} {formData.nom}</p>
                                <p><strong>Poste:</strong> {formData.poste === 'ADMIN' ? 'Administrateur RH FMC' : 'Assistant RH'}</p>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Bandeau bleu identique au login */}
            <div className="bg-blue-900 text-white p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold">
                    <span className="text-2xl"></span>FMC - Inscription
                </h1>
                <button
                    onClick={onSwitchToLogin}
                    className="text-sm hover:underline"
                >
                    Connexion
                </button>
            </div>

            {/* Formulaire */}
            <div className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-md px-8">
                    <h2 className="text-center text-xl font-medium mb-8 text-gray-700">
                        Création de compte Administrateur
                    </h2>

                    {/* Indicateur de progression */}
                    <div className="flex justify-center mb-6">
                        <div className="flex items-center space-x-2">
                            {steps.map((step, index) => {
                                return (
                                    <div key={step.number} className="flex items-center">
                                        <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm ${
                                            currentStep >= step.number
                                                ? 'bg-blue-900 border-blue-900 text-white'
                                                : 'border-gray-300 text-gray-500'
                                        }`}>
                                            {currentStep > step.number ? <ArrowRight size={14} /> : step.number}
                                        </div>
                                        {index < steps.length - 1 && (
                                            <div className={`w-8 h-0.5 mx-1 ${
                                                currentStep > step.number ? 'bg-blue-900' : 'bg-gray-300'
                                            }`} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {renderStep()}

                        <div className="flex justify-between pt-4">
                            <div>
                                {currentStep > 1 && (
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-1" />
                                        Précédent
                                    </button>
                                )}
                            </div>

                            <div>
                                {currentStep < steps.length ? (
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        className="flex items-center text-sm text-blue-900 hover:text-blue-700 font-medium"
                                    >
                                        Suivant
                                        <ArrowRight className="w-4 h-4 ml-1" />
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-blue-900 text-white py-3 rounded shadow hover:bg-blue-800 disabled:opacity-50 flex justify-center items-center"
                                    >
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        {loading ? "Création..." : "CRÉER LE COMPTE"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={onSwitchToLogin}
                            className="text-sm text-gray-600 hover:underline"
                        >
                            Déjà un compte ? Connectez-vous
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// @ts-ignore
export default RegisterForm;