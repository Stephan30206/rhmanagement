package com.rhmanagement.controller;

import com.rhmanagement.entity.Utilisateur;
import com.rhmanagement.repository.UtilisateurRepository;
import com.rhmanagement.security.JwtUtil;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
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

    private final JwtUtil jwtUtil;

    @Autowired
    private UtilisateurService utilisateurService;

    @Autowired
    private FileStorageService fileStorageService;

    public AuthController(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    // Endpoint de santé
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "Authentication Service",
                "timestamp", LocalDateTime.now()
        ));
    }


    // Endpoint OPTIONS pour CORS
    @RequestMapping(method = RequestMethod.OPTIONS)
    public ResponseEntity<?> options() {
        return ResponseEntity.ok().build();
    }

    // Endpoints multiples pour change-password
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody Map<String, String> passwords,
            Authentication authentication) {
        return processChangePassword(passwords, authentication);
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePasswordShort(
            @RequestBody Map<String, String> passwords,
            Authentication authentication) {
        return processChangePassword(passwords, authentication);
    }

    @PostMapping("/password")
    public ResponseEntity<?> changePasswordPost(
            @RequestBody Map<String, String> passwords,
            Authentication authentication) {
        return processChangePassword(passwords, authentication);
    }

    // Méthode commune pour le changement de mot de passe
    private ResponseEntity<?> processChangePassword(
            Map<String, String> passwords,
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

    // Les autres méthodes existantes restent inchangées...
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> request) {
        try {
            String token = request.get("token");

            if (token == null || token.isEmpty()) {
                return ResponseEntity.badRequest().body("Token manquant");
            }

            if (!jwtUtil.isTokenValid(token)) {
                return ResponseEntity.status(401).body("Token expiré ou invalide");
            }

            String newToken = jwtUtil.refreshToken(token);

            Map<String, String> response = new HashMap<>();
            response.put("token", newToken);
            response.put("type", "Bearer");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(401).body("Erreur de rafraîchissement: " + e.getMessage());
        }
    }

    @PostMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestBody Map<String, String> request) {
        try {
            String token = request.get("token");

            if (token == null || token.isEmpty()) {
                return ResponseEntity.badRequest().body("Token manquant");
            }

            boolean isValid = jwtUtil.isTokenValid(token);
            boolean isExpiringSoon = jwtUtil.isTokenExpiringSoon(token, 5);

            Map<String, Object> response = new HashMap<>();
            response.put("valid", isValid);
            response.put("expiringSoon", isExpiringSoon);

            if (isValid) {
                response.put("username", jwtUtil.extractUsername(token));
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(401).body("Token invalide");
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Non authentifié"));
            }

            String username = authentication.getName();
            Optional<Utilisateur> userOptional = utilisateurRepository.findByNomUtilisateur(username);

            if (userOptional.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Utilisateur non trouvé"));
            }

            Utilisateur user = userOptional.get();

            Map<String, Object> userData = new HashMap<>();
            userData.put("id", user.getId());
            userData.put("nomUtilisateur", user.getNomUtilisateur());
            userData.put("email", user.getEmail());
            userData.put("nom", user.getNom());
            userData.put("prenom", user.getPrenom());
            userData.put("telephone", user.getTelephone());
            userData.put("poste", user.getPoste());
            userData.put("photoProfil", user.getPhotoProfil());
            userData.put("adresse", user.getAdresse());
            userData.put("dateNaissance", user.getDateNaissance());
            userData.put("genre", user.getGenre());
            userData.put("role", user.getRole());
            userData.put("dateInscription", user.getDateInscription());
            userData.put("statut", user.getStatut());
            userData.put("actif", user.getActif());
            userData.put("dateCreation", user.getDateCreation());

            return ResponseEntity.ok(userData);

        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Erreur d'authentification"));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<Utilisateur> userOptional = utilisateurRepository.findByNomUtilisateur(username);

            if (userOptional.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Utilisateur non trouvé"));
            }

            Utilisateur user = userOptional.get();

            Map<String, Object> safeUser = new HashMap<>();
            safeUser.put("id", user.getId());
            safeUser.put("nomUtilisateur", user.getNomUtilisateur());
            safeUser.put("email", user.getEmail());
            safeUser.put("nom", user.getNom());
            safeUser.put("prenom", user.getPrenom());
            safeUser.put("telephone", user.getTelephone());
            safeUser.put("poste", user.getPoste());
            safeUser.put("photoProfil", user.getPhotoProfil());
            safeUser.put("adresse", user.getAdresse());
            safeUser.put("dateNaissance", user.getDateNaissance());
            safeUser.put("genre", user.getGenre());
            safeUser.put("role", user.getRole());
            safeUser.put("dateInscription", user.getDateInscription());
            safeUser.put("statut", user.getStatut());
            safeUser.put("actif", user.getActif());
            safeUser.put("dateCreation", user.getDateCreation());

            return ResponseEntity.ok(safeUser);

        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Erreur lors de la récupération du profil"));
        }
    }

    @PostMapping("/test")
    public ResponseEntity<?> test(@RequestBody Map<String, Object> data) {
        System.out.println("Données reçues : " + data);
        return ResponseEntity.ok(Map.of("message", "Test réussi", "received", data));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Utilisateur utilisateurRequest) {
        try {
            System.out.println("Données reçues pour inscription: " + utilisateurRequest.toString());

            if (utilisateurRepository.findByEmail(utilisateurRequest.getEmail()).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email déjà utilisé"));
            }

            if (utilisateurRepository.findByNomUtilisateur(utilisateurRequest.getNomUtilisateur()).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Nom d'utilisateur déjà utilisé"));
            }

            String encodedPassword = passwordEncoder.encode(utilisateurRequest.getMotDePasse());

            Utilisateur utilisateur = new Utilisateur();
            utilisateur.setNomUtilisateur(utilisateurRequest.getNomUtilisateur());
            utilisateur.setMotDePasse(encodedPassword);
            utilisateur.setEmail(utilisateurRequest.getEmail());
            utilisateur.setNom(utilisateurRequest.getNom());
            utilisateur.setPrenom(utilisateurRequest.getPrenom());
            utilisateur.setTelephone(utilisateurRequest.getTelephone());
            utilisateur.setPoste(utilisateurRequest.getPoste());
            utilisateur.setDateInscription(LocalDateTime.now());
            utilisateur.setStatut("ACTIF");

            utilisateur.setAdresse(utilisateurRequest.getAdresse());
            utilisateur.setDateNaissance(utilisateurRequest.getDateNaissance());
            utilisateur.setGenre(utilisateurRequest.getGenre());

            if (utilisateurRequest.getRole() != null) {
                utilisateur.setRole(utilisateurRequest.getRole());
            } else {
                utilisateur.setRole(Utilisateur.Role.ADMIN);
            }

            Utilisateur savedUser = utilisateurRepository.save(utilisateur);

            System.out.println("Utilisateur créé avec succès: " + savedUser.getId());
            return ResponseEntity.ok(savedUser);

        } catch (Exception e) {
            e.printStackTrace();
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

            Utilisateur user = authService.authenticate(identifiant, password);

            String token = jwtUtil.generateToken(user.getNomUtilisateur());

            Map<String, Object> safeUser = new HashMap<>();
            safeUser.put("id", user.getId());
            safeUser.put("nomUtilisateur", user.getNomUtilisateur());
            safeUser.put("email", user.getEmail());
            safeUser.put("nom", user.getNom());
            safeUser.put("prenom", user.getPrenom());
            safeUser.put("telephone", user.getTelephone());
            safeUser.put("poste", user.getPoste());
            safeUser.put("photoProfil", user.getPhotoProfil());
            safeUser.put("adresse", user.getAdresse());
            safeUser.put("dateNaissance", user.getDateNaissance());
            safeUser.put("genre", user.getGenre());
            safeUser.put("role", user.getRole());
            safeUser.put("dateInscription", user.getDateInscription());
            safeUser.put("statut", user.getStatut());
            safeUser.put("actif", user.getActif());
            safeUser.put("dateCreation", user.getDateCreation());

            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "user", safeUser
            ));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
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

            if (request.getNom() != null) user.setNom(request.getNom());
            if (request.getPrenom() != null) user.setPrenom(request.getPrenom());
            if (request.getEmail() != null) user.setEmail(request.getEmail());
            if (request.getTelephone() != null) user.setTelephone(request.getTelephone());
            if (request.getPoste() != null) user.setPoste(request.getPoste());
            if (request.getAdresse() != null) user.setAdresse(request.getAdresse());
            if (request.getDateNaissance() != null) user.setDateNaissance(LocalDate.parse(request.getDateNaissance()));
            if (request.getGenre() != null) user.setGenre(request.getGenre());

            Utilisateur updatedUser = utilisateurRepository.save(user);

            Map<String, Object> safeUser = new HashMap<>();
            safeUser.put("id", updatedUser.getId());
            safeUser.put("nomUtilisateur", updatedUser.getNomUtilisateur());
            safeUser.put("email", updatedUser.getEmail());
            safeUser.put("nom", updatedUser.getNom());
            safeUser.put("prenom", updatedUser.getPrenom());
            safeUser.put("telephone", updatedUser.getTelephone());
            safeUser.put("poste", updatedUser.getPoste());
            safeUser.put("photoProfil", updatedUser.getPhotoProfil());
            safeUser.put("adresse", updatedUser.getAdresse());
            safeUser.put("dateNaissance", updatedUser.getDateNaissance());
            safeUser.put("genre", updatedUser.getGenre());
            safeUser.put("role", updatedUser.getRole());
            safeUser.put("dateInscription", updatedUser.getDateInscription());
            safeUser.put("statut", updatedUser.getStatut());
            safeUser.put("actif", updatedUser.getActif());
            safeUser.put("dateCreation", updatedUser.getDateCreation());

            return ResponseEntity.ok(safeUser);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Erreur lors de la mise à jour: " + e.getMessage()
            ));
        }
    }

    @PostMapping(value = "/upload-photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadProfilePhoto(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        try {
            // Utilisez le service AuthService au lieu de FileStorageService
            Utilisateur updatedUser = authService.uploadProfilePhoto(file);

            // Retourner une version sécurisée
            Map<String, Object> safeUser = new HashMap<>();
            safeUser.put("id", updatedUser.getId());
            safeUser.put("nomUtilisateur", updatedUser.getNomUtilisateur());
            safeUser.put("email", updatedUser.getEmail());
            safeUser.put("nom", updatedUser.getNom());
            safeUser.put("prenom", updatedUser.getPrenom());
            safeUser.put("telephone", updatedUser.getTelephone());
            safeUser.put("poste", updatedUser.getPoste());
            safeUser.put("photoProfil", updatedUser.getPhotoProfil());
            safeUser.put("adresse", updatedUser.getAdresse());
            safeUser.put("dateNaissance", updatedUser.getDateNaissance());
            safeUser.put("genre", updatedUser.getGenre());
            safeUser.put("role", updatedUser.getRole());
            safeUser.put("dateInscription", updatedUser.getDateInscription());
            safeUser.put("statut", updatedUser.getStatut());
            safeUser.put("actif", updatedUser.getActif());
            safeUser.put("dateCreation", updatedUser.getDateCreation());

            return ResponseEntity.ok().body(Map.of(
                    "message", "Photo uploadée avec succès",
                    "user", safeUser
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Erreur lors de l'upload: " + e.getMessage()
            ));
        }
    }

    @Data
    public static class ProfileUpdateRequest {
        private String nom;
        private String prenom;
        private String email;
        private String telephone;
        private String poste;
        private String adresse;
        private String dateNaissance;
        private String genre;
    }
}