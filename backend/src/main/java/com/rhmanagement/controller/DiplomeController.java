package com.rhmanagement.controller;

import com.rhmanagement.entity.Diplome;
import com.rhmanagement.service.DiplomeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employes/{employeId}")
public class DiplomeController {

    @Autowired
    private DiplomeService diplomeService;

    // GET /api/employes/1/diplomes
    @GetMapping("/diplomes")
    public ResponseEntity<List<Diplome>> getDiplomesByEmployeId(@PathVariable Long employeId) {
        List<Diplome> diplomes = diplomeService.getDiplomesByEmployeId(employeId);
        return ResponseEntity.ok(diplomes);
    }

    // POST /api/employes/1/diplomes
    @PostMapping("/diplomes")
    public ResponseEntity<Diplome> addDiplome(@PathVariable Long employeId, @RequestBody Diplome diplome) {
        Diplome savedDiplome = diplomeService.saveDiplome(employeId, diplome);
        return ResponseEntity.ok(savedDiplome);
    }

    // DELETE /api/employes/1/diplomes/2
    @DeleteMapping("/diplomes/{diplomeId}")
    public ResponseEntity<Void> deleteDiplome(@PathVariable Long employeId, @PathVariable Long diplomeId) {
        diplomeService.deleteDiplome(employeId, diplomeId);
        return ResponseEntity.noContent().build();
    }
}