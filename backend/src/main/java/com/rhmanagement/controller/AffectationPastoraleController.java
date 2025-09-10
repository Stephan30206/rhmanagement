package com.rhmanagement.controller;

import com.rhmanagement.entity.AffectationPastorale;
import com.rhmanagement.entity.Employe;
import com.rhmanagement.service.AffectationPastoraleService;
import com.rhmanagement.service.EmployeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/affectations-pastorales")
@CrossOrigin(origins = "http://localhost:5173")
public class AffectationPastoraleController {

    @Autowired
    private AffectationPastoraleService affectationPastoraleService;

    @Autowired
    private EmployeService employeService;

    // Méthode de test pour vérifier que le contrôleur fonctionne
    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("Contrôleur fonctionnel !");
    }

    @GetMapping("/pasteur/{pasteurId}")
    public ResponseEntity<List<AffectationPastorale>> getAffectationsByPasteur(@PathVariable Long pasteurId) {
        List<AffectationPastorale> affectations = affectationPastoraleService.getAffectationsByPasteur(pasteurId);
        return ResponseEntity.ok(affectations);
    }

    @PostMapping
    public ResponseEntity<AffectationPastorale> createAffectation(@RequestBody AffectationPastorale affectation) {
        AffectationPastorale savedAffectation = affectationPastoraleService.createAffectation(affectation);
        return ResponseEntity.ok(savedAffectation);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AffectationPastorale> updateAffectation(@PathVariable Long id, @RequestBody AffectationPastorale affectation) {
        AffectationPastorale updatedAffectation = affectationPastoraleService.updateAffectation(id, affectation);
        if (updatedAffectation != null) {
            return ResponseEntity.ok(updatedAffectation);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAffectation(@PathVariable Long id) {
        affectationPastoraleService.deleteAffectation(id);
        return ResponseEntity.ok().build();
    }
}