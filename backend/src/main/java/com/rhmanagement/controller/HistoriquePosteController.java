package com.rhmanagement.controller;

import com.rhmanagement.entity.HistoriquePoste;
import com.rhmanagement.service.HistoriquePosteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employes/{employeId}/historique")
@CrossOrigin(origins = "*")
public class HistoriquePosteController {

    @Autowired
    private HistoriquePosteService historiquePosteService;

    @GetMapping
    public ResponseEntity<List<HistoriquePoste>> getHistoriqueByEmploye(@PathVariable Long employeId) {
        List<HistoriquePoste> historique = historiquePosteService.getHistoriqueByEmployeId(employeId);
        return ResponseEntity.ok(historique);
    }

    @GetMapping("/{id}")
    public ResponseEntity<HistoriquePoste> getHistorique(@PathVariable Long employeId, @PathVariable Long id) {
        HistoriquePoste historique = historiquePosteService.getHistoriqueById(id)
                .orElseThrow(() -> new RuntimeException("Historique non trouvé"));
        return ResponseEntity.ok(historique);
    }

    @PostMapping
    public ResponseEntity<HistoriquePoste> createHistorique(@PathVariable Long employeId, @RequestBody HistoriquePoste historique) {
        historique.setEmployeId(employeId);
        HistoriquePoste savedHistorique = historiquePosteService.saveHistorique(historique);
        return ResponseEntity.ok(savedHistorique);
    }

    @PutMapping("/{id}")
    public ResponseEntity<HistoriquePoste> updateHistorique(@PathVariable Long employeId,
                                                            @PathVariable Long id,
                                                            @RequestBody HistoriquePoste historique) {
        HistoriquePoste existingHistorique = historiquePosteService.getHistoriqueById(id)
                .orElseThrow(() -> new RuntimeException("Historique non trouvé"));

        existingHistorique.setPoste(historique.getPoste());
        existingHistorique.setOrganisation(historique.getOrganisation());
        existingHistorique.setDateDebut(historique.getDateDebut());
        existingHistorique.setDateFin(historique.getDateFin());
        existingHistorique.setSalairePleinTemps(historique.getSalairePleinTemps());
        existingHistorique.setPourcentageSalaire(historique.getPourcentageSalaire());
        existingHistorique.setSalaireBase100(historique.getSalaireBase100());

        HistoriquePoste updatedHistorique = historiquePosteService.saveHistorique(existingHistorique);
        return ResponseEntity.ok(updatedHistorique);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHistorique(@PathVariable Long employeId, @PathVariable Long id) {
        historiquePosteService.deleteHistorique(id);
        return ResponseEntity.noContent().build();
    }
}