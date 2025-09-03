package com.rhmanagement.service;

import com.rhmanagement.entity.Utilisateur;
import com.rhmanagement.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
public class AuthService {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Utilisateur getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return utilisateurRepository.findByNomUtilisateur(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }

    public Utilisateur authenticate(String identifiant, String password) {
        // 1. Rechercher l'utilisateur par email OU par nom d'utilisateur
        Utilisateur user = utilisateurRepository.findByEmail(identifiant)
                .orElseGet(() -> utilisateurRepository.findByNomUtilisateur(identifiant)
                        .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'identifiant: " + identifiant)));

        // 2. Vérifier le mot de passe
        if (!passwordEncoder.matches(password, user.getMotDePasse())) {
            throw new RuntimeException("Mot de passe incorrect");
        }

        return user;
    }

    public Utilisateur updateProfile(Utilisateur userDetails) {
        Utilisateur currentUser = getCurrentUser();

        // Mettre à jour les champs autorisés
        currentUser.setNom(userDetails.getNom());
        currentUser.setPrenom(userDetails.getPrenom());
        currentUser.setEmail(userDetails.getEmail());
        currentUser.setTelephone(userDetails.getTelephone());
        currentUser.setPoste(userDetails.getPoste());
        // Ajoutez d'autres champs si nécessaire
        currentUser.setAdresse(userDetails.getAdresse());
        currentUser.setGenre(userDetails.getGenre());
        currentUser.setDateNaissance(userDetails.getDateNaissance());

        return utilisateurRepository.save(currentUser);
    }

    public void changePassword(String currentPassword, String newPassword) {
        Utilisateur currentUser = getCurrentUser();

        if (!passwordEncoder.matches(currentPassword, currentUser.getMotDePasse())) {
            throw new RuntimeException("Mot de passe actuel incorrect");
        }

        currentUser.setMotDePasse(passwordEncoder.encode(newPassword));
        utilisateurRepository.save(currentUser);
    }

    public Utilisateur uploadProfilePhoto(MultipartFile file) throws Exception {
        if (file.isEmpty()) {
            throw new RuntimeException("Fichier vide");
        }

        if (file.getSize() > 10 * 1024 * 1024) {
            throw new RuntimeException("Fichier trop volumineux (max 10MB)");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("Format de fichier non supporté");
        }

        Utilisateur currentUser = getCurrentUser();

        // Créer le dossier uploads s'il n'existe pas
        String uploadDir = "uploads";
        java.io.File uploadsFolder = new java.io.File(uploadDir);
        if (!uploadsFolder.exists()) {
            uploadsFolder.mkdirs();
        }

        // Générer un nom de fichier unique
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null ?
                originalFilename.substring(originalFilename.lastIndexOf('.')) : ".jpg";
        String filename = System.currentTimeMillis() + "_user_" + currentUser.getId() + extension;

        // Chemin complet du fichier
        Path filePath = Paths.get(uploadDir, filename);

        // Supprimer l'ancienne photo si elle existe
        if (currentUser.getPhotoProfil() != null) {
            Path oldFilePath = Paths.get(uploadDir, currentUser.getPhotoProfil());
            try {
                Files.deleteIfExists(oldFilePath);
            } catch (Exception e) {
                System.err.println("Erreur suppression ancienne photo: " + e.getMessage());
            }
        }

        // Sauvegarder le nouveau fichier
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Mettre à jour l'utilisateur
        currentUser.setPhotoProfil(filename);
        return utilisateurRepository.save(currentUser);
    }
}