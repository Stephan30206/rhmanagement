package com.rhmanagement.service;

import com.itextpdf.text.Image;
import com.lowagie.text.Font;
import com.lowagie.text.Rectangle;
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
            // 🔹 TRIER LA LISTE PAR DATE DE DÉBUT (CROISSANT)
            List<HistoriquePoste> historiqueTrie = historique.stream()
                    .sorted(Comparator.comparing(HistoriquePoste::getDateDebut))
                    .collect(Collectors.toList());

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

            // ✅ CORRECTION : Utiliser getPosteLibelle au lieu de employe.getPoste()
            document.add(new Paragraph("Poste actuel : " + getPosteLibelle(employe), infoFont));
            document.add(new Paragraph(" "));

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

                // ✅ CORRECTION : Utiliser getPosteLibelle pour l'historique
                String libellePoste = getPosteLibelleHistorique(poste, employe);
                table.addCell(createCell(libellePoste));

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

            document.add(table);

            // ====== SECTION SIGNATURE ======
            document.add(new Paragraph("\n\n"));
            document.close();
            return new ByteArrayInputStream(out.toByteArray());

        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la génération du PDF", e);
        }
    }

    /**
     * Retourne le libellé du poste pour l'historique
     * Si le poste est "AUTRE" et qu'il y a un poste personnalisé, retourne le poste personnalisé
     * Sinon retourne le libellé correspondant au poste
     */
    private String getPosteLibelleHistorique(HistoriquePoste historiquePoste, Employe employe) {
        // Si c'est "AUTRE" et qu'il y a un poste personnalisé sur l'employé
        if ("AUTRE".equals(historiquePoste.getPoste()) &&
                employe.getPostePersonnalise() != null &&
                !employe.getPostePersonnalise().trim().isEmpty()) {
            return employe.getPostePersonnalise();
        }

        // Sinon, utiliser la correspondance des postes
        return getPosteLibelleFromValue(historiquePoste.getPoste());
    }

    /**
     * Retourne le libellé français pour une valeur de poste
     */
    private String getPosteLibelleFromValue(String posteValue) {
        if (posteValue == null) return "Non spécifié";

        switch (posteValue) {
            case "EVANGELISTE": return "Évangéliste";
            case "PASTEUR_STAGIAIRE": return "Pasteur stagiaire";
            case "PASTEUR_AUTORISE": return "Pasteur autorisé";
            case "PASTEUR_CONSACRE": return "Pasteur consacré";
            case "SECRETAIRE_EXECUTIF": return "Secrétaire exécutif";
            case "TRESORIER": return "Trésorier";
            case "ASSISTANT_RH": return "Assistant RH";
            case "VERIFICATEUR": return "Vérificateur";
            case "AUTRE": return "Autre";
            default: return posteValue;
        }
    }

    public ByteArrayInputStream generateFicheEmployePdf(Employe employe, List<Enfant> enfants) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);

            document.open();

            // ====== EN-TÊTE AVEC PHOTO ======
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{1, 3}); // Photo à gauche, informations à droite

            // Cellule pour la photo
            PdfPCell photoCell = new PdfPCell();
            photoCell.setBorder(Rectangle.NO_BORDER);
            photoCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            photoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            photoCell.setPadding(10);

            // Ajouter la photo si elle existe
            boolean photoLoaded = false;
            if (employe.getPhotoProfil() != null && !employe.getPhotoProfil().isEmpty()) {
                try {
                    // Charger l'image depuis le système de fichiers
                    Image photo = Image.getInstance("uploads/" + employe.getPhotoProfil());
                    photo.scaleToFit(80, 100); // Taille fixe pour la photo
                    photoCell.addElement((Element) photo);
                } catch (Exception e) {
                    // Si l'image ne peut pas être chargée, afficher un placeholder
                    Paragraph placeholder = new Paragraph("Photo\nnon disponible",
                            FontFactory.getFont(FontFactory.HELVETICA, 10));
                    placeholder.setAlignment(Element.ALIGN_CENTER);
                    photoCell.addElement(placeholder);
                }
            } else {
                // Aucune photo disponible
                Paragraph noPhoto = new Paragraph("Aucune\nphoto",
                        FontFactory.getFont(FontFactory.HELVETICA, 10));
                noPhoto.setAlignment(Element.ALIGN_CENTER);
                photoCell.addElement(noPhoto);
            }

            // Cellule pour les informations principales
            PdfPCell infoCell = new PdfPCell();
            infoCell.setBorder(Rectangle.NO_BORDER);
            infoCell.setPadding(10);

            // Titre principal
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Paragraph title = new Paragraph("FICHE EMPLOYÉ", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(10);

            // Informations principales
            Font infoFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Paragraph nomComplet = new Paragraph(employe.getPrenom() + " " + employe.getNom(), infoFont);
            Paragraph matricule = new Paragraph("Matricule: " + getSafeString(employe.getMatricule()),
                    FontFactory.getFont(FontFactory.HELVETICA, 10));
            Paragraph poste = new Paragraph("Poste: " + getPosteLibelle(employe),
                    FontFactory.getFont(FontFactory.HELVETICA, 10));

            infoCell.addElement(title);
            infoCell.addElement(nomComplet);
            infoCell.addElement(matricule);
            infoCell.addElement(poste);

            headerTable.addCell(photoCell);
            headerTable.addCell(infoCell);
            document.add(headerTable);

            document.add(new Paragraph(" ")); // Espacement

            // ====== INFORMATIONS PERSONNELLES ======
            Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Paragraph section1 = new Paragraph("INFORMATIONS PERSONNELLES", sectionFont);
            section1.setSpacingAfter(10);
            document.add(section1);

            // Tableau pour les informations personnelles
            PdfPTable table1 = new PdfPTable(4);
            table1.setWidthPercentage(100);
            table1.setWidths(new float[]{1, 2, 1, 2});

            addSimpleTableRow(table1, "Nom", getSafeString(employe.getNom()));
            addSimpleTableRow(table1, "Prénom", getSafeString(employe.getPrenom()));
            addSimpleTableRow(table1, "Date de naissance", formatDate(employe.getDateNaissance()));
            addSimpleTableRow(table1, "Lieu de naissance", getSafeString(employe.getLieuNaissance()));
            addSimpleTableRow(table1, "Nationalité", getSafeString(employe.getNationalite()));
            addSimpleTableRow(table1, "Numéro CIN", getSafeString(employe.getCin()));
            addSimpleTableRow(table1, "Adresse", getSafeString(employe.getAdresse()));
            addSimpleTableRow(table1, "Téléphone", getSafeString(employe.getTelephone()));
            addSimpleTableRow(table1, "Email", getSafeString(employe.getEmail()));
            addSimpleTableRow(table1, "Statut matrimonial", getStatutMatrimonialLibelle(employe.getStatutMatrimonial()));
            addSimpleTableRow(table1, "Nom du père", getSafeString(employe.getNomPere()));
            addSimpleTableRow(table1, "Nom de la mère", getSafeString(employe.getNomMere()));
            addSimpleTableRow(table1, "Numéro CNAPS", getSafeString(employe.getNumeroCNAPS()));

            document.add(table1);

            // Ligne de séparation
            document.add(new Paragraph("---"));
            document.add(new Paragraph(" "));

            // ====== CONTACT D'URGENCE ======
            Paragraph section2 = new Paragraph("CONTACT D'URGENCE", sectionFont);
            section2.setSpacingAfter(10);
            document.add(section2);

            // Tableau pour contact d'urgence avec en-têtes
            PdfPTable table2 = new PdfPTable(3);
            table2.setWidthPercentage(100);
            table2.setWidths(new float[]{1, 1, 1});

            // En-têtes
            addTableHeader(table2, "Nom");
            addTableHeader(table2, "Lien avec l'employé");
            addTableHeader(table2, "Téléphone");

            // Données
            addSimpleCell(table2, getSafeString(employe.getContactUrgenceNom()));
            addSimpleCell(table2, getSafeString(employe.getContactUrgenceLien()));
            addSimpleCell(table2, getSafeString(employe.getContactUrgenceTelephone()));

            document.add(table2);

            document.add(new Paragraph("---"));
            document.add(new Paragraph(" "));

            // ====== INFORMATIONS PROFESSIONNELLES ======
            Paragraph section3 = new Paragraph("INFORMATIONS PROFESSIONNELLES", sectionFont);
            section3.setSpacingAfter(10);
            document.add(section3);

            PdfPTable table3 = new PdfPTable(4);
            table3.setWidthPercentage(100);
            table3.setWidths(new float[]{1, 2, 1, 2});

            addSimpleTableRow(table3, "Matricule", getSafeString(employe.getMatricule()));
            addSimpleTableRow(table3, "Poste", getPosteLibelle(employe));
            addSimpleTableRow(table3, "Catégorie", getStatutEmployeLibelle(employe.getStatut()));
            addSimpleTableRow(table3, "Organisation employeur", getSafeString(employe.getOrganisationEmployeur()));
            addSimpleTableRow(table3, "Type de contrat", getTypeContratLibelle(employe.getTypeContrat()));
            addSimpleTableRow(table3, "Date de début du contrat", formatDate(employe.getDateDebut()));
            addSimpleTableRow(table3, "Date de fin (si applicable)", formatDate(employe.getDateFin()));
            addSimpleTableRow(table3, "Salaire de base", formatSalaire(employe.getSalaireBase()));
            addSimpleTableRow(table3, "Pourcentage salaire", formatPourcentage(employe.getPourcentageSalaire()));
            addSimpleTableRow(table3, "Superviseur hiérarchique", getSafeString(employe.getSuperviseurHierarchique()));
            addSimpleTableRow(table3, "Affectation actuelle", getSafeString(employe.getAffectationActuelle()));

            document.add(table3);

            document.add(new Paragraph("---"));
            document.add(new Paragraph(" "));

            // ====== ACCRÉDITATION ======
            Paragraph section4 = new Paragraph("ACCRÉDITATION", sectionFont);
            section4.setSpacingAfter(10);
            document.add(section4);

            PdfPTable table4 = new PdfPTable(4);
            table4.setWidthPercentage(100);
            table4.setWidths(new float[]{1, 2, 1, 2});

            addSimpleTableRow(table4, "Date d'accréditation", formatDate(employe.getDateAccreditation()));
            addSimpleTableRow(table4, "Niveau d'accréditation", getSafeString(String.valueOf(employe.getNiveauAccreditation())));
            addSimpleTableRow(table4, "Groupe d'accréditation", getSafeString(employe.getGroupeAccreditation()));

            document.add(table4);

            document.add(new Paragraph("---"));
            document.add(new Paragraph(" "));

            // ====== SUIVI ======
            Paragraph section5 = new Paragraph("SUIVI", sectionFont);
            section5.setSpacingAfter(10);
            document.add(section5);

            PdfPTable table5 = new PdfPTable(4);
            table5.setWidthPercentage(100);
            table5.setWidths(new float[]{1, 2, 1, 2});

            LocalDate now = LocalDate.now();
            addSimpleTableRow(table5, "Date de création de la fiche", formatDate(now));
            addSimpleTableRow(table5, "Dernière mise à jour", formatDate(now));
            addSimpleTableRow(table5, "Créé par", "RH");
            addSimpleTableRow(table5, "Mis à jour par", "RH");

            document.add(table5);

            // ====== INFORMATIONS FAMILIALES (si marié) ======
            if (employe.getStatutMatrimonial() != null &&
                    employe.getStatutMatrimonial().name().equals("MARIE")) {

                document.add(new Paragraph("---"));
                document.add(new Paragraph(" "));

                Paragraph section6 = new Paragraph("INFORMATIONS FAMILIALES", sectionFont);
                section6.setSpacingAfter(10);
                document.add(section6);

                PdfPTable table6 = new PdfPTable(4);
                table6.setWidthPercentage(100);
                table6.setWidths(new float[]{1, 2, 1, 2});

                addSimpleTableRow(table6, "Nom du conjoint", getSafeString(employe.getNomConjoint()));
                addSimpleTableRow(table6, "Date de mariage", formatDate(employe.getDateMariage()));
                addSimpleTableRow(table6, "Date de naissance du conjoint", formatDate(employe.getDateNaissanceConjoint()));
                addSimpleTableRow(table6, "Nombre d'enfants", String.valueOf(enfants != null ? enfants.size() : 0));

                document.add(table6);

                // Liste des enfants
                if (enfants != null && !enfants.isEmpty()) {
                    document.add(new Paragraph(" "));
                    Paragraph enfantsTitle = new Paragraph("Liste des enfants:",
                            FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10));
                    document.add(enfantsTitle);

                    for (Enfant enfant : enfants) {
                        Paragraph enfantInfo = new Paragraph("• " + getSafeString(enfant.getNom()) +
                                " - Né(e) le " + formatDate(enfant.getDateNaissance()),
                                FontFactory.getFont(FontFactory.HELVETICA, 10));
                        document.add(enfantInfo);
                    }
                }
            }

            // Pied de page
            document.add(new Paragraph(" "));
            Font footerFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8);
            Paragraph footer = new Paragraph("Document généré le " +
                    LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), footerFont);
            footer.setAlignment(Element.ALIGN_RIGHT);
            document.add(footer);

            document.close();
            return new ByteArrayInputStream(out.toByteArray());

        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la génération de la fiche employé PDF", e);
        }
    }

    // ====== MÉTHODES UTILITAIRES ======

    private void addSimpleTableRow(PdfPTable table, String label, String value) {
        // Cellule label
        PdfPCell labelCell = new PdfPCell(new Phrase(label,
                FontFactory.getFont(FontFactory.HELVETICA, 10)));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setPadding(5);
        table.addCell(labelCell);

        // Cellule valeur
        PdfPCell valueCell = new PdfPCell(new Phrase(value != null ? value : "Non spécifié",
                FontFactory.getFont(FontFactory.HELVETICA, 10)));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setPadding(5);
        table.addCell(valueCell);
    }

    private void addTableHeader(PdfPTable table, String header) {
        PdfPCell headerCell = new PdfPCell(new Phrase(header,
                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
        headerCell.setBorder(Rectangle.NO_BORDER);
        headerCell.setPadding(5);
        headerCell.setBackgroundColor(new Color(240, 240, 240));
        table.addCell(headerCell);
    }

    private void addSimpleCell(PdfPTable table, String content) {
        PdfPCell cell = new PdfPCell(new Phrase(content != null ? content : "Non spécifié",
                FontFactory.getFont(FontFactory.HELVETICA, 10)));
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(5);
        table.addCell(cell);
    }

    private PdfPCell createCell(String content) {
        PdfPCell cell = new PdfPCell(new Phrase(content, FontFactory.getFont(FontFactory.HELVETICA, 9)));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(3);
        return cell;
    }

    private String formatCurrency(Number amount) {
        if (amount == null) return "0 MGA";
        try {
            if (amount instanceof java.math.BigDecimal) {
                java.math.BigDecimal bd = (java.math.BigDecimal) amount;
                return String.format("%,.0f MGA", bd.doubleValue());
            } else {
                return String.format("%,d MGA", amount.longValue());
            }
        } catch (Exception e) {
            return amount.toString() + " MGA";
        }
    }

    private Double calculateSalaireTempsPartiel(HistoriquePoste poste) {
        if (poste.getSalairePleinTemps() == null || poste.getPourcentageSalaire() == null)
            return 0.0;
        return poste.getSalairePleinTemps().doubleValue() * (poste.getPourcentageSalaire().doubleValue() / 100);
    }

    private Double calculateSalaireHeure(HistoriquePoste poste) {
        double heuresMensuelles = 173.33;
        Double salaireTempsPartiel = calculateSalaireTempsPartiel(poste);
        return salaireTempsPartiel / heuresMensuelles;
    }

    private String getPosteLibelle(Employe employe) {
        // Si c'est "AUTRE" et qu'il y a un poste personnalisé
        if (employe.getPoste() == Employe.Poste.AUTRE &&
                employe.getPostePersonnalise() != null &&
                !employe.getPostePersonnalise().trim().isEmpty()) {
            return employe.getPostePersonnalise();
        }

        // Sinon, utiliser la correspondance des postes
        return getPosteLibelleFromEnum(employe.getPoste());
    }

    /**
     * Retourne le libellé français pour un enum Poste
     */
    private String getPosteLibelleFromEnum(Employe.Poste poste) {
        if (poste == null) return "Non spécifié";

        switch (poste) {
            case EVANGELISTE: return "Évangéliste";
            case PASTEUR_STAGIAIRE: return "Pasteur stagiaire";
            case PASTEUR_AUTORISE: return "Pasteur autorisé";
            case PASTEUR_CONSACRE: return "Pasteur consacré";
            case SECRETAIRE_EXECUTIF: return "Secrétaire exécutif";
            case TRESORIER: return "Trésorier";
            case ASSISTANT_RH: return "Assistant RH";
            case VERIFICATEUR: return "Vérificateur";
            case AUTRE: return "Autre";
            default: return poste.name();
        }
    }

    private String getStatutMatrimonialLibelle(Employe.StatutMatrimonial statut) {
        if (statut == null) return "Non spécifié";
        switch (statut.name()) {
            case "MARIE": return "Marié(e)";
            case "CELIBATAIRE": return "Célibataire";
            case "DIVORCE": return "Divorcé(e)";
            case "VEUF": return "Veuf/Veuve";
            default: return statut.name();
        }
    }

    private String getStatutEmployeLibelle(Employe.StatutEmploye statut) {
        return statut != null ? statut.name() : "Non spécifié";
    }

    private String getTypeContratLibelle(Employe.TypeContrat contrat) {
        if (contrat == null) return "Non spécifié";
        switch (contrat.name()) {
            case "CDI": return "CDI";
            case "CDD": return "CDD";
            case "STAGE": return "Stage";
            case "INTERIM": return "Intérim";
            default: return contrat.name();
        }
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