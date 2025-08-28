package com.rhmanagement.controller;

import com.rhmanagement.entity.Formation;
import com.rhmanagement.service.FormationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employes/{employeId}/formations")
@CrossOrigin(origins = "*")
public class FormationController {

    @Autowired
    private FormationService formationService;

    @GetMapping
    public ResponseEntity<List<Formation>> getFormationsByEmploye(@PathVariable Long employeId) {
        List<Formation> formations = formationService.getFormationsByEmployeId(employeId);
        return ResponseEntity.ok(formations);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Formation> getFormation(@PathVariable Long employeId, @PathVariable Long id) {
        Formation formation = formationService.getFormationById(id)
                .orElseThrow(() -> new RuntimeException("Formation non trouvée"));
        return ResponseEntity.ok(formation);
    }

    @PostMapping
    public ResponseEntity<Formation> createFormation(@PathVariable Long employeId, @RequestBody Formation formation) {
        // Créer une instance d'employé avec l'ID fourni
        com.rhmanagement.entity.Employe employe = new com.rhmanagement.entity.Employe();
        employe.setId(employeId);
        formation.setEmploye(employe);

        Formation savedFormation = formationService.saveFormation(formation);
        return ResponseEntity.ok(savedFormation);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Formation> updateFormation(@PathVariable Long employeId,
                                                     @PathVariable Long id,
                                                     @RequestBody Formation formation) {
        Formation existingFormation = formationService.getFormationById(id)
                .orElseThrow(() -> new RuntimeException("Formation non trouvée"));

        existingFormation.setIntitule(formation.getIntitule());
        existingFormation.setOrganisme(formation.getOrganisme());
        existingFormation.setDateDebut(formation.getDateDebut());
        existingFormation.setDateFin(formation.getDateFin());
        existingFormation.setDureeHeures(formation.getDureeHeures());
        existingFormation.setCertificat(formation.getCertificat());

        Formation updatedFormation = formationService.saveFormation(existingFormation);
        return ResponseEntity.ok(updatedFormation);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFormation(@PathVariable Long employeId, @PathVariable Long id) {
        formationService.deleteFormation(id);
        return ResponseEntity.noContent().build();
    }
}