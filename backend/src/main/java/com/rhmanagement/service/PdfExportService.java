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
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class PdfExportService {

    public ByteArrayInputStream generateEtatServicePdf(Employe employe, List<HistoriquePoste> historique) {
        try {
            Document document = new Document(PageSize.A4.rotate());
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            PdfWriter.getInstance(document, out);
            document.open();

            // Titre
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Paragraph title = new Paragraph("ÉTAT DE SERVICE ANNUEL", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // Informations employé
            Font infoFont = FontFactory.getFont(FontFactory.HELVETICA, 12);
            document.add(new Paragraph("Nom: " + employe.getPrenom() + " " + employe.getNom(), infoFont));
            document.add(new Paragraph("Matricule: " + employe.getMatricule(), infoFont));
            document.add(new Paragraph("Poste actuel: " + employe.getPoste(), infoFont));
            document.add(new Paragraph(" "));

            // Tableau d'état de service
            PdfPTable table = new PdfPTable(10);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10);

            // En-têtes du tableau
            String[] headers = {
                    "Année", "Poste/Genre de Travail", "Organisation qui engage",
                    "Commence le J/M/A", "Termine le J/M/A", "Salaire à plein temps",
                    "Salaire à temps partiel", "Salaire à l'heure", "% de Salaire",
                    "100% de Salaire De base"
            };

            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                table.addCell(cell);
            }

            // Données
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            for (HistoriquePoste poste : historique) {
                // Année
                table.addCell(createCell(poste.getDateDebut().getYear() + ""));

                // Poste
                table.addCell(createCell(poste.getPoste()));

                // Organisation
                table.addCell(createCell(poste.getOrganisation()));

                // Date début
                table.addCell(createCell(poste.getDateDebut().format(formatter)));

                // Date fin
                String dateFin = poste.getDateFin() != null ?
                        poste.getDateFin().format(formatter) : "Présent";
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
            }

            document.add(table);
            document.close();

            return new ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la génération du PDF", e);
        }
    }

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