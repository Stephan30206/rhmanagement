package com.rhmanagement.service;

import com.rhmanagement.entity.Utilisateur;
import com.rhmanagement.repository.UtilisateurRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@Slf4j
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

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
        // Vérifier si l'email existe déjà
        if (utilisateurRepository.existsByEmail(utilisateur.getEmail())) {
            throw new RuntimeException("Un utilisateur avec cet email existe déjà");
        }

        // Vérifier si le nom d'utilisateur existe déjà
        if (utilisateurRepository.existsByNomUtilisateur(utilisateur.getNomUtilisateur())) {
            throw new RuntimeException("Ce nom d'utilisateur est déjà pris");
        }

        // Encoder le mot de passe avant de sauvegarder
        utilisateur.setMotDePasse(passwordEncoder.encode(utilisateur.getMotDePasse()));
        return utilisateurRepository.save(utilisateur);
    }

    // Méthode pour initialiser un admin par défaut
    public void initDefaultAdmin() {
        if (utilisateurRepository.count() == 0) {
            Utilisateur admin = new Utilisateur();
            admin.setNomUtilisateur("admin");
            admin.setMotDePasse("admin123");
            admin.setEmail("admin@fmc.mg");
            admin.setNom("Administrateur");
            admin.setPrenom("Système");
            admin.setTelephone("+261 XX XX XXX XX");
            admin.setPoste("Administrateur RH FMC");
            admin.setRole(Utilisateur.Role.ADMIN);
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

    public Utilisateur updateUser(Long id, Utilisateur userDetails) {
        Optional<Utilisateur> userOpt = utilisateurRepository.findById(id);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Utilisateur non trouvé");
        }

        Utilisateur user = userOpt.get();

        // Mettre à jour les champs
        if (userDetails.getNom() != null) user.setNom(userDetails.getNom());
        if (userDetails.getPrenom() != null) user.setPrenom(userDetails.getPrenom());
        if (userDetails.getEmail() != null) user.setEmail(userDetails.getEmail());
        if (userDetails.getTelephone() != null) user.setTelephone(userDetails.getTelephone());
        if (userDetails.getPoste() != null) user.setPoste(userDetails.getPoste());
        if (userDetails.getPhotoProfil() != null) user.setPhotoProfil(userDetails.getPhotoProfil());
        if (userDetails.getRole() != null) user.setRole(userDetails.getRole());

        return utilisateurRepository.save(user);
    }

    public Optional<Utilisateur> findByEmail(String email) {
        return utilisateurRepository.findByEmail(email);
    }


}