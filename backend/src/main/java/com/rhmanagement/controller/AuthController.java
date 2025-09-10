package com.rhmanagement.controller;

import com.rhmanagement.entity.Utilisateur;
import com.rhmanagement.repository.UtilisateurRepository;
import com.rhmanagement.service.AuthService;
import com.rhmanagement.service.UtilisateurService;
import com.rhmanagement.service.FileStorageService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UtilisateurService utilisateurService;

    @Autowired
    private FileStorageService fileStorageService;

    @PostMapping("/test")
    public ResponseEntity<?> test(@RequestBody Map<String, Object> data) {
        System.out.println("Données reçues : " + data);
        return ResponseEntity.ok(Map.of("message", "Test réussi", "received", data));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Utilisateur utilisateurRequest) {
        try {
            // Vérifier si l'email existe déjà
            if (utilisateurRepository.findByEmail(utilisateurRequest.getEmail()).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email déjà utilisé"));
            }

            // Vérifier si le nom d'utilisateur existe déjà
            if (utilisateurRepository.findByNomUtilisateur(utilisateurRequest.getNomUtilisateur()).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Nom d'utilisateur déjà utilisé"));
            }

            // Hasher le mot de passe
            String encodedPassword = passwordEncoder.encode(utilisateurRequest.getMotDePasse());

            // Créer un nouvel utilisateur
            Utilisateur utilisateur = new Utilisateur();
            utilisateur.setNomUtilisateur(utilisateurRequest.getNomUtilisateur());
            utilisateur.setMotDePasse(encodedPassword);
            utilisateur.setEmail(utilisateurRequest.getEmail());
            utilisateur.setNom(utilisateurRequest.getNom());
            utilisateur.setPrenom(utilisateurRequest.getPrenom());
            utilisateur.setTelephone(utilisateurRequest.getTelephone());
            utilisateur.setDateInscription(LocalDateTime.now());
            utilisateur.setStatut("ACTIF");

            // Définir le rôle (avec valeur par défaut si null)
            if (utilisateurRequest.getRole() != null) {
                utilisateur.setRole(utilisateurRequest.getRole());
            } else {
                utilisateur.setRole(Utilisateur.Role.ADMIN); // Valeur par défaut
            }

            // Sauvegarder en base
            Utilisateur savedUser = utilisateurRepository.save(utilisateur);

            return ResponseEntity.ok(savedUser);

        } catch (Exception e) {
            e.printStackTrace(); // Pour le débogage
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Erreur lors de l'inscription: " + e.getMessage())
            );
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        try {
            String identifiant = credentials.get("nomUtilisateur");
            String password = credentials.get("motDePasse");

            if (identifiant == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Identifiant et mot de passe requis"));
            }

            // Utilisez votre AuthService pour l'authentification
            Utilisateur user = authService.authenticate(identifiant, password);

            // Retournez l'utilisateur
            return ResponseEntity.ok(user);

        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<Utilisateur> getCurrentUser(Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<Utilisateur> userOptional = utilisateurRepository.findByNomUtilisateur(username);

            if (userOptional.isEmpty()) {
                return ResponseEntity.status(404).build();
            }

            return ResponseEntity.ok(userOptional.get());
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestBody ProfileUpdateRequest request,
            Authentication authentication) {

        try {
            String username = authentication.getName();
            Utilisateur user = utilisateurRepository.findByNomUtilisateur(username)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            // Mettre à jour les champs
            if (request.getNom() != null) user.setNom(request.getNom());
            if (request.getPrenom() != null) user.setPrenom(request.getPrenom());
            if (request.getEmail() != null) user.setEmail(request.getEmail());
            if (request.getTelephone() != null) user.setTelephone(request.getTelephone());
            if (request.getPoste() != null) user.setPoste(request.getPoste());

            Utilisateur updatedUser = utilisateurRepository.save(user);

            return ResponseEntity.ok(updatedUser);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Erreur lors de la mise à jour: " + e.getMessage()
            ));
        }
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody Map<String, String> passwords,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            Utilisateur user = utilisateurRepository.findByNomUtilisateur(username)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            String currentPassword = passwords.get("currentPassword");
            String newPassword = passwords.get("newPassword");

            // Vérifier l'ancien mot de passe
            if (!passwordEncoder.matches(currentPassword, user.getMotDePasse())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Mot de passe actuel incorrect"));
            }

            // Hasher et sauvegarder le nouveau mot de passe
            user.setMotDePasse(passwordEncoder.encode(newPassword));
            utilisateurRepository.save(user);

            return ResponseEntity.ok().body(Map.of("message", "Mot de passe modifié avec succès"));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping(value = "/upload-photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadProfilePhoto(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        try {
            String username = authentication.getName();
            Utilisateur user = utilisateurRepository.findByNomUtilisateur(username)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            // Sauvegarder le fichier
            String fileName = fileStorageService.storeFile(file);

            // Mettre à jour le profil utilisateur
            user.setPhotoProfil(fileName);
            Utilisateur updatedUser = utilisateurRepository.save(user);

            return ResponseEntity.ok().body(Map.of(
                    "message", "Photo uploadée avec succès",
                    "fileName", fileName,
                    "user", updatedUser
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Erreur lors de l'upload: " + e.getMessage()
            ));
        }
    }

    // Classe pour la requête de mise à jour du profil
    @Data
    public static class ProfileUpdateRequest {
        private String nom;
        private String prenom;
        private String email;
        private String telephone;
        private String poste;
    }
}