package com.rhmanagement.service;

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

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.*;
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
        employe.setPostePersonnalise(employeDetails.getPostePersonnalise()); // AJOUTEZ cette ligne
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

        // Appliquer la logique de gestion du poste personnalisé
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

        // Utilisez la méthode appropriée selon votre implémentation
        List<Employe> employesEnConge = employeRepository.findByStatut(Employe.StatutEmploye.EN_CONGE);

        return employesEnConge.stream()
                .filter(employe -> {
                    List<DemandeConge> demandesApprouvees = demandeCongeRepository.findByEmployeIdAndStatut(
                            employe.getId(),
                            DemandeConge.StatutDemande.APPROUVE
                    );

                    return demandesApprouvees.stream()
                            .anyMatch(demande -> {
                                // Supprimez .toLocalDate() car dateFin est déjà un LocalDate
                                LocalDate dateFin = demande.getDateFin(); // Pas de .toLocalDate() ici
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
        // Employés marqués EN_CONGE mais sans congé actif
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

        // Vérifier si l'employé a encore des congés actifs
        LocalDate aujourdhui = LocalDate.now();
        List<DemandeConge> congesActifs = demandeCongeRepository.findCongesActifs(employeId, aujourdhui);

        if (congesActifs.isEmpty()) {
            // Pas de congés actifs, mettre en ACTIF
            employe.setStatut(Employe.StatutEmploye.ACTIF);
            employe = employeRepository.save(employe);
        }

        return employe;
    }

    // Méthode pour obtenir le libellé du poste à afficher
    public String getLibellePoste(Employe employe) {
        if (employe.getPoste() == Employe.Poste.AUTRE &&
                employe.getPostePersonnalise() != null &&
                !employe.getPostePersonnalise().trim().isEmpty()) {
            return employe.getPostePersonnalise();
        }
        return employe.getPoste().name();
    }

//    public Employe saveEmploye(Employe employe) {
//        if (employe.getMatricule() == null || employe.getMatricule().isEmpty()) {
//            employe.setMatricule(generateMatricule());
//        }
//        return employeRepository.save(employe);
//    }

    // Méthode pour sauvegarder avec gestion du poste personnalisé
    public Employe saveEmploye(Employe employe) {
        // Générer matricule si nécessaire
        if (employe.getMatricule() == null || employe.getMatricule().isEmpty()) {
            employe.setMatricule(generateMatricule());
        }

        // Si le poste est AUTRE et qu'il y a un poste personnalisé
        if (employe.getPoste() == Employe.Poste.AUTRE &&
                employe.getPostePersonnalise() != null &&
                !employe.getPostePersonnalise().trim().isEmpty()) {

            // Le poste reste AUTRE mais on sauvegarde le poste personnalisé
            employe.setPostePersonnalise(employe.getPostePersonnalise().trim());
        } else if (employe.getPoste() != Employe.Poste.AUTRE) {
            // Si ce n'est pas AUTRE, on vide le champ personnalisé
            employe.setPostePersonnalise(null);
        }

        return employeRepository.save(employe);
    }
}