package com.rhmanagement.controller;

import com.rhmanagement.entity.DemandeConge;
import com.rhmanagement.service.DemandeCongeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
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

    // Approuver une demande
    @PutMapping("/{id}/approve")
    public ResponseEntity<Map<String, Object>> approuverDemande(@PathVariable Long id) {
        try {
            // Pour l'instant, utiliser un ID fixe pour l'approbateur
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

    // Récupérer toutes les demandes en attente
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

                // Ajouter les détails de l'employé et du type de congé
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

    // Obtenir les statistiques des demandes par année
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

    // Récupérer toutes les demandes avec détails
    @GetMapping("/with-details")
    public ResponseEntity<List<Map<String, Object>>> getAllDemandesWithDetails() {
        List<Map<String, Object>> demandes = demandeCongeService.getAllDemandesWithDetails();
        return ResponseEntity.ok(demandes);
    }

    // Récupérer toutes les demandes
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllDemandes() {
        List<Map<String, Object>> demandes = demandeCongeService.getAllDemandesWithDetails();
        return ResponseEntity.ok(demandes);
    }

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

    // Récupérer les demandes par employé (une seule méthode conservée)
    @GetMapping("/employe/{employeId}")
    public ResponseEntity<List<DemandeConge>> getDemandesByEmploye(@PathVariable Long employeId) {
        List<DemandeConge> demandes = demandeCongeService.getDemandesByEmployeId(employeId);
        return ResponseEntity.ok(demandes);
    }

    // Récupérer le solde de congé disponible
    @GetMapping("/solde/{employeId}")
    public ResponseEntity<Integer> getSoldeConge(@PathVariable Long employeId) {
        try {
            int solde = demandeCongeService.getSoldeCongeDisponible(employeId);
            return ResponseEntity.ok(solde);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(25); // Retourne 25 par défaut en cas d'erreur
        }
    }

    // Récupérer les congés actifs d'un employé à une date donnée
    @GetMapping("/employe/{employeId}/actifs")
    public ResponseEntity<List<DemandeConge>> getCongesActifs(
            @PathVariable Long employeId,
            @RequestParam String date) {

        LocalDate checkDate = LocalDate.parse(date);
        List<DemandeConge> congesActifs = demandeCongeService.getCongesActifs(employeId, checkDate);
        return ResponseEntity.ok(congesActifs);
    }
}
