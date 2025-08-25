package com.rhmanagement.controller;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.rhmanagement.entity.Utilisateur;
import com.rhmanagement.security.JwtUtil;
import com.rhmanagement.service.UtilisateurService;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
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
            // Authentification avec les bons noms de champs
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getNomUtilisateur(),  // Changé de getUsername() à getNomUtilisateur()
                            loginRequest.getMotDePasse()       // Changé de getPassword() à getMotDePasse()
                    )
            );

            // Génération du token JWT
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtUtil.generateToken(userDetails.getUsername());

            // Récupération des informations utilisateur
            Optional<Utilisateur> utilisateurOpt = utilisateurService.findByNomUtilisateur(loginRequest.getNomUtilisateur()); // Changé ici aussi

            if (utilisateurOpt.isEmpty()) {
                return ResponseEntity.status(401)
                        .body(Map.of("message", "Utilisateur non trouvé"));
            }

            Utilisateur utilisateur = utilisateurOpt.get();

            // Réponse
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", utilisateur);
            response.put("message", "Connexion réussie");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(401)
                    .body(Map.of("message", "Nom d'utilisateur ou mot de passe incorrect", "error", e.getMessage()));
        }
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