package com.rhmanagement.controller;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.rhmanagement.entity.Utilisateur;
import com.rhmanagement.security.JwtUtil;
import com.rhmanagement.service.UtilisateurService;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"})
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UtilisateurService utilisateurService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getNomUtilisateur(),
                            loginRequest.getMotDePasse()
                    )
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtUtil.generateToken(userDetails.getUsername());

            Optional<Utilisateur> utilisateurOpt = utilisateurService.findByNomUtilisateur(loginRequest.getNomUtilisateur());

            if (utilisateurOpt.isEmpty()) {
                return ResponseEntity.status(401)
                        .body(Map.of("message", "Utilisateur non trouvé"));
            }

            Utilisateur utilisateur = utilisateurOpt.get();

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", utilisateur);
            response.put("message", "Connexion réussie");

            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401)
                    .body(Map.of("message", "Nom d'utilisateur ou mot de passe incorrect"));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Erreur interne du serveur", "error", e.getMessage()));
        }
    }

    @PostMapping("/register")
    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        try {
            // Vérifier si l'utilisateur existe déjà
            if (utilisateurService.findByNomUtilisateur(registerRequest.getNomUtilisateur()).isPresent()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Ce nom d'utilisateur est déjà pris"));
            }

            // Vérifier si l'email existe déjà - CORRECTION : Utilisez la méthode corrigée
            if (utilisateurService.findByEmail(registerRequest.getEmail()).isPresent()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Un utilisateur avec cet email existe déjà"));
            }

            // Créer le nouvel utilisateur
            Utilisateur newUser = new Utilisateur();
            newUser.setNomUtilisateur(registerRequest.getNomUtilisateur());
            newUser.setMotDePasse(registerRequest.getMotDePasse()); // Le service va l'encoder
            newUser.setEmail(registerRequest.getEmail());
            newUser.setNom(registerRequest.getNom());
            newUser.setPrenom(registerRequest.getPrenom());
            newUser.setTelephone(registerRequest.getTelephone());
            newUser.setPoste(registerRequest.getPoste());
            newUser.setRole(Utilisateur.Role.ADMIN);
            newUser.setActif(true);

            Utilisateur savedUser = utilisateurService.createUser(newUser);
            String token = jwtUtil.generateToken(savedUser.getNomUtilisateur());

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", savedUser);
            response.put("message", "Inscription réussie");

            return ResponseEntity.ok(response);

        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Violation de contrainte d'intégrité des données"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Erreur lors de l'inscription", "error", e.getMessage()));
        }
    }
    // Classe pour la requête d'inscription
    @Setter
    @Getter
    public static class RegisterRequest {
        @JsonProperty("nom_utilisateur")
        private String nomUtilisateur;

        @JsonProperty("mot_de_passe")
        private String motDePasse;

        @JsonProperty("email")
        private String email;

        @JsonProperty("nom")
        private String nom;

        @JsonProperty("prenom")
        private String prenom;

        @JsonProperty("telephone")
        private String telephone;

        @JsonProperty("poste")
        private String poste;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("message", "Non authentifié"));
        }

        String username = authentication.getName();
        Optional<Utilisateur> utilisateur = utilisateurService.findByNomUtilisateur(username);

        if (utilisateur.isPresent()) {
            return ResponseEntity.ok(utilisateur.get());
        } else {
            return ResponseEntity.status(404).body(Map.of("message", "Utilisateur non trouvé"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // Avec JWT, le logout est géré côté client en supprimant le token
        return ResponseEntity.ok(Map.of("message", "Déconnexion réussie"));
    }

    // Classe interne pour la requête de login - MODIFIÉE
    @Setter
    @Getter
    public static class LoginRequest {
        @JsonProperty("nom_utilisateur")
        private String nomUtilisateur;  // Changé de 'username' à 'nomUtilisateur'

        @JsonProperty("mot_de_passe")
        private String motDePasse;      // Changé de 'password' à 'motDePasse'
    }
}