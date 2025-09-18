package com.rhmanagement.service;

import com.rhmanagement.entity.Employe;
import com.rhmanagement.entity.HistoriquePoste;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PdfExportService {

    public ByteArrayInputStream generateEtatServicePdf(Employe employe, List<HistoriquePoste> historique) {
        try {
            // 🔹 TRIER LA LISTE PAR DATE DE DÉBUT (CROISSANT). Années ascendantes
            List<HistoriquePoste> historiqueTrie = historique.stream()
                    .sorted(Comparator.comparing(HistoriquePoste::getDateDebut))
                    .collect(Collectors.toList());

            // Document A4 en format paysage
            Document document = new Document(PageSize.A4.rotate());
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            PdfWriter.getInstance(document, out);
            document.open();

            // ====== TITRE ======
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Paragraph title = new Paragraph("ÉTAT DE SERVICE ANNUEL", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // ====== INFORMATIONS EMPLOYÉ ======
            Font infoFont = FontFactory.getFont(FontFactory.HELVETICA, 12);
            document.add(new Paragraph("Nom : " + employe.getPrenom() + " " + employe.getNom(), infoFont));
            document.add(new Paragraph("Matricule : " + employe.getMatricule(), infoFont));
            document.add(new Paragraph("Poste actuel : " + employe.getPoste(), infoFont));
            document.add(new Paragraph(" ")); // espace

            // ====== TABLEAU ÉTAT DE SERVICE ======
            PdfPTable table = new PdfPTable(11);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10);

            // En-têtes du tableau
            String[] headers = {
                    "Année", "Poste/Genre de Travail", "Organisation qui engage",
                    "Commence le J/M/A", "Termine le J/M/A", "Salaire à plein temps",
                    "Salaire à temps partiel", "Salaire à l'heure", "% de Salaire",
                    "100% de Salaire de base", "Signature des adminis"
            };

            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                table.addCell(cell);
            }

            // ====== CONTENU DU TABLEAU ======
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

            for (HistoriquePoste poste : historiqueTrie) {
                // Année
                table.addCell(createCell(String.valueOf(poste.getDateDebut().getYear())));

                // Poste
                table.addCell(createCell(poste.getPoste()));

                // Organisation
                table.addCell(createCell(poste.getOrganisation()));

                // Date début
                table.addCell(createCell(poste.getDateDebut().format(formatter)));

                // Date fin
                String dateFin = poste.getDateFin() != null
                        ? poste.getDateFin().format(formatter)
                        : "Présent";
                table.addCell(createCell(dateFin));

                // Salaire plein temps
                table.addCell(createCell(formatCurrency(poste.getSalairePleinTemps())));

                // Salaire temps partiel (calculé)
                table.addCell(createCell(formatCurrency(calculateSalaireTempsPartiel(poste))));

                // Salaire à l'heure (calculé)
                table.addCell(createCell(formatCurrency(calculateSalaireHeure(poste))));

                // Pourcentage salaire
                table.addCell(createCell(poste.getPourcentageSalaire() + "%"));

                // Salaire base 100%
                table.addCell(createCell(formatCurrency(poste.getSalaireBase100())));

                // Signature vide
                table.addCell(createCell(""));
            }

            // Ajout du tableau au document
            document.add(table);

            // ====== SECTION SIGNATURE ======
            document.add(new Paragraph("\n\n"));
            PdfPTable signatureTable = new PdfPTable(2);
            signatureTable.setWidthPercentage(100);
            signatureTable.setSpacingBefore(20);
            document.add(signatureTable);

            // Fermeture
            document.close();
            return new ByteArrayInputStream(out.toByteArray());

        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la génération du PDF", e);
        }
    }

    // ====== MÉTHODES UTILITAIRES ======
    private PdfPCell createCell(String content) {
        PdfPCell cell = new PdfPCell(new Phrase(content, FontFactory.getFont(FontFactory.HELVETICA, 9)));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        return cell;
    }

    private String formatCurrency(Number amount) {
        if (amount == null) return "0";
        return String.format("%,.0f MGA", amount.doubleValue());
    }

    private Double calculateSalaireTempsPartiel(HistoriquePoste poste) {
        if (poste.getSalairePleinTemps() == null || poste.getPourcentageSalaire() == null)
            return 0.0;
        return poste.getSalairePleinTemps().doubleValue() * (poste.getPourcentageSalaire().doubleValue() / 100);
    }

    private Double calculateSalaireHeure(HistoriquePoste poste) {
        // Supposons 173.33 heures par mois (35h/semaine * 52 semaines / 12 mois)
        double heuresMensuelles = 173.33;
        Double salaireTempsPartiel = calculateSalaireTempsPartiel(poste);
        return salaireTempsPartiel / heuresMensuelles;
    }
}