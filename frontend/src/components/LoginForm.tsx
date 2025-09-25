import React, {useState} from "react";
import {LogIn} from "lucide-react";
import {authService} from "../services/api";

interface LoginFormProps {
    onLogin: (user: any) => void,
    onSwitchToRegister?: () => void
}

const LoginForm: React.FC<LoginFormProps> = ({onLogin, onSwitchToRegister }) => {
    const [formData, setFormData] = useState({
        nomUtilisateur: "",
        motDePasse: "",
        remember: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

// Dans LoginForm.tsx - CORRECTION de handleSubmit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const loginData = {
                nomUtilisateur: formData.nomUtilisateur,
                motDePasse: formData.motDePasse,
            };

            const response = await authService.login(loginData);

            if (!response.token) {
                throw new Error('Token manquant dans la réponse');
            }

            // ✅ Stockage du token et du user
            localStorage.setItem("token", response.token);
            if (response.user) {
                localStorage.setItem("user", JSON.stringify(response.user));
            }

            // ✅ Mise à jour App
            onLogin(response.user || response);

        } catch (err: any) {
            const errorMessage = err.response?.data?.error ||
                err.response?.data?.message ||
                err.message ||
                "Erreur de connexion";
            setError(errorMessage);
            console.error('Erreur connexion:', err);
        } finally {
            setLoading(false);
        }
    };


    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const {name, value, type, checked} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
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
                    onClick={onSwitchToRegister}
                    className="text-sm hover:underline"
                >
                    Inscription
                </button>
            </div>

            {/* Formulaire */}
            <div className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-md px-8">
                    <h2 className="text-center text-xl font-medium mb-8 text-gray-700">
                        Connectez-vous pour accéder à Gestion RH
                    </h2>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Username */}
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">
                                Nom d'utilisateur ou email
                            </label>
                            <input
                                type="text"
                                name="nomUtilisateur"
                                value={formData.nomUtilisateur}
                                onChange={handleChange}
                                required
                                className="w-full border-b border-gray-400 focus:border-blue-700 focus:outline-none py-2"
                                placeholder="Votre nom d'utilisateur ou email"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">
                                Mot de passe
                            </label>
                            <input
                                type="password"
                                name="motDePasse"
                                value={formData.motDePasse}
                                onChange={handleChange}
                                required
                                className="w-full border-b border-gray-400 focus:border-blue-700 focus:outline-none py-2"
                                placeholder="Votre mot de passe"
                            />
                        </div>

                        {/* Remember me */}
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                name="remember"
                                checked={formData.remember}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-700"
                            />
                            <span className="text-sm text-gray-600">
                                Se souvenir de moi
                            </span>
                        </div>

                        {/* Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-900 text-white py-3 rounded shadow hover:bg-blue-800 disabled:opacity-50 flex justify-center items-center"
                        >
                            <LogIn className="w-4 h-4 mr-2"/>
                            {loading ? "Connexion..." : "CONNECTEZ-VOUS"}
                        </button>
                    </form>

                    {/* Forgot password */}
                    <div className="mt-6 text-center">
                        <a
                            href="#"
                            className="text-sm text-gray-600 hover:underline"
                        >
                            J'AI OUBLIÉ MON MOT DE PASSE.
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;