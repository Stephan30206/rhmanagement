import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthContainer: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);

    const handleLogin = (user: any) => {
        console.log('Utilisateur connecté:', user);
        // Redirigez vers le dashboard ou page d'accueil
        window.location.href = '/dashboard';
    };

    const handleRegister = (user: any) => {
        console.log('Utilisateur inscrit:', user);
        // Après inscription réussie, redirigez vers login ou connectez automatiquement
        alert('Inscription réussie ! Vous pouvez maintenant vous connecter.');
        setIsLogin(true);
    };

    if (isLogin) {
        return (
            <LoginForm
                onLogin={handleLogin}
                onSwitchToRegister={() => setIsLogin(false)}
            />
        );
    }

    return (
        <RegisterForm
            onRegister={handleRegister}
            onSwitchToLogin={() => setIsLogin(true)}
        />
    );
};

export default AuthContainer;