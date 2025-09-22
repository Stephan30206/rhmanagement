package com.rhmanagement.service;

import com.rhmanagement.entity.DemandeConge;
import com.rhmanagement.entity.Employe;
import com.rhmanagement.repository.DemandeCongeRepository;
import com.rhmanagement.repository.EmployeRepository;
import org.modelmapper.internal.bytebuddy.dynamic.DynamicType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static com.rhmanagement.migration.PasswordBCryptMigration.log;

@Service
@Transactional
public class CongeStatusService {

    @Autowired
    private EmployeRepository employeRepository;

    @Autowired
    private DemandeCongeRepository demandeCongeRepository;

    /**
     * Vérifie tous les employés pour synchroniser leur statut
     * Cette méthode est appelée par le contrôleur
     */
    public void synchroniserTousLesStatuts() {
        List<Employe> employes = employeRepository.findAll();
        int countSuccess = 0;
        int countError = 0;

        for (Employe employe : employes) {
            try {
                synchroniserStatutEmploye(employe.getId());
                countSuccess++;
            } catch (Exception e) {
                System.err.println("Erreur synchronisation employé " + employe.getId() + ": " + e.getMessage());
                countError++;
            }
        }

        System.out.println("Synchronisation terminée: " + countSuccess + " succès, " + countError + " erreurs");
    }

    /**
     * Version planifiée (toutes les heures)
     */
    @Scheduled(fixedRate = 3600000)
    public void synchroniserTousLesStatutsPlanifie() {
        System.out.println("Début de la synchronisation planifiée des statuts...");
        synchroniserTousLesStatuts();
    }

    /**
     * Met à jour le statut de l'employé basé sur ses congés actifs
     */
    public void synchroniserStatutEmploye(Long employeId) {
        Employe employe = employeRepository.findById(employeId)
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));

        LocalDate aujourdhui = LocalDate.now();

        // Chercher un congé actif (approuvé et en cours)
        Optional<DemandeConge> congeActif = demandeCongeRepository
                .findCongeActif(employeId, aujourdhui);

        if (congeActif.isPresent()) {
            // Il y a un congé actif, mettre en EN_CONGE
            if (!Employe.StatutEmploye.EN_CONGE.equals(employe.getStatut())) {
                employe.setStatut(Employe.StatutEmploye.EN_CONGE);
                employeRepository.save(employe);
                log.info("Employé {} mis automatiquement EN_CONGE", employeId);
            }
        } else {
            // Pas de congé actif, remettre ACTIF si était EN_CONGE
            if (Employe.StatutEmploye.EN_CONGE.equals(employe.getStatut())) {
                employe.setStatut(Employe.StatutEmploye.ACTIF);
                employeRepository.save(employe);
                log.info("Employé {} remis automatiquement ACTIF", employeId);
            }
        }
    }
}