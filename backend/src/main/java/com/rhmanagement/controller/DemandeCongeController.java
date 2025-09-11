package com.rhmanagement.controller;

import com.rhmanagement.entity.DemandeConge;
import com.rhmanagement.service.DemandeCongeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/demandes-conge")
@CrossOrigin(origins = "http://localhost:5173")
public class DemandeCongeController {

    @Autowired
    private DemandeCongeService demandeCongeService;

    @PutMapping("/{id}/approve")
    public ResponseEntity<Map<String, Object>> approuverDemande(@PathVariable Long id) {
        try {
            // Pour l'instant, utiliser un ID fixe pour l'approbateur
            // Dans un vrai système, récupérer l'ID de l'utilisateur connecté
            Long approbateurId = 1L;

            DemandeConge demandeApprouvee = demandeCongeService.approuverDemande(id, approbateurId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Demande approuvée avec succès");
            response.put("demande", demandeApprouvee);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Rejeter une demande
    @PutMapping("/{id}/reject")
    public ResponseEntity<Map<String, Object>> rejeterDemande(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            Long approbateurId = 1L; // ID fixe pour l'instant
            String motifRejet = request.get("motifRejet");

            DemandeConge demandeRejetee = demandeCongeService.rejeterDemande(id, approbateurId, motifRejet);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Demande rejetée avec succès");
            response.put("demande", demandeRejetee);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Annuler une demande
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Map<String, Object>> annulerDemande(@PathVariable Long id) {
        try {
            DemandeConge demandeAnnulee = demandeCongeService.annulerDemande(id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Demande annulée avec succès");
            response.put("demande", demandeAnnulee);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Map<String, Object>>> getDemandesEnAttente() {
        try {
            List<DemandeConge> demandesEnAttente = demandeCongeService.getDemandesEnAttente();

            List<Map<String, Object>> demandesWithDetails = demandesEnAttente.stream().map(demande -> {
                Map<String, Object> demandeMap = new HashMap<>();
                demandeMap.put("id", demande.getId());
                demandeMap.put("employeId", demande.getEmployeId());
                demandeMap.put("dateDebut", demande.getDateDebut());
                demandeMap.put("dateFin", demande.getDateFin());
                demandeMap.put("motif", demande.getMotif());
                demandeMap.put("statut", demande.getStatut());
                demandeMap.put("dateCreation", demande.getDateCreation());
//                demandeMap.put("joursDemandes", demande.getNombreJours());

                // Ajouter les détails de l'employé et du type de congé comme dans getAllDemandesWithDetails
                Map<String, Object> details = demandeCongeService.getDemandeDetails(demande.getId());
                if (details != null) {
                    demandeMap.put("employeNom", details.get("employeNom"));
                    demandeMap.put("employePrenom", details.get("employePrenom"));
                    demandeMap.put("typeCongeNom", details.get("typeCongeNom"));
                    demandeMap.put("approbateurNom", details.get("approbateurNom"));
                }

                return demandeMap;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(demandesWithDetails);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // Obtenir les statistiques des demandes
    @GetMapping("/statistics/{annee}")
    public ResponseEntity<Map<String, Object>> getStatistiques(@PathVariable Integer annee) {
        try {
            Map<String, Long> statsStatut = demandeCongeService.getStatistiquesDemandesParAnnee(annee);

            Map<String, Object> response = new HashMap<>();
            response.put("parStatut", statsStatut);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // Nouveau endpoint avec relations
    @GetMapping("/with-details")
    public ResponseEntity<List<Map<String, Object>>> getAllDemandesWithDetails() {
        List<Map<String, Object>> demandes = demandeCongeService.getAllDemandesWithDetails();
        return ResponseEntity.ok(demandes);
    }

    // Modifier la méthode existante pour utiliser les détails
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllDemandes() {
        List<Map<String, Object>> demandes = demandeCongeService.getAllDemandesWithDetails();
        return ResponseEntity.ok(demandes);
    }

    // Récupérer toutes les demandes
//    @GetMapping
//    public ResponseEntity<List<DemandeConge>> getAllDemandes() {
//        List<DemandeConge> demandes = demandeCongeService.getAllDemandes();
//        return ResponseEntity.ok(demandes);
//    }

    // Récupérer une demande par ID
    @GetMapping("/{id}")
    public ResponseEntity<DemandeConge> getDemandeById(@PathVariable Long id) {
        Optional<DemandeConge> demande = demandeCongeService.getDemandeById(id);
        return demande.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Créer une nouvelle demande
    @PostMapping
    public ResponseEntity<DemandeConge> createDemande(@RequestBody DemandeConge demande) {
        DemandeConge nouvelleDemande = demandeCongeService.saveDemande(demande);
        return ResponseEntity.ok(nouvelleDemande);
    }

    // Mettre à jour une demande
    @PutMapping("/{id}")
    public ResponseEntity<DemandeConge> updateDemande(@PathVariable Long id, @RequestBody DemandeConge demande) {
        if (demandeCongeService.getDemandeById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        demande.setId(id);
        DemandeConge demandeMaj = demandeCongeService.saveDemande(demande);
        return ResponseEntity.ok(demandeMaj);
    }

    // Supprimer une demande
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDemande(@PathVariable Long id) {
        if (demandeCongeService.getDemandeById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        demandeCongeService.deleteDemande(id);
        return ResponseEntity.ok().build();
    }

    // Récupérer les demandes par employé
    @GetMapping("/employe/{employeId}")
    public ResponseEntity<List<DemandeConge>> getDemandesByEmploye(@PathVariable Long employeId) {
        List<DemandeConge> demandes = demandeCongeService.getDemandesByEmployeId(employeId);
        return ResponseEntity.ok(demandes);
    }
}