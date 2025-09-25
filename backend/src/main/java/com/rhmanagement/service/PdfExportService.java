package com.rhmanagement.service;

import com.lowagie.text.Font;
import com.rhmanagement.entity.Employe;
import com.rhmanagement.entity.HistoriquePoste;
import com.rhmanagement.entity.Enfant;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
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

    public ByteArrayInputStream generateFicheEmployePdf(Employe employe, List<Enfant> enfants) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);

            document.open();

            // Titre principal
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            titleFont.setColor(Color.BLUE);
            Paragraph title = new Paragraph("FICHE EMPLOYÉ", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // Section 1: Informations personnelles
            addSectionTitle(document, "INFORMATIONS PERSONNELLES");
            addInfoLine(document, "Nom complet", employe.getPrenom() + " " + employe.getNom());
            addInfoLine(document, "Matricule", employe.getMatricule());
            addInfoLine(document, "Date de naissance", formatDate(employe.getDateNaissance()));
            addInfoLine(document, "Lieu de naissance", getSafeString(employe.getLieuNaissance()));
            addInfoLine(document, "CIN", getSafeString(employe.getCin()));
            addInfoLine(document, "Nationalité", getSafeString(employe.getNationalite()));
            addInfoLine(document, "Statut matrimonial", getStatutMatrimonialLibelle(employe.getStatutMatrimonial()));
            addInfoLine(document, "Numéro CNAPS", getSafeString(employe.getNumeroCNAPS()));
            addInfoLine(document, "Nom du père", getSafeString(employe.getNomPere()));
            addInfoLine(document, "Nom de la mère", getSafeString(employe.getNomMere()));

            document.add(new Paragraph(" "));

            // Section 2: Informations de contact
            addSectionTitle(document, "INFORMATIONS DE CONTACT");
            addInfoLine(document, "Adresse", getSafeString(employe.getAdresse()));
            addInfoLine(document, "Téléphone", getSafeString(employe.getTelephone()));
            addInfoLine(document, "Email", getSafeString(employe.getEmail()));

            document.add(new Paragraph(" "));

            // Section 3: Contact d'urgence
            addSectionTitle(document, "CONTACT D'URGENCE");
            addInfoLine(document, "Nom", getSafeString(employe.getContactUrgenceNom()));
            addInfoLine(document, "Lien", getSafeString(employe.getContactUrgenceLien()));
            addInfoLine(document, "Téléphone", getSafeString(employe.getContactUrgenceTelephone()));

            document.add(new Paragraph(" "));

            // Section 4: Informations professionnelles
            addSectionTitle(document, "INFORMATIONS PROFESSIONNELLES");
            addInfoLine(document, "Poste", getPosteLibelle(employe));
            addInfoLine(document, "Statut", getStatutEmployeLibelle(employe.getStatut()));
            addInfoLine(document, "Type de contrat", getTypeContratLibelle(employe.getTypeContrat()));
            addInfoLine(document, "Organisation employeur", getSafeString(employe.getOrganisationEmployeur()));
            addInfoLine(document, "Date de début", formatDate(employe.getDateDebut()));
            addInfoLine(document, "Date de fin", formatDate(employe.getDateFin()));
            addInfoLine(document, "Salaire base", formatSalaire(employe.getSalaireBase()));
            addInfoLine(document, "Pourcentage salaire", formatPourcentage(employe.getPourcentageSalaire()));
            addInfoLine(document, "Superviseur hiérarchique", getSafeString(employe.getSuperviseurHierarchique()));
            addInfoLine(document, "Affectation actuelle", getSafeString(employe.getAffectationActuelle()));

            document.add(new Paragraph(" "));

            // Section 5: Accréditation
            addSectionTitle(document, "ACCRÉDITATION");
            addInfoLine(document, "Date d'accréditation", formatDate(employe.getDateAccreditation()));
            addInfoLine(document, "Niveau d'accréditation", getSafeString(String.valueOf(employe.getNiveauAccreditation())));
            addInfoLine(document, "Groupe d'accréditation", getSafeString(employe.getGroupeAccreditation()));

            // Section 6: Informations familiales (si marié)
            if (employe.getStatutMatrimonial() != null &&
                    employe.getStatutMatrimonial().name().equals("MARIE")) {

                document.add(new Paragraph(" "));
                addSectionTitle(document, "INFORMATIONS FAMILIALES");
                addInfoLine(document, "Nom du conjoint", getSafeString(employe.getNomConjoint()));
                addInfoLine(document, "Date de mariage", formatDate(employe.getDateMariage()));
                addInfoLine(document, "Date de naissance du conjoint", formatDate(employe.getDateNaissanceConjoint()));
                addInfoLine(document, "Nombre d'enfants", String.valueOf(enfants != null ? enfants.size() : 0));

                // Liste des enfants
                if (enfants != null && !enfants.isEmpty()) {
                    document.add(new Paragraph(" "));
                    Paragraph enfantsTitle = new Paragraph("Liste des enfants:",
                            FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12));
                    enfantsTitle.setSpacingAfter(5);
                    document.add(enfantsTitle);

                    for (Enfant enfant : enfants) {
                        addSimpleLine(document, "• " + getSafeString(enfant.getNom()) +
                                " - Né(e) le " + formatDate(enfant.getDateNaissance()));
                    }
                }
            }

            // Pied de page
            addFooter(document);

            document.close();
            return new ByteArrayInputStream(out.toByteArray());

        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la génération de la fiche employé PDF", e);
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

    // Méthodes utilitaires pour la fiche employé
    private void addSectionTitle(Document document, String titleText) throws DocumentException {
        Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
        font.setColor(Color.DARK_GRAY);
        Paragraph title = new Paragraph(titleText, font);
        title.setSpacingAfter(10);
        document.add(title);
    }

    private void addInfoLine(Document document, String label, String value) throws DocumentException {
        if (value == null) value = "Non spécifié";

        Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
        Font valueFont = FontFactory.getFont(FontFactory.HELVETICA, 12);

        Paragraph line = new Paragraph();
        line.add(new Chunk(label + ": ", labelFont));
        line.add(new Chunk(value, valueFont));
        line.setSpacingAfter(5);
        document.add(line);
    }

    private void addSimpleLine(Document document, String text) throws DocumentException {
        Paragraph line = new Paragraph(text,
                FontFactory.getFont(FontFactory.HELVETICA, 12));
        line.setSpacingAfter(3);
        document.add(line);
    }

    private void addFooter(Document document) throws DocumentException {
        document.add(new Paragraph(" "));
        Font footerFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10);
        footerFont.setColor(Color.GRAY);
        Paragraph footer = new Paragraph("Document généré le " +
                LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), footerFont);
        footer.setAlignment(Element.ALIGN_RIGHT);
        document.add(footer);
    }

    private String getPosteLibelle(Employe employe) {
        if (employe.getPoste() == Employe.Poste.AUTRE &&
                employe.getPostePersonnalise() != null &&
                !employe.getPostePersonnalise().trim().isEmpty()) {
            return employe.getPostePersonnalise();
        }
        return employe.getPoste() != null ? employe.getPoste().name() : "Non spécifié";
    }

    private String getStatutMatrimonialLibelle(Employe.StatutMatrimonial statut) {
        return statut != null ? statut.name() : "Non spécifié";
    }

    private String getStatutEmployeLibelle(Employe.StatutEmploye statut) {
        return statut != null ? statut.name() : "Non spécifié";
    }

    private String getTypeContratLibelle(Employe.TypeContrat contrat) {
        return contrat != null ? contrat.name() : "Non spécifié";
    }

    private String formatDate(LocalDate date) {
        if (date == null) return "Non spécifié";
        return date.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
    }

    private String formatSalaire(Number salaire) {
        if (salaire == null) return "Non spécifié";
        try {
            if (salaire instanceof java.math.BigDecimal) {
                java.math.BigDecimal bd = (java.math.BigDecimal) salaire;
                return String.format("%,.0f MGA", bd.doubleValue());
            } else {
                return String.format("%,d MGA", salaire.longValue());
            }
        } catch (Exception e) {
            return salaire.toString() + " MGA";
        }
    }

    private String formatPourcentage(Number pourcentage) {
        if (pourcentage == null) return "Non spécifié";
        try {
            if (pourcentage instanceof java.math.BigDecimal) {
                java.math.BigDecimal bd = (java.math.BigDecimal) pourcentage;
                return String.format("%.0f%%", bd.doubleValue());
            } else {
                return pourcentage.toString() + "%";
            }
        } catch (Exception e) {
            return pourcentage.toString() + "%";
        }
    }

    private String getSafeString(String value) {
        return (value != null && !value.trim().isEmpty()) ? value : "Non spécifié";
    }
}