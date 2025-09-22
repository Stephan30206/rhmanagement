package com.rhmanagement.controller;

import com.rhmanagement.service.CongeStatusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private CongeStatusService congeStatusService;

    /**
     * Synchronise manuellement le statut d'un employé
     */
    @PostMapping("/sync-statut/{employeId}")
    public ResponseEntity<?> synchroniserStatutEmploye(@PathVariable Long employeId) {
        try {
            congeStatusService.synchroniserStatutEmploye(employeId);
            return ResponseEntity.ok().body(Map.of("message", "Statut synchronisé avec succès"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Synchronise tous les statuts
     */
    @PostMapping("/sync-tous-statuts")
    public ResponseEntity<?> synchroniserTousLesStatuts() {
        try {
            congeStatusService.synchroniserTousLesStatuts();
            return ResponseEntity.ok().body(Map.of("message", "Tous les statuts synchronisés"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
