package com.rhmanagement.controller;

import com.rhmanagement.entity.Employe;
import com.rhmanagement.entity.Enfant;
import com.rhmanagement.service.EmployeService;
import com.rhmanagement.service.PdfExportService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/employes")
@CrossOrigin(origins = "http://localhost:5173")
public class EmployeController {

    private final EmployeService employeService;
    private final PdfExportService pdfExportService;

    public EmployeController(EmployeService employeService, PdfExportService pdfExportService) {
        this.employeService = employeService;
        this.pdfExportService = pdfExportService;
    }

    @PostMapping("/{id}/photo")
    public ResponseEntity<Employe> uploadPhoto(@PathVariable Long id,
                                               @RequestParam("file") MultipartFile file) {
        try {
            System.out.println("Upload photo pour employé ID: " + id);
            System.out.println("Nom fichier: " + file.getOriginalFilename());
            System.out.println("Taille fichier: " + file.getSize());
            System.out.println("Type MIME: " + file.getContentType());

            Employe employe = employeService.uploadPhoto(id, file);
            return ResponseEntity.ok(employe);
        } catch (Exception e) {
            System.err.println("Erreur upload photo: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}/photo")
    public ResponseEntity<Employe> deletePhoto(@PathVariable Long id) {
        try {
            Employe employe = employeService.deletePhoto(id);
            return ResponseEntity.ok(employe);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping
    public List<Employe> getAllEmployes() {
        return employeService.getAllEmployes();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Employe> getEmployeById(@PathVariable Long id) {
        return employeService.getEmployeById(id)
                .map(employe -> ResponseEntity.ok().body(employe))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/matricule/{matricule}")
    public ResponseEntity<Employe> getEmployeByMatricule(@PathVariable String matricule) {
        return employeService.getEmployeByMatricule(matricule)
                .map(employe -> ResponseEntity.ok().body(employe))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Employe createEmploye(@RequestBody Employe employe) {
        return employeService.saveEmploye(employe);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Employe> updateEmploye(@PathVariable Long id, @RequestBody Employe employeDetails) {
        try {
            Employe updatedEmploye = employeService.updateEmploye(id, employeDetails);
            return ResponseEntity.ok(updatedEmploye);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEmploye(@PathVariable Long id) {
        try {
            employeService.deleteEmploye(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<Employe>> searchEmployes(@RequestParam String query) {
        List<Employe> result = employeService.searchEmployes(query);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/statut/{statut}")
    public List<Employe> getEmployesByStatut(@PathVariable Employe.StatutEmploye statut) {
        return employeService.getEmployesByStatut(statut);
    }

    @GetMapping("/pasteurs")
    public List<Employe> getPasteurs() {
        return employeService.getPasteurs();
    }

    @GetMapping("/count/statut/{statut}")
    public long getEmployeCountByStatut(@PathVariable Employe.StatutEmploye statut) {
        return employeService.getEmployeCountByStatut(statut);
    }

    @GetMapping("/conges-termines")
    public ResponseEntity<List<Map<String, Object>>> getEmployesAvecCongesTermines() {
        List<Map<String, Object>> employes = employeService.getEmployesAvecCongesTermines();
        return ResponseEntity.ok(employes);
    }

    @PutMapping("/{id}/statut")
    public ResponseEntity<Employe> updateStatutEmploye(@PathVariable Long id, @RequestBody Map<String, String> statut) {
        try {
            Employe employe = employeService.updateStatutEmploye(id, statut.get("statut"));
            return ResponseEntity.ok(employe);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/fiche-pdf")
    public ResponseEntity<InputStreamResource> exportFicheEmployePdf(@PathVariable Long id) {
        try {
            System.out.println("=== DÉBUT EXPORT FICHE EMPLOYÉ PDF ===");
            System.out.println("Employé ID: " + id);

            // Récupérer l'employé
            Employe employe = employeService.getEmployeById(id)
                    .orElseThrow(() -> new RuntimeException("Employé non trouvé avec l'ID : " + id));

            // Récupérer les données supplémentaires
            List<Enfant> enfants = employeService.getEnfantsByEmployeId(id);

            // Utiliser le même service PDF que l'état de service
            ByteArrayInputStream pdfStream = pdfExportService.generateFicheEmployePdf(employe, enfants);

            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=fiche-employe-" + employe.getMatricule() + ".pdf");

            return ResponseEntity.ok()
                    .headers(headers)
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(new InputStreamResource(pdfStream));

        } catch (Exception e) {
            System.err.println("=== ERREUR LORS DE L'EXPORT FICHE EMPLOYÉ PDF ===");
            System.err.println("Employé ID: " + id);
            System.err.println("Message d'erreur: " + e.getMessage());
            e.printStackTrace();
            System.err.println("=== FIN ERREUR ===");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

//    @GetMapping("/{id}/export-fiche")
//    public ResponseEntity<byte[]> exportFicheEmploye(@PathVariable Long id) {
//        try {
//            System.out.println("=== DÉBUT EXPORT PDF POUR EMPLOYÉ " + id + " ===");
//
//            byte[] pdfContent = employeService.generateFicheEmployePdf(id);
//
//            if (pdfContent == null || pdfContent.length == 0) {
//                System.err.println("ERREUR: Le contenu PDF est vide");
//                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                        .body("Erreur: contenu PDF vide".getBytes());
//            }
//
//            System.out.println("=== PDF GÉNÉRÉ AVEC SUCCÈS ===");
//            System.out.println("Taille du PDF: " + pdfContent.length + " bytes");
//
//            HttpHeaders headers = new HttpHeaders();
//            headers.setContentType(MediaType.APPLICATION_PDF);
//            headers.setContentDispositionFormData("attachment",
//                    "fiche-employe-" + id + ".pdf");
//            headers.setContentLength(pdfContent.length);
//
//            // Headers CORS importants pour les téléchargements
//            headers.add("Access-Control-Allow-Origin", "http://localhost:5173");
//            headers.add("Access-Control-Expose-Headers", "Content-Disposition");
//
//            return new ResponseEntity<>(pdfContent, headers, HttpStatus.OK);
//
//        } catch (Exception e) {
//            System.err.println("=== ERREUR LORS DE L'EXPORT PDF ===");
//            System.err.println("Employé ID: " + id);
//            System.err.println("Message d'erreur: " + e.getMessage());
//            e.printStackTrace();
//            System.err.println("=== FIN ERREUR ===");
//
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body(("Erreur: " + e.getMessage()).getBytes());
//        }
//    }
}