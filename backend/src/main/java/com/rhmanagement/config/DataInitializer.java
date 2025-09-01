// DataInitializer.java
package com.rhmanagement.config;

import com.rhmanagement.entity.Utilisateur;
import com.rhmanagement.repository.UtilisateurRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UtilisateurRepository utilisateurRepository, PasswordEncoder passwordEncoder) {
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Vérifier si l'admin existe déjà
        if (utilisateurRepository.findByNomUtilisateur("admin").isEmpty()) {
            Utilisateur admin = new Utilisateur();
            admin.setNomUtilisateur("admin");
            admin.setMotDePasse(passwordEncoder.encode("admin123"));
            admin.setEmail("admin@fmc.mg");
            admin.setNom("Administrateur");
            admin.setPrenom("Système");
            admin.setRole(Utilisateur.Role.ADMIN);
            admin.setActif(true);

            utilisateurRepository.save(admin);
            System.out.println("Admin utilisateur créé avec succès");
        }
    }
}