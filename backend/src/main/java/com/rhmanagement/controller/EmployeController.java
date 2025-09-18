package com.rhmanagement.controller;

import com.rhmanagement.entity.Employe;
import com.rhmanagement.entity.Enfant;
import com.rhmanagement.service.EmployeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/employes")
@CrossOrigin(origins = "http://localhost:5173")
public class EmployeController {

    private final EmployeService employeService;

    public EmployeController(EmployeService employeService) {
        this.employeService = employeService;
    }

    @PostMapping("/{id}/photo")
    public ResponseEntity<Employe> uploadPhoto(@PathVariable Long id,
                                               @RequestParam("file") MultipartFile file) {
        try {
            System.out.println("Upload photo pour employé ID: " + id);
            System.out.println("Nom fichier: " + file.getOriginalFilename());
            System.out.println("Taille fichier: " + file.getSize());
            System.out.println("Type MIME: " + file.getContentType());

            Employe employe = employeService.uploadPhoto(id, file);
            return ResponseEntity.ok(employe);
        } catch (Exception e) {
            System.err.println("Erreur upload photo: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}/photo")
    public ResponseEntity<Employe> deletePhoto(@PathVariable Long id) {
        Employe employe = employeService.deletePhoto(id);
        return ResponseEntity.ok(employe);
    }

    @GetMapping
    public List<Employe> getAllEmployes() {
        return employeService.getAllEmployes();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Employe> getEmployeById(@PathVariable Long id) {
        return employeService.getEmployeById(id)
                .map(employe -> ResponseEntity.ok().body(employe))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/matricule/{matricule}")
    public ResponseEntity<Employe> getEmployeByMatricule(@PathVariable String matricule) {
        return employeService.getEmployeByMatricule(matricule)
                .map(employe -> ResponseEntity.ok().body(employe))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Employe createEmploye(@RequestBody Employe employe) {
        return employeService.saveEmploye(employe);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Employe> updateEmploye(@PathVariable Long id, @RequestBody Employe employeDetails) {
        try {
            Employe updatedEmploye = employeService.updateEmploye(id, employeDetails);
            return ResponseEntity.ok(updatedEmploye);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEmploye(@PathVariable Long id) {
        try {
            employeService.deleteEmploye(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    @GetMapping("/search")
    public ResponseEntity<List<Employe>> searchEmployes(@RequestParam String query) {
        List<Employe> result = employeService.searchEmployes(query);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/statut/{statut}")
    public List<Employe> getEmployesByStatut(@PathVariable Employe.StatutEmploye statut) {
        return employeService.getEmployesByStatut(statut);
    }

    @GetMapping("/pasteurs")
    public List<Employe> getPasteurs() {
        return employeService.getPasteurs();
    }

    @GetMapping("/count/statut/{statut}")
    public long getEmployeCountByStatut(@PathVariable Employe.StatutEmploye statut) {
        return employeService.getEmployeCountByStatut(statut);
    }
}