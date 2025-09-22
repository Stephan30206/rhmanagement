package com.rhmanagement.controller;

import com.rhmanagement.entity.Employe;
import com.rhmanagement.service.CongeStatusService;
import com.rhmanagement.service.DemandeCongeService;
import com.rhmanagement.service.EmployeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;

@RestController
@RequestMapping("/api/admin/conges")
@CrossOrigin(origins = "http://localhost:5173")
public class CongesAdminController {

    @Autowired
    private EmployeService employeService;

    @Autowired
    private DemandeCongeService demandeCongeService;


    @Autowired
    private CongeStatusService congeStatusService;

    @GetMapping("/statistiques-sync")
    public ResponseEntity<?> getStatistiquesSync() {
        try {
            Map<String, Object> stats = new HashMap<>();

            // Récupérer les statistiques
            int totalEmployes = employeService.getTotalEmployes();
            int employesEnConge = employeService.getEmployesEnCongeCount();
            int congesActifs = demandeCongeService.getCongesActifsCount();

            // Calculer les incohérences (employés marqués EN_CONGE mais sans congé actif)
            int incoherences = employeService.getIncoherencesStatutCount();
            double coherencePercent = totalEmployes > 0 ?
                    ((double) (totalEmployes - incoherences) / totalEmployes) * 100 : 100.0;

            // Structurez la réponse avec les données dans un objet "data"
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);

            Map<String, Object> data = new HashMap<>();
            data.put("totalEmployes", totalEmployes);
            data.put("employesEnConge", employesEnConge);
            data.put("congesActifs", congesActifs);
            data.put("incoherences", incoherences);
            data.put("coherencePercent", Math.round(coherencePercent * 10.0) / 10.0);

            response.put("data", data);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Erreur lors de la récupération des statistiques");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/check-conges-termines")
    public ResponseEntity<?> checkCongesTermines() {
        try {
            // Récupérer les employés avec des congés terminés
            List<Map<String, Object>> employesAvecCongesTermines = employeService.getEmployesAvecCongesTermines();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", employesAvecCongesTermines);
            response.put("count", employesAvecCongesTermines.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Erreur lors de la vérification des congés terminés: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PutMapping("/update-statut/{employeId}")
    public ResponseEntity<?> updateStatutEmploye(@PathVariable Long employeId) {
        try {
            // Mettre à jour le statut de l'employé
            Employe employe = employeService.mettreEmployeActif(employeId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Statut de l'employé mis à jour avec succès");
            response.put("employe", employe);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Erreur lors de la mise à jour du statut: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/sync-tous-statuts")
    public ResponseEntity<?> synchroniserTousLesStatuts() {
        try {
            congeStatusService.synchroniserTousLesStatuts();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Synchronisation terminée avec succès");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Erreur lors de la synchronisation: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}