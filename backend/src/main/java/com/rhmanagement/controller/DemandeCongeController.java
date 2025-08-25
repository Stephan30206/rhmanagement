package com.rhmanagement.controller;

import com.rhmanagement.entity.DemandeConge;
import com.rhmanagement.service.DemandeCongeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/demandes-conge")
@CrossOrigin(origins = "http://localhost:5173")
public class DemandeCongeController {

    @Autowired
    private DemandeCongeService demandeCongeService;

    // Récupérer toutes les demandes
    @GetMapping
    public ResponseEntity<List<DemandeConge>> getAllDemandes() {
        List<DemandeConge> demandes = demandeCongeService.getAllDemandes();
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

    // Récupérer les demandes par employé
    @GetMapping("/employe/{employeId}")
    public ResponseEntity<List<DemandeConge>> getDemandesByEmploye(@PathVariable Long employeId) {
        List<DemandeConge> demandes = demandeCongeService.getDemandesByEmployeId(employeId);
        return ResponseEntity.ok(demandes);
    }
}