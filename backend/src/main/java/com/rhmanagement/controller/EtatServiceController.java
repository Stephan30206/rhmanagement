package com.rhmanagement.controller;

import com.rhmanagement.entity.Employe;
import com.rhmanagement.entity.HistoriquePoste;
import com.rhmanagement.service.EmployeService;
import com.rhmanagement.service.HistoriquePosteService;
import com.rhmanagement.service.PdfExportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.util.List;

@RestController
@RequestMapping("/api/employes/{employeId}/etat-service")
@CrossOrigin(origins = "*")
public class EtatServiceController {

    @Autowired
    private EmployeService employeService;

    @Autowired
    private HistoriquePosteService historiquePosteService;

    @Autowired
    private PdfExportService pdfExportService;

    @GetMapping("/export")
    public ResponseEntity<InputStreamResource> exportEtatService(@PathVariable Long employeId) {
        try {
            // Récupérer les données
            Employe employe = employeService.getEmployeById(employeId)
                    .orElseThrow(() -> new RuntimeException("Employé non trouvé"));

            List<HistoriquePoste> historique = historiquePosteService.getHistoriqueByEmployeId(employeId);

            // Générer le PDF
            ByteArrayInputStream pdfStream = pdfExportService.generateEtatServicePdf(employe, historique);

            // Préparer la réponse
            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=etat-service-" + employe.getMatricule() + ".pdf");

            return ResponseEntity.ok()
                    .headers(headers)
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(new InputStreamResource(pdfStream));
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de l'export de l'état de service", e);
        }
    }
}