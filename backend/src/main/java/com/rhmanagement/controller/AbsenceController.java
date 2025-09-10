package com.rhmanagement.controller;

import com.rhmanagement.entity.Absence;
import com.rhmanagement.service.AbsenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/absences")
@CrossOrigin(origins = "http://localhost:5173")
public class AbsenceController {

    @Autowired
    private AbsenceService absenceService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllAbsences() {
        List<Map<String, Object>> absences = absenceService.getAllAbsencesWithDetails();
        return ResponseEntity.ok(absences);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Absence> getAbsenceById(@PathVariable Long id) {
        Optional<Absence> absence = absenceService.getAbsenceById(id);
        return absence.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Absence> createAbsence(@RequestBody Absence absence) {
        Absence nouvelleAbsence = absenceService.saveAbsence(absence);
        return ResponseEntity.ok(nouvelleAbsence);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Absence> updateAbsence(@PathVariable Long id, @RequestBody Absence absence) {
        if (absenceService.getAbsenceById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        absence.setId(id);
        Absence absenceMaj = absenceService.saveAbsence(absence);
        return ResponseEntity.ok(absenceMaj);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAbsence(@PathVariable Long id) {
        if (absenceService.getAbsenceById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        absenceService.deleteAbsence(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/employe/{employeId}")
    public ResponseEntity<List<Absence>> getAbsencesByEmploye(@PathVariable Long employeId) {
        List<Absence> absences = absenceService.getAbsencesByEmployeId(employeId);
        return ResponseEntity.ok(absences);
    }

    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<Absence>> getAbsencesByStatut(@PathVariable Absence.StatutAbsence statut) {
        List<Absence> absences = absenceService.getAbsencesByStatut(statut);
        return ResponseEntity.ok(absences);
    }

    @PutMapping("/{id}/validate")
    public ResponseEntity<Map<String, Object>> validerAbsence(@PathVariable Long id) {
        try {
            // Pour l'instant, utiliser un ID fixe pour le validateur
            Long validateurId = 1L;

            Absence absenceValidee = absenceService.validerAbsence(id, validateurId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Absence validée avec succès");
            response.put("absence", absenceValidee);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<Map<String, Object>> rejeterAbsence(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String motifRejet = request.get("motifRejet");

            Absence absenceRejetee = absenceService.rejeterAbsence(id, motifRejet);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Absence rejetée avec succès");
            response.put("absence", absenceRejetee);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Map<String, Object>> annulerAbsence(@PathVariable Long id) {
        try {
            Absence absenceAnnulee = absenceService.annulerAbsence(id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Absence annulée avec succès");
            response.put("absence", absenceAnnulee);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/statistics/{annee}")
    public ResponseEntity<Map<String, Object>> getStatistiques(@PathVariable Integer annee) {
        try {
            Map<String, Long> statsStatut = absenceService.getStatistiquesAbsencesParAnnee(annee);
            Map<String, Long> statsType = absenceService.getStatistiquesAbsencesParType(annee);

            Map<String, Object> response = new HashMap<>();
            response.put("parStatut", statsStatut);
            response.put("parType", statsType);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/employe/{employeId}/restantes/{typeAbsenceId}")
    public ResponseEntity<Map<String, Object>> getAbsencesRestantes(
            @PathVariable Long employeId,
            @PathVariable Integer typeAbsenceId) {
        try {
            int annee = java.time.LocalDate.now().getYear();
            int absencesRestantes = absenceService.getNombreAbsencesRestantes(employeId, typeAbsenceId, annee);

            Map<String, Object> response = new HashMap<>();
            response.put("employeId", employeId);
            response.put("typeAbsenceId", typeAbsenceId);
            response.put("annee", annee);
            response.put("absencesRestantes", absencesRestantes);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}