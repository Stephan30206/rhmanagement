package com.rhmanagement.controller;

import com.rhmanagement.entity.Utilisateur;
import com.rhmanagement.repository.UtilisateurRepository;
import com.rhmanagement.service.UtilisateurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/utilisateurs")
@CrossOrigin(origins = "*") // Ajoutez cette annotation pour permettre les requêtes CORS
public class UserController {

    @Autowired
    private UtilisateurService utilisateurService;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @GetMapping("/uploads/{filename:.+}")
    public ResponseEntity<byte[]> getImage(@PathVariable String filename) {
        try {
            Path filePath = Paths.get("uploads", filename);
            byte[] imageBytes = Files.readAllBytes(filePath);

            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "image/jpeg";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(imageBytes);

        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/photo")
    public ResponseEntity<?> uploadUserPhoto(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {

        try {
            // Validation du fichier
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Aucun fichier sélectionné"));
            }

            // Vérifier la taille (10MB max)
            if (file.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Fichier trop volumineux (max 10MB)"));
            }

            // Vérifier le type MIME
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Format de fichier non supporté. Utilisez une image JPEG, PNG ou GIF"));
            }

            // Trouver l'utilisateur
            Optional<Utilisateur> utilisateurOpt = utilisateurRepository.findById(id);
            if (utilisateurOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Utilisateur utilisateur = utilisateurOpt.get();

            // Créer le dossier uploads s'il n'existe pas
            String uploadDir = "uploads";
            File uploadsFolder = new File(uploadDir);
            if (!uploadsFolder.exists()) {
                uploadsFolder.mkdirs();
            }

            // Générer un nom de fichier unique
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null ?
                    originalFilename.substring(originalFilename.lastIndexOf('.')) : ".jpg";
            String filename = System.currentTimeMillis() + "_user_" + id + extension;

            // Chemin complet du fichier
            Path filePath = Paths.get(uploadDir, filename);

            // Supprimer l'ancienne photo si elle existe
            if (utilisateur.getPhotoProfil() != null) {
                Path oldFilePath = Paths.get(uploadDir, utilisateur.getPhotoProfil());
                try {
                    Files.deleteIfExists(oldFilePath);
                } catch (IOException e) {
                    System.err.println("Erreur suppression ancienne photo: " + e.getMessage());
                }
            }

            // Sauvegarder le nouveau fichier
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Mettre à jour l'utilisateur
            utilisateur.setPhotoProfil(filename);
            utilisateurRepository.save(utilisateur);

            return ResponseEntity.ok(Map.of(
                    "message", "Photo uploadée avec succès",
                    "filename", filename,
                    "user", utilisateur
            ));

        } catch (IOException e) {
            System.err.println("Erreur upload photo: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erreur lors de la sauvegarde: " + e.getMessage()));
        } catch (Exception e) {
            System.err.println("Erreur inattendue: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erreur inattendue: " + e.getMessage()));
        }
    }

    // Ajoutez également ces endpoints utiles

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        Optional<Utilisateur> utilisateur = utilisateurRepository.findById(id);
        if (utilisateur.isPresent()) {
            return ResponseEntity.ok(utilisateur.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/photo")
    public ResponseEntity<?> getUserPhoto(@PathVariable Long id) {
        Optional<Utilisateur> utilisateurOpt = utilisateurRepository.findById(id);
        if (utilisateurOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Utilisateur utilisateur = utilisateurOpt.get();
        if (utilisateur.getPhotoProfil() == null) {
            return ResponseEntity.notFound().build();
        }

        try {
            Path filePath = Paths.get("uploads", utilisateur.getPhotoProfil());
            byte[] imageBytes = Files.readAllBytes(filePath);

            // Déterminer le type MIME correct
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "image/jpeg"; // Valeur par défaut
            }

            return ResponseEntity.ok()
                    .header("Content-Type", contentType)
                    .body(imageBytes);

        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}/photo")
    public ResponseEntity<?> deleteUserPhoto(@PathVariable Long id) {
        Optional<Utilisateur> utilisateurOpt = utilisateurRepository.findById(id);
        if (utilisateurOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Utilisateur utilisateur = utilisateurOpt.get();
        if (utilisateur.getPhotoProfil() != null) {
            try {
                Path filePath = Paths.get("uploads", utilisateur.getPhotoProfil());
                Files.deleteIfExists(filePath);

                utilisateur.setPhotoProfil(null);
                utilisateurRepository.save(utilisateur);

                return ResponseEntity.ok(Map.of("message", "Photo supprimée avec succès"));

            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "Erreur lors de la suppression de la photo"));
            }
        }

        return ResponseEntity.ok(Map.of("message", "Aucune photo à supprimer"));
    }
}