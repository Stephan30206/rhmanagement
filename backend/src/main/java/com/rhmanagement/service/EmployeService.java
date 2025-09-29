package com.rhmanagement.service;

import com.itextpdf.text.BaseColor;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfWriter;
import com.rhmanagement.entity.Employe;
import com.rhmanagement.entity.Enfant;
import com.rhmanagement.entity.DemandeConge;
import com.rhmanagement.repository.EmployeRepository;
import com.rhmanagement.repository.DemandeCongeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class EmployeService {

    @Autowired
    private EmployeRepository employeRepository;

    @Autowired
    private DemandeCongeRepository demandeCongeRepository;

    public List<Employe> getAllEmployes() {
        return employeRepository.findAll();
    }

    public Optional<Employe> getEmployeById(Long id) {
        return employeRepository.findById(id);
    }

    public Optional<Employe> getEmployeByMatricule(String matricule) {
        return employeRepository.findByMatricule(matricule);
    }

    public Employe updateEmploye(Long id, Employe employeDetails) {
        Employe employe = employeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employé non trouvé avec l'ID : " + id));

        // Mise à jour des champs
        employe.setNom(employeDetails.getNom());
        employe.setPrenom(employeDetails.getPrenom());
        employe.setDateNaissance(employeDetails.getDateNaissance());
        employe.setLieuNaissance(employeDetails.getLieuNaissance());
        employe.setNationalite(employeDetails.getNationalite());
        employe.setCin(employeDetails.getCin());
        employe.setAdresse(employeDetails.getAdresse());
        employe.setTelephone(employeDetails.getTelephone());
        employe.setEmail(employeDetails.getEmail());
        employe.setNumeroCNAPS(employeDetails.getNumeroCNAPS());
        employe.setStatutMatrimonial(employeDetails.getStatutMatrimonial());
        employe.setDateMariage(employeDetails.getDateMariage());
        employe.setContactUrgenceNom(employeDetails.getContactUrgenceNom());
        employe.setContactUrgenceLien(employeDetails.getContactUrgenceLien());
        employe.setContactUrgenceTelephone(employeDetails.getContactUrgenceTelephone());
        employe.setNomPere(employeDetails.getNomPere());
        employe.setNomMere(employeDetails.getNomMere());
        employe.setPoste(employeDetails.getPoste());
        employe.setPostePersonnalise(employeDetails.getPostePersonnalise());
        employe.setOrganisationEmployeur(employeDetails.getOrganisationEmployeur());
        employe.setTypeContrat(employeDetails.getTypeContrat());
        employe.setDateDebut(employeDetails.getDateDebut());
        employe.setDateFin(employeDetails.getDateFin());
        employe.setSalaireBase(employeDetails.getSalaireBase());
        employe.setPourcentageSalaire(employeDetails.getPourcentageSalaire());
        employe.setStatut(employeDetails.getStatut());
        employe.setDateAccreditation(employeDetails.getDateAccreditation());
        employe.setNiveauAccreditation(employeDetails.getNiveauAccreditation());
        employe.setGroupeAccreditation(employeDetails.getGroupeAccreditation());
        employe.setSuperviseurHierarchique(employeDetails.getSuperviseurHierarchique());
        employe.setAffectationActuelle(employeDetails.getAffectationActuelle());

        return saveEmploye(employe);
    }

    public void deleteEmploye(Long id) {
        employeRepository.deleteById(id);
    }

    public List<Employe> searchEmployes(String query) {
        return employeRepository.searchEmployes(query);
    }

    public List<Employe> getEmployesByStatut(Employe.StatutEmploye statut) {
        return employeRepository.findByStatut(statut);
    }

    public List<Employe> getPasteurs() {
        return employeRepository.findAllPasteurs();
    }

    public long getEmployeCountByStatut(Employe.StatutEmploye statut) {
        return employeRepository.countByStatut(statut);
    }

    private String generateMatricule() {
        long count = employeRepository.count();
        return String.format("EMP%06d", count + 1);
    }

    @Value("${upload.directory}")
    private String uploadDirectory;

    public Employe uploadPhoto(Long id, MultipartFile file) throws IOException {
        Optional<Employe> optionalEmploye = employeRepository.findById(id);

        if (optionalEmploye.isEmpty()) {
            throw new RuntimeException("Employé non trouvé avec ID: " + id);
        }

        Employe employe = optionalEmploye.get();

        Path uploadPath = Paths.get(uploadDirectory);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        if (employe.getPhotoProfil() != null && !employe.getPhotoProfil().isEmpty()) {
            Path oldPhotoPath = uploadPath.resolve(employe.getPhotoProfil());
            if (Files.exists(oldPhotoPath)) {
                Files.delete(oldPhotoPath);
            }
        }

        String originalFileName = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }

        String fileName = UUID.randomUUID().toString() + fileExtension;
        Path filePath = uploadPath.resolve(fileName);

        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        employe.setPhotoProfil(fileName);
        return employeRepository.save(employe);
    }

    public Employe deletePhoto(Long id) {
        Optional<Employe> optionalEmploye = employeRepository.findById(id);

        if (optionalEmploye.isPresent()) {
            Employe employe = optionalEmploye.get();

            if (employe.getPhotoProfil() != null) {
                try {
                    Path photoPath = Paths.get(uploadDirectory, employe.getPhotoProfil());
                    Files.deleteIfExists(photoPath);
                } catch (IOException e) {
                    // Log l'erreur mais continue
                }

                employe.setPhotoProfil(null);
                return employeRepository.save(employe);
            }
        }

        throw new RuntimeException("Employé non trouvé");
    }

    public List<Enfant> getEnfantsByEmployeId(Long employeId) {
        Optional<Employe> employe = employeRepository.findById(employeId);
        return employe.map(Employe::getEnfants).orElse(Collections.emptyList());
    }

    public List<Map<String, Object>> getEmployesAvecCongesTermines() {
        LocalDate aujourdhui = LocalDate.now();

        List<Employe> employesEnConge = employeRepository.findByStatut(Employe.StatutEmploye.EN_CONGE);

        return employesEnConge.stream()
                .filter(employe -> {
                    List<DemandeConge> demandesApprouvees = demandeCongeRepository.findByEmployeIdAndStatut(
                            employe.getId(),
                            DemandeConge.StatutDemande.APPROUVE
                    );

                    return demandesApprouvees.stream()
                            .anyMatch(demande -> {
                                LocalDate dateFin = demande.getDateFin();
                                return dateFin.isBefore(aujourdhui) || dateFin.isEqual(aujourdhui);
                            });
                })
                .map(employe -> {
                    Map<String, Object> result = new HashMap<>();
                    result.put("employeId", employe.getId());
                    result.put("employeNom", employe.getPrenom() + " " + employe.getNom());
                    return result;
                })
                .collect(Collectors.toList());
    }

    public Employe updateStatutEmploye(Long id, String statut) {
        Employe employe = employeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));
        employe.setStatut(Employe.StatutEmploye.valueOf(statut));
        return employeRepository.save(employe);
    }

    public int getTotalEmployes() {
        return Math.toIntExact(employeRepository.count());
    }

    public int getEmployesEnCongeCount() {
        return Math.toIntExact(employeRepository.countByStatut(Employe.StatutEmploye.EN_CONGE));
    }

    public int getIncoherencesStatutCount() {
        LocalDate aujourdhui = LocalDate.now();
        List<Employe> employesEnConge = employeRepository.findByStatut(Employe.StatutEmploye.EN_CONGE);

        int incoherences = 0;
        for (Employe employe : employesEnConge) {
            Optional<DemandeConge> congeActif = demandeCongeRepository.findCongeActif(employe.getId(), aujourdhui);
            if (congeActif.isEmpty()) {
                incoherences++;
            }
        }

        return incoherences;
    }

    public Employe mettreEmployeActif(Long employeId) {
        Employe employe = employeRepository.findById(employeId)
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));

        LocalDate aujourdhui = LocalDate.now();
        List<DemandeConge> congesActifs = demandeCongeRepository.findCongesActifs(employeId, aujourdhui);

        if (congesActifs.isEmpty()) {
            employe.setStatut(Employe.StatutEmploye.ACTIF);
            employe = employeRepository.save(employe);
        }

        return employe;
    }

    public String getLibellePoste(Employe employe) {
        if (employe.getPoste() == Employe.Poste.AUTRE &&
                employe.getPostePersonnalise() != null &&
                !employe.getPostePersonnalise().trim().isEmpty()) {
            return employe.getPostePersonnalise();
        }

        // Mapping des postes standards
        Map<Employe.Poste, String> postesLabels = Map.of(
                Employe.Poste.EVANGELISTE, "Évangéliste",
                Employe.Poste.PASTEUR_STAGIAIRE, "Pasteur stagiaire",
                Employe.Poste.PASTEUR_AUTORISE, "Pasteur autorisé",
                Employe.Poste.PASTEUR_CONSACRE, "Pasteur consacré",
                Employe.Poste.SECRETAIRE_EXECUTIF, "Secrétaire exécutif",
                Employe.Poste.TRESORIER, "Trésorier",
                Employe.Poste.ASSISTANT_RH, "Assistant RH",
                Employe.Poste.VERIFICATEUR, "Vérificateur",
                Employe.Poste.AUTRE, "Autre"
        );

        return postesLabels.getOrDefault(employe.getPoste(), employe.getPoste().name());
    }

    public Employe saveEmploye(Employe employe) {
        // Génération matricule si nécessaire
        if (employe.getMatricule() == null || employe.getMatricule().isEmpty()) {
            employe.setMatricule(generateMatricule());
        }

        // Gestion cohérente du poste personnalisé
        if (employe.getPoste() == Employe.Poste.AUTRE) {
            // Valider que le poste personnalisé est renseigné
            if (employe.getPostePersonnalise() == null ||
                    employe.getPostePersonnalise().trim().isEmpty()) {
                throw new RuntimeException("Un poste personnalisé doit être spécifié lorsque 'AUTRE' est sélectionné");
            }
            employe.setPostePersonnalise(employe.getPostePersonnalise().trim());
        } else {
            // Nettoyer le poste personnalisé si ce n'est pas "AUTRE"
            employe.setPostePersonnalise(null);
        }

        return employeRepository.save(employe);
    }

    public byte[] generateFicheEmployePdf(Long id) {
        try {
            System.out.println("Début génération PDF pour employé ID: " + id);

            Employe employe = employeRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Employé non trouvé avec l'ID : " + id));

            List<Enfant> enfants = getEnfantsByEmployeId(id);

            System.out.println("Employé trouvé: " + employe.getPrenom() + " " + employe.getNom());

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4);

            PdfWriter.getInstance(document, baos);
            document.open();

            // Titre principal - Correction de la méthode getFont
            Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD, new Color(0, 0, 255)); // Bleu
            Paragraph title = new Paragraph("FICHE EMPLOYÉ", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // Section Informations Personnelles
            addSectionTitle(document, "INFORMATIONS PERSONNELLES");
            addInfoLine(document, "Nom complet", getSafeString(employe.getPrenom() + " " + employe.getNom()));
            addInfoLine(document, "Matricule", getSafeString(employe.getMatricule()));
            addInfoLine(document, "Date de naissance", formatDate(employe.getDateNaissance()));
            addInfoLine(document, "Lieu de naissance", getSafeString(employe.getLieuNaissance()));
            addInfoLine(document, "CIN", getSafeString(employe.getCin()));
            addInfoLine(document, "Nationalité", getSafeString(employe.getNationalite()));
            addInfoLine(document, "Statut matrimonial",
                    employe.getStatutMatrimonial() != null ? employe.getStatutMatrimonial().name() : "Non spécifié");
            addInfoLine(document, "Numéro CNAPS", getSafeString(employe.getNumeroCNAPS()));
            addInfoLine(document, "Nom du père", getSafeString(employe.getNomPere()));
            addInfoLine(document, "Nom de la mère", getSafeString(employe.getNomMere()));

            document.add(Chunk.NEWLINE);

            // Section Contact
            addSectionTitle(document, "INFORMATIONS DE CONTACT");
            addInfoLine(document, "Adresse", getSafeString(employe.getAdresse()));
            addInfoLine(document, "Téléphone", getSafeString(employe.getTelephone()));
            addInfoLine(document, "Email", getSafeString(employe.getEmail()));

            document.add(Chunk.NEWLINE);

            // Section Contact d'urgence
            addSectionTitle(document, "CONTACT D'URGENCE");
            addInfoLine(document, "Nom", getSafeString(employe.getContactUrgenceNom()));
            addInfoLine(document, "Lien", getSafeString(employe.getContactUrgenceLien()));
            addInfoLine(document, "Téléphone", getSafeString(employe.getContactUrgenceTelephone()));

            document.add(Chunk.NEWLINE);

            // Section Professionnelle - CORRECTION DES TYPES NUMÉRIQUES
            addSectionTitle(document, "INFORMATIONS PROFESSIONNELLES");
            addInfoLine(document, "Poste", getLibellePoste(employe));
            addInfoLine(document, "Statut", employe.getStatut() != null ? employe.getStatut().name() : "Non spécifié");
            addInfoLine(document, "Type de contrat", getSafeString(String.valueOf(employe.getTypeContrat())));
            addInfoLine(document, "Organisation employeur", getSafeString(employe.getOrganisationEmployeur()));
            addInfoLine(document, "Date de début", formatDate(employe.getDateDebut()));
            addInfoLine(document, "Date de fin", formatDate(employe.getDateFin()));

            // CORRECTION : Gestion sécurisée des nombres sans cast problématique
            String salaireBaseStr = "Non spécifié";
            if (employe.getSalaireBase() != null) {
                try {
                    // Utilisation directe de toString() pour éviter les problèmes de cast
                    Number salaire = employe.getSalaireBase();
                    if (salaire instanceof java.math.BigDecimal) {
                        java.math.BigDecimal bd = (java.math.BigDecimal) salaire;
                        salaireBaseStr = String.format("%,.0f MGA", bd.doubleValue());
                    } else {
                        salaireBaseStr = String.format("%,d MGA", salaire.longValue());
                    }
                } catch (Exception e) {
                    salaireBaseStr = employe.getSalaireBase().toString() + " MGA";
                }
            }
            addInfoLine(document, "Salaire base", salaireBaseStr);

            // CORRECTION : Gestion sécurisée du pourcentage
            String pourcentageStr = "Non spécifié";
            if (employe.getPourcentageSalaire() != null) {
                try {
                    Number pourcentage = employe.getPourcentageSalaire();
                    if (pourcentage instanceof java.math.BigDecimal) {
                        java.math.BigDecimal bd = (java.math.BigDecimal) pourcentage;
                        pourcentageStr = String.format("%.0f%%", bd.doubleValue());
                    } else {
                        pourcentageStr = pourcentage.toString() + "%";
                    }
                } catch (Exception e) {
                    pourcentageStr = employe.getPourcentageSalaire().toString() + "%";
                }
            }
            addInfoLine(document, "Pourcentage salaire", pourcentageStr);

            addInfoLine(document, "Superviseur hiérarchique", getSafeString(employe.getSuperviseurHierarchique()));
            addInfoLine(document, "Affectation actuelle", getSafeString(employe.getAffectationActuelle()));

            document.add(Chunk.NEWLINE);

            // Section Accréditation
            addSectionTitle(document, "ACCRÉDITATION");
            addInfoLine(document, "Date d'accréditation", formatDate(employe.getDateAccreditation()));
            addInfoLine(document, "Niveau d'accréditation", getSafeString(String.valueOf(employe.getNiveauAccreditation())));
            addInfoLine(document, "Groupe d'accréditation", getSafeString(employe.getGroupeAccreditation()));

            // Informations familiales si marié
            if (employe.getStatutMatrimonial() != null &&
                    employe.getStatutMatrimonial().name().equals("MARIE")) {

                document.add(Chunk.NEWLINE);
                addSectionTitle(document, "INFORMATIONS FAMILIALES");
                addInfoLine(document, "Nom du conjoint", getSafeString(employe.getNomConjoint()));
                addInfoLine(document, "Date de mariage", formatDate(employe.getDateMariage()));
                addInfoLine(document, "Date de naissance du conjoint", formatDate(employe.getDateNaissanceConjoint()));
                addInfoLine(document, "Nombre d'enfants", String.valueOf(enfants.size()));

                if (!enfants.isEmpty()) {
                    document.add(Chunk.NEWLINE);
                    addSimpleLine(document, "Liste des enfants:", Font.BOLD);

                    for (Enfant enfant : enfants) {
                        addSimpleLine(document, "• " + getSafeString(enfant.getNom()),
                                formatDate(enfant.getDateNaissance()));
                    }
                }
            }

            // Pied de page
            document.add(Chunk.NEWLINE);
            Font footerFont = new Font(Font.HELVETICA, 10, Font.ITALIC, new Color(128, 128, 128)); // Gris
            Paragraph footer = new Paragraph("Document généré le " +
                    LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), footerFont);
            footer.setAlignment(Element.ALIGN_RIGHT);
            document.add(footer);

            document.close();

            byte[] pdfBytes = baos.toByteArray();
            System.out.println("PDF généré avec succès, taille: " + pdfBytes.length + " bytes");

            return pdfBytes;

        } catch (Exception e) {
            System.err.println("Erreur lors de la génération du PDF: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erreur lors de la génération du PDF: " + e.getMessage(), e);
        }
    }

    private void addSectionTitle(Document document, String title) throws DocumentException {
        // Correction de la méthode Font
        Font sectionFont = new Font(Font.HELVETICA, 14, Font.BOLD, new Color(169, 169, 169)); // Gris foncé
        Paragraph section = new Paragraph(title, sectionFont);
        section.setSpacingAfter(10);
        document.add(section);
    }

    private void addInfoLine(Document document, String label, String value) throws DocumentException {
        if (value == null) value = "Non spécifié";

        Font labelFont = new Font(Font.HELVETICA, 12, Font.BOLD);
        Font valueFont = new Font(Font.HELVETICA, 12, Font.NORMAL);

        Paragraph line = new Paragraph();
        line.add(new Chunk(label + ": ", labelFont));
        line.add(new Chunk(value, valueFont));
        line.setSpacingAfter(5);
        document.add(line);
    }

    private void addSimpleLine(Document document, String label, String value) throws DocumentException {
        if (value == null) value = "Non spécifié";

        Paragraph line = new Paragraph();
        line.add(new Chunk(label + " " + value, new Font(Font.HELVETICA, 12, Font.NORMAL)));
        line.setSpacingAfter(3);
        document.add(line);
    }

    private void addSimpleLine(Document document, String text, int style) throws DocumentException {
        Paragraph line = new Paragraph(text, new Font(Font.HELVETICA, 12, style));
        line.setSpacingAfter(3);
        document.add(line);
    }

    private String formatDate(LocalDate date) {
        if (date == null) return "Non spécifié";
        return date.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
    }

    private String formatDate(java.util.Date date) {
        if (date == null) return "Non spécifié";
        try {
            return date.toInstant()
                    .atZone(java.time.ZoneId.systemDefault())
                    .toLocalDate()
                    .format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        } catch (Exception e) {
            return date.toString();
        }
    }

    private String getSafeString(String value) {
        return (value != null && !value.trim().isEmpty()) ? value : "Non spécifié";
    }
}