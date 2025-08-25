package com.rhmanagement.service;

import com.rhmanagement.entity.Utilisateur;
import com.rhmanagement.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    // Utilisation de l'injection par constructeur (recommandée)
    @Autowired
    public UtilisateurService(UtilisateurRepository utilisateurRepository,
                              PasswordEncoder passwordEncoder) {
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Optional<Utilisateur> findByNomUtilisateur(String nomUtilisateur) {
        return utilisateurRepository.findByNomUtilisateur(nomUtilisateur);
    }

    public Utilisateur createUser(Utilisateur utilisateur) {
        // Encoder le mot de passe avant de sauvegarder
        utilisateur.setMotDePasse(passwordEncoder.encode(utilisateur.getMotDePasse()));
        return utilisateurRepository.save(utilisateur);
    }

    // Méthode pour initialiser un admin par défaut
    public void initDefaultAdmin() {
        if (utilisateurRepository.count() == 0) {
            Utilisateur admin = new Utilisateur();
            admin.setNomUtilisateur("admin");
            admin.setMotDePasse("admin123"); // sera encrypté par createUser
            admin.setEmail("admin@fmc.mg");
            admin.setRole(Utilisateur.Role.ADMIN); // Utilisation directe de l'enum
            admin.setActif(true);

            createUser(admin);
            System.out.println("Admin utilisateur créé: admin / admin123");
        }
    }

    // Méthodes supplémentaires utiles
    public boolean existsByNomUtilisateur(String nomUtilisateur) {
        return utilisateurRepository.findByNomUtilisateur(nomUtilisateur).isPresent();
    }

    public Optional<Utilisateur> findById(Long id) {
        return utilisateurRepository.findById(id);
    }

    public void deleteUser(Long id) {
        utilisateurRepository.deleteById(id);
    }
}