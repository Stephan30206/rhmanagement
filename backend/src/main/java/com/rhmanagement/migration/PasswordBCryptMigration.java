package com.rhmanagement.migration;

import com.rhmanagement.entity.Utilisateur;
import com.rhmanagement.repository.UtilisateurRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.regex.Pattern;

@Component
public class PasswordBCryptMigration implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(PasswordBCryptMigration.class);

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // pour ne migrer que si activé dans les props
    @Value("${app.migrate-passwords:false}")
    private boolean migrateEnabled;

    // regex d’un hash BCrypt ($2a/$2b/$2y + 60 chars)
    private static final Pattern BCRYPT_PATTERN =
            Pattern.compile("^\\$2[aby]\\$\\d{2}\\$[./A-Za-z0-9]{53}$");

    public PasswordBCryptMigration(UtilisateurRepository utilisateurRepository) {
        this.utilisateurRepository = utilisateurRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!migrateEnabled) {
            log.info("[PasswordBCryptMigration] Migration désactivée (app.migrate-passwords=false).");
            return;
        }

        log.warn("=== MIGRATION MOTS DE PASSE -> BCrypt : DEMARRAGE ===");
        int total = 0, migrated = 0, skipped = 0;

        for (Utilisateur u : utilisateurRepository.findAll()) {
            total++;
            String current = u.getMotDePasse();
            if (current == null || current.isBlank()) {
                log.warn("Utilisateur id={} nom={} : mot_de_passe vide -> ignoré",
                        u.getId(), u.getNomUtilisateur());
                skipped++;
                continue;
            }
            if (BCRYPT_PATTERN.matcher(current).matches()) {
                // déjà BCrypt
                skipped++;
                continue;
            }
            // mot de passe en clair -> encoder
            String encoded = passwordEncoder.encode(current);
            u.setMotDePasse(encoded);
            migrated++;
        }

        utilisateurRepository.flush(); // si dirty tracking actif, sinon saveAll

        log.warn("=== MIGRATION TERMINEE === total={}, migrés={}, ignorés(déjà BCrypt/vides)={}",
                total, migrated, skipped);
    }
}
