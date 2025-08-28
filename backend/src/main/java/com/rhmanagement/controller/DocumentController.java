
package com.rhmanagement.controller;

import com.rhmanagement.entity.Document;
import com.rhmanagement.entity.Employe;
import com.rhmanagement.repository.DocumentRepository;
import com.rhmanagement.repository.EmployeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/employes")
@CrossOrigin(origins = "http://localhost:5173")
public class DocumentController {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private EmployeRepository employeRepository;

    private final Path rootLocation = Paths.get("uploads");

    @PostMapping("/{employeId}/documents")
    public ResponseEntity<?> uploadDocument(
            @PathVariable Long employeId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("nom") String nom,
            @RequestParam("typeDocument") String typeDocument,
            @RequestParam(value = "description", required = false) String description) {

        try {
            Employe employe = employeRepository.findById(employeId)
                    .orElseThrow(() -> new RuntimeException("Employé non trouvé avec l'ID: " + employeId));

            // Créer le répertoire uploads s'il n'existe pas
            if (!Files.exists(rootLocation)) {
                Files.createDirectories(rootLocation);
            }

            // Générer un nom de fichier unique
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : "";
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

            // Sauvegarder le fichier
            Files.copy(file.getInputStream(), rootLocation.resolve(uniqueFilename));

            // Créer et sauvegarder le document
            Document document = new Document();
            document.setNom(nom);
            document.setTypeDocument(Document.TypeDocument.valueOf(typeDocument));
            document.setCheminFichier(uniqueFilename);
            document.setDescription(description);
            document.setEmploye(employe);

            Document savedDocument = documentRepository.save(document);
            return ResponseEntity.ok(savedDocument);

        } catch (IOException e) {
            return ResponseEntity.status(500).body("Erreur lors de l'upload du fichier: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur interne: " + e.getMessage());
        }
    }

    @GetMapping("/{employeId}/documents")
    public ResponseEntity<List<Document>> getDocuments(@PathVariable Long employeId) {
        List<Document> documents = documentRepository.findByEmployeId(employeId);
        return ResponseEntity.ok(documents);
    }

    @DeleteMapping("/{employeId}/documents/{documentId}")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable Long employeId,
            @PathVariable Long documentId) {

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document non trouvé"));

        // Vérifier que le document appartient à l'employé
        if (!document.getEmploye().getId().equals(employeId)) {
            return ResponseEntity.badRequest().build();
        }

        try {
            // Supprimer le fichier physique
            Files.deleteIfExists(rootLocation.resolve(document.getCheminFichier()));
        } catch (IOException e) {
            System.err.println("Erreur suppression fichier: " + e.getMessage());
        }

        documentRepository.delete(document);
        return ResponseEntity.ok().build();
    }
}