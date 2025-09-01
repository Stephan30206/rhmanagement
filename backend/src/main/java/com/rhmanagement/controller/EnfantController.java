package com.rhmanagement.controller;

import com.rhmanagement.entity.Enfant;
import com.rhmanagement.service.EnfantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employes/{employeId}")
public class EnfantController {

    @Autowired
    private EnfantService enfantService;

    // GET /api/employes/1/enfants
    @GetMapping("/enfants")
    public ResponseEntity<List<Enfant>> getEnfantsByEmployeId(@PathVariable Long employeId) {
        List<Enfant> enfants = enfantService.getEnfantsByEmployeId(employeId);
        return ResponseEntity.ok(enfants);
    }

    // POST /api/employes/1/enfants - CORRIGER CETTE MÉTHODE
    @PostMapping("/enfants")
    public ResponseEntity<Enfant> addEnfant(@PathVariable Long employeId, @RequestBody Enfant enfant) {
        try {
            Enfant savedEnfant = enfantService.saveEnfant(employeId, enfant);
            return ResponseEntity.ok(savedEnfant);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // DELETE /api/employes/1/enfants/2
    @DeleteMapping("/enfants/{enfantId}")
    public ResponseEntity<Void> deleteEnfant(@PathVariable Long employeId, @PathVariable Long enfantId) {
        try {
            enfantService.deleteEnfant(employeId, enfantId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}