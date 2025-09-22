package com.rhmanagement.service;

import com.rhmanagement.entity.DemandeConge;
import com.rhmanagement.entity.Employe;
import com.rhmanagement.repository.DemandeCongeRepository;
import com.rhmanagement.repository.EmployeRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CongeAutoManagementService {

    private final DemandeCongeRepository demandeCongeRepository;
    private final EmployeRepository employeRepository;

    public CongeAutoManagementService(DemandeCongeRepository demandeCongeRepository,
                                      EmployeRepository employeRepository) {
        this.demandeCongeRepository = demandeCongeRepository;
        this.employeRepository = employeRepository;
    }

    /**
     * Vérifie et met à jour automatiquement les statuts des employés dont le congé est terminé
     * Exécuté tous les jours à minuit
     */
    @Scheduled(cron = "0 0 0 * * ?") // Tous les jours à minuit
    @Transactional
    public void verifierEtMettreAJourCongesTermines() {
        LocalDate aujourdhui = LocalDate.now();

        // Trouver tous les congés approuvés qui sont terminés
        List<DemandeConge> congésTermines = demandeCongeRepository.findCongesApprouvesTermines(aujourdhui);

        Map<Long, String> employesMisAJour = new HashMap<>();

        for (DemandeConge conge : congésTermines) {
            Long employeId = conge.getEmployeId();

            // Vérifier si l'employé a d'autres congés en cours
            boolean autresCongesEnCours = hasOtherActiveConges(employeId, aujourdhui, conge.getId());

            if (!autresCongesEnCours) {
                // Mettre à jour le statut de l'employé
                Employe employe = employeRepository.findById(employeId)
                        .orElseThrow(() -> new RuntimeException("Employé non trouvé: " + employeId));

                if ("EN_CONGE".equals(employe.getStatut())) {
                    employe.setStatut(Employe.StatutEmploye.valueOf("ACTIF"));
                    employeRepository.save(employe);
                    employesMisAJour.put(employeId, employe.getPrenom() + " " + employe.getNom());

                    // Optionnel : Marquer le congé comme traité
                    conge.setNote("Congé terminé - Employé réactivé automatiquement le " + aujourdhui);
                    demandeCongeRepository.save(conge);
                }
            }
        }

        // Log ou notification des mises à jour
        if (!employesMisAJour.isEmpty()) {
            System.out.println("Employés réactivés automatiquement: " + employesMisAJour);
            // Ici-vous pourriez envoyer une notification ou un email
        }
    }

    /**
     * Vérifie si un employé a d'autres congés actifs
     */
    private boolean hasOtherActiveConges(Long employeId, LocalDate date, Long excludeCongeId) {
        List<DemandeConge> autresConges = demandeCongeRepository.findByEmployeIdAndStatut(employeId, DemandeConge.StatutDemande.APPROUVE);

        return autresConges.stream()
                .filter(conge -> !conge.getId().equals(excludeCongeId))
                .anyMatch(conge ->
                        !conge.getDateFin().isBefore(date) && // Le congé n'est pas encore terminé
                                !conge.getDateDebut().isAfter(date)   // Le congé a déjà commencé
                );
    }

    /**
     * Méthode pour obtenir la liste des employés dont le congé est terminé
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getEmployesAvecCongesTermines() {
        LocalDate aujourdhui = LocalDate.now();

        return demandeCongeRepository.findCongesApprouvesTermines(aujourdhui).stream()
                .map(conge -> {
                    Map<String, Object> result = new HashMap<>();
                    result.put("employeId", conge.getEmployeId());
                    result.put("demandeCongeId", conge.getId());
                    result.put("dateDebut", conge.getDateDebut());
                    result.put("dateFin", conge.getDateFin());
                    result.put("typeConge", conge.getTypeConge());
                    return result;
                })
                .collect(Collectors.toList());
    }
}