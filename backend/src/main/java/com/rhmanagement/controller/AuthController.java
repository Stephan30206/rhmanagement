package com.rhmanagement.controller;

import com.rhmanagement.entity.Utilisateur;
import com.rhmanagement.repository.UtilisateurRepository;
import com.rhmanagement.service.AuthService;
import com.rhmanagement.service.UtilisateurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Map;

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
    public ResponseEntity<Utilisateur> getCurrentUser() {
        try {
            Utilisateur user = authService.getCurrentUser();
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<Utilisateur> updateProfile(@RequestBody Utilisateur userDetails) {
        try {
            Utilisateur updatedUser = authService.updateProfile(userDetails);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> passwords) {
        try {
            authService.changePassword(
                    passwords.get("currentPassword"),
                    passwords.get("newPassword")
            );
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/upload-photo")
    public ResponseEntity<?> uploadProfilePhoto(@RequestParam("file") MultipartFile file) {
        try {
            Utilisateur user = authService.uploadProfilePhoto(file);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}