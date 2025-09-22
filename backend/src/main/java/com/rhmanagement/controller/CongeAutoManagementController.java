package com.rhmanagement.controller;

import com.rhmanagement.service.CongeAutoManagementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/conges")
@CrossOrigin(origins = "http://localhost:5173")
public class CongeAutoManagementController {

    private final CongeAutoManagementService congeAutoManagementService;

    public CongeAutoManagementController(CongeAutoManagementService congeAutoManagementService) {
        this.congeAutoManagementService = congeAutoManagementService;
    }

    @GetMapping("/termines")
    public ResponseEntity<List<Map<String, Object>>> getEmployesAvecCongesTermines() {
        List<Map<String, Object>> result = congeAutoManagementService.getEmployesAvecCongesTermines();
        return ResponseEntity.ok(result);
    }

    @PostMapping("/verifier-conges-termines")
    public ResponseEntity<String> verifierCongesTermines() {
        congeAutoManagementService.verifierEtMettreAJourCongesTermines();
        return ResponseEntity.ok("Vérification des congés terminés effectuée");
    }
}