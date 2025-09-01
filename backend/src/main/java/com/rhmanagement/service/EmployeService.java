package com.rhmanagement.service;

import com.rhmanagement.entity.Employe;
import com.rhmanagement.entity.Enfant;
import com.rhmanagement.repository.EmployeRepository;
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
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class EmployeService {

    @Autowired
    private EmployeRepository employeRepository;

    public List<Employe> getAllEmployes() {
        return employeRepository.findAll();
    }

    public Optional<Employe> getEmployeById(Long id) {
        return employeRepository.findById(id);
    }

    public Optional<Employe> getEmployeByMatricule(String matricule) {
        return employeRepository.findByMatricule(matricule);
    }

    public Employe saveEmploye(Employe employe) {
        // Générer un matricule si non fourni
        if (employe.getMatricule() == null || employe.getMatricule().isEmpty()) {
            employe.setMatricule(generateMatricule());
        }
        return employeRepository.save(employe);
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

        return employeRepository.save(employe);
    }

    public void deleteEmploye(Long id) {
        employeRepository.deleteById(id);
    }

    public List<Employe> searchEmployes(String search) {
        return employeRepository.searchEmployes(search);
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

        // Vérifier le répertoire d'upload
        Path uploadPath = Paths.get(uploadDirectory);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
            System.out.println("Répertoire upload créé: " + uploadPath.toAbsolutePath());
        }

        // Supprimer l'ancienne photo si elle existe
        if (employe.getPhotoProfil() != null && !employe.getPhotoProfil().isEmpty()) {
            Path oldPhotoPath = uploadPath.resolve(employe.getPhotoProfil());
            if (Files.exists(oldPhotoPath)) {
                Files.delete(oldPhotoPath);
                System.out.println("Ancienne photo supprimée: " + oldPhotoPath);
            }
        }

        // Générer un nom de fichier unique
        String originalFileName = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }

        String fileName = UUID.randomUUID().toString() + fileExtension;
        Path filePath = uploadPath.resolve(fileName);

        System.out.println("Sauvegarde fichier: " + filePath.toAbsolutePath());

        // Sauvegarder le fichier
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Mettre à jour l'employé
        employe.setPhotoProfil(fileName);
        Employe savedEmploye = employeRepository.save(employe);

        System.out.println("Photo sauvegardée avec succès: " + fileName);
        return savedEmploye;
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
}