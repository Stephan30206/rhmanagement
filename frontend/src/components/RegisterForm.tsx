import React, { useState } from "react";
import { UserPlus, Upload, Camera } from "lucide-react";
import { authService, type RegisterData, userService } from "../services/api";

interface RegisterFormProps {
    onRegister: (user: any) => void;
    onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegister, onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
        nom_utilisateur: "",
        mot_de_passe: "",
        confirmPassword: "",
        email: "",
        nom: "",
        prenom: "",
        telephone: "",
        poste: "Administrateur RH FMC",
    });
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Validation
        if (formData.mot_de_passe !== formData.confirmPassword) {
            setError("Les mots de passe ne correspondent pas");
            setLoading(false);
            return;
        }

        if (formData.mot_de_passe.length < 6) {
            setError("Le mot de passe doit contenir au moins 6 caractères");
            setLoading(false);
            return;
        }

        try {
            // Créer l'objet userData pour l'inscription
            const userData: RegisterData = {
                nom_utilisateur: formData.nom_utilisateur,
                mot_de_passe: formData.mot_de_passe,
                email: formData.email,
                nom: formData.nom,
                prenom: formData.prenom,
                telephone: formData.telephone,
                poste: formData.poste,
            };

            console.log("Données envoyées:", userData);

            const response = await authService.register(userData);
            console.log("Réponse du serveur:", response);

            // Upload de la photo si elle existe
            if (photoFile && response.user.id) {
                try {
                    await userService.uploadPhoto(response.user.id, photoFile);
                } catch (uploadError) {
                    console.error('Erreur upload photo:', uploadError);
                    setError('Compte créé mais erreur lors de l\'upload de la photo');
                }
            }

            localStorage.setItem("token", response.token);
            onRegister(response.user);
        } catch (err: any) {
            console.error("Erreur d'inscription:", err);
            setError(err.response?.data?.message || err.message || "Erreur lors de l'inscription");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Bandeau bleu */}
            <div className="bg-blue-900 text-white p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold">
                    <span className="text-2xl"></span>FMC - Inscription Administrateur
                </h1>
                <button
                    onClick={onSwitchToLogin}
                    className="text-sm hover:underline"
                >
                    Connexion
                </button>
            </div>

            {/* Formulaire */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8">
                    <h2 className="text-center text-2xl font-bold mb-8 text-gray-700">
                        Création de compte Administrateur
                    </h2>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Colonne gauche */}
                            <div className="space-y-4">
                                {/* Photo de profil */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Photo de profil (optionnelle)
                                    </label>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-shrink-0">
                                            {photoPreview ? (
                                                <img
                                                    src={photoPreview}
                                                    alt="Preview"
                                                    className="h-20 w-20 rounded-full object-cover border-2 border-gray-300"
                                                />
                                            ) : (
                                                <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-dashed border-gray-300">
                                                    <Camera className="h-8 w-8 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <input
                                                type="file"
                                                onChange={handlePhotoChange}
                                                accept="image/*"
                                                className="hidden"
                                                id="photo-upload"
                                            />
                                            <label
                                                htmlFor="photo-upload"
                                                className="cursor-pointer bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                <Upload className="h-4 w-4 inline mr-1" />
                                                Choisir une photo
                                            </label>
                                            <p className="text-xs text-gray-500 mt-1">
                                                PNG, JPG, JPEG jusqu'à 10MB
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Nom */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nom *
                                    </label>
                                    <input
                                        type="text"
                                        name="nom"
                                        value={formData.nom}
                                        onChange={handleChange}
                                        required
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                {/* Prénom */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Prénom *
                                    </label>
                                    <input
                                        type="text"
                                        name="prenom"
                                        value={formData.prenom}
                                        onChange={handleChange}
                                        required
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                {/* Téléphone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Téléphone professionnel *
                                    </label>
                                    <input
                                        type="tel"
                                        name="telephone"
                                        value={formData.telephone}
                                        onChange={handleChange}
                                        required
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="+261 XX XX XXX XX"
                                    />
                                </div>
                            </div>

                            {/* Colonne droite */}
                            <div className="space-y-4">
                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email professionnel *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="admin@fmc.mg"
                                    />
                                </div>

                                {/* Poste */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Poste / Rôle *
                                    </label>
                                    <select
                                        name="poste"
                                        value={formData.poste}
                                        onChange={handleChange}
                                        required
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="Administrateur RH FMC">Administrateur RH FMC</option>
                                        <option value="Responsable RH">Responsable RH</option>
                                        <option value="Secrétaire Fédéral">Secrétaire Fédéral</option>
                                        <option value="Responsable District">Responsable District</option>
                                    </select>
                                </div>

                                {/* Nom d'utilisateur */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nom d'utilisateur *
                                    </label>
                                    <input
                                        type="text"
                                        name="nom_utilisateur"
                                        value={formData.nom_utilisateur}
                                        onChange={handleChange}
                                        required
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                {/* Mot de passe */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Mot de passe *
                                    </label>
                                    <input
                                        type="password"
                                        name="mot_de_passe"
                                        value={formData.mot_de_passe}
                                        onChange={handleChange}
                                        required
                                        minLength={6}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                {/* Confirmation mot de passe */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirmer le mot de passe *
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Bouton d'inscription */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-900 text-white py-3 rounded-md shadow hover:bg-blue-800 disabled:opacity-50 flex justify-center items-center mt-6"
                        >
                            <UserPlus className="w-5 h-5 mr-2" />
                            {loading ? "Inscription..." : "CRÉER LE COMPTE ADMINISTRATEUR"}
                        </button>
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

export default RegisterForm;