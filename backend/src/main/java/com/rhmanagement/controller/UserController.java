package com.rhmanagement.controller;

import com.rhmanagement.entity.Utilisateur;
import com.rhmanagement.service.UtilisateurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/utilisateurs")
public class UserController {

    @Autowired
    private UtilisateurService utilisateurService;

    @PostMapping("/{userId}/photo")
    public ResponseEntity<?> uploadUserPhoto(@PathVariable Long userId,
                                             @RequestParam("file") MultipartFile file) {
        try {
            // Vérifiez que l'utilisateur existe
            Optional<Utilisateur> userOpt = utilisateurService.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            // Logique d'upload (similaire à EmployeController)
            String uploadDir = "uploads/";
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            String filePath = uploadDir + fileName;

            file.transferTo(new File(filePath));

            // Mettez à jour l'utilisateur avec le chemin de la photo
            Utilisateur user = userOpt.get();
            user.setPhotoProfil(fileName);
            utilisateurService.updateUser(userId, user);

            return ResponseEntity.ok().body(Map.of(
                    "message", "Photo uploadée avec succès",
                    "photoProfil", fileName
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Erreur lors de l'upload: " + e.getMessage()
            ));
        }
    }
}