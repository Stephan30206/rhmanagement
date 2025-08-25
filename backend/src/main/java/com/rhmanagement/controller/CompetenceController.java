// CompetenceController.java
package com.rhmanagement.controller;

import com.rhmanagement.entity.Competence;
import com.rhmanagement.service.CompetenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employes/{employeId}/competences")
@CrossOrigin(origins = "*")
public class CompetenceController {

    @Autowired
    private CompetenceService competenceService;

    @GetMapping
    public ResponseEntity<List<Competence>> getCompetencesByEmploye(@PathVariable Long employeId) {
        List<Competence> competences = competenceService.getCompetencesByEmployeId(employeId);
        return ResponseEntity.ok(competences);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Competence> getCompetence(@PathVariable Long employeId, @PathVariable Long id) {
        Competence competence = competenceService.getCompetenceById(id)
                .orElseThrow(() -> new RuntimeException("Compétence non trouvée"));
        return ResponseEntity.ok(competence);
    }

    @PostMapping
    public ResponseEntity<Competence> createCompetence(@PathVariable Long employeId, @RequestBody Competence competence) {
        competence.setEmployeId(employeId);
        Competence savedCompetence = competenceService.saveCompetence(competence);
        return ResponseEntity.ok(savedCompetence);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Competence> updateCompetence(@PathVariable Long employeId,
                                                       @PathVariable Long id,
                                                       @RequestBody Competence competence) {
        Competence existingCompetence = competenceService.getCompetenceById(id)
                .orElseThrow(() -> new RuntimeException("Compétence non trouvée"));

        existingCompetence.setNom(competence.getNom());
        existingCompetence.setNiveau(competence.getNiveau());
        existingCompetence.setCategorie(competence.getCategorie());
        existingCompetence.setDateAcquisition(competence.getDateAcquisition());

        Competence updatedCompetence = competenceService.saveCompetence(existingCompetence);
        return ResponseEntity.ok(updatedCompetence);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompetence(@PathVariable Long employeId, @PathVariable Long id) {
        competenceService.deleteCompetence(id);
        return ResponseEntity.noContent().build();
    }
}