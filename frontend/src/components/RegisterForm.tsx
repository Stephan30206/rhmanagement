import React, { useState } from "react";
import { UserPlus } from "lucide-react";
import { authService } from "../services/api";

interface RegisterFormProps {
    onRegister: (user: any) => void;
    onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegister, onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        confirmPassword: "",
        email: "",
        nom: "",
        prenom: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError("Les mots de passe ne correspondent pas");
            setLoading(false);
            return;
        }

        try {
            const userData = {
                username: formData.username,
                password: formData.password,
                email: formData.email,
                nom: formData.nom,
                prenom: formData.prenom,
            };

            const response = await authService.register(userData);
            localStorage.setItem("token", response.token);
            onRegister(response.user);
        } catch (err: any) {
            setError(err.response?.data?.message || "Erreur lors de l'inscription");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                    <span className="text-2xl"></span>FMC
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
                        Créez votre compte Gestion RH
                    </h2>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Nom */}
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
                            />
                        </div>

                        {/* Prénom */}
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
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full border-b border-gray-400 focus:border-blue-700 focus:outline-none py-2"
                            />
                        </div>

                        {/* Username */}
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">
                                Nom d'utilisateur
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                className="w-full border-b border-gray-400 focus:border-blue-700 focus:outline-none py-2"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">
                                Mot de passe
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={6}
                                className="w-full border-b border-gray-400 focus:border-blue-700 focus:outline-none py-2"
                            />
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">
                                Confirmer le mot de passe
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className="w-full border-b border-gray-400 focus:border-blue-700 focus:outline-none py-2"
                            />
                        </div>

                        {/* Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-900 text-white py-3 rounded shadow hover:bg-blue-800 disabled:opacity-50 flex justify-center items-center mt-6"
                        >
                            <UserPlus className="w-4 h-4 mr-2" />
                            {loading ? "Inscription..." : "S'INSCRIRE"}
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