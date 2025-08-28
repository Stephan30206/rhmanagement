package com.rhmanagement.service;

import com.rhmanagement.entity.DemandeConge;
import com.rhmanagement.entity.Employe;
import com.rhmanagement.entity.TypeConge;
import com.rhmanagement.repository.DemandeCongeRepository;
import com.rhmanagement.repository.EmployeRepository;
import com.rhmanagement.repository.TypeCongeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class DemandeCongeService {

    @Autowired
    private DemandeCongeRepository demandeCongeRepository;

    @Autowired
    private EmployeRepository employeRepository;

    @Autowired
    private TypeCongeRepository typeCongeRepository;

    public List<DemandeConge> getAllDemandes() {
        return demandeCongeRepository.findAll();
    }

    public Optional<DemandeConge> getDemandeById(Long id) {
        return demandeCongeRepository.findById(id);
    }

    @Transactional
    public DemandeConge saveDemande(DemandeConge demande) {
        // Validation des données
        validateDemande(demande);

        // Définir le statut par défaut si non défini
        if (demande.getStatut() == null) {
            demande.setStatut(DemandeConge.StatutDemande.EN_ATTENTE);
        }

        // Définir l'année si non définie
        if (demande.getAnnee() == null) {
            demande.setAnnee(LocalDate.now().getYear());
        }

        // Calculer le nombre de jours demandés
        if (demande.getDateDebut() != null && demande.getDateFin() != null) {
            long joursDemandes = calculateWorkingDays(demande.getDateDebut(), demande.getDateFin());
            demande.setJoursDemandes((int) joursDemandes);
        }

        // Définir la date de création
        if (demande.getDateCreation() == null) {
            demande.setDateCreation(LocalDate.now().atStartOfDay());
        }

        return demandeCongeRepository.save(demande);
    }

    public void deleteDemande(Long id) {
        demandeCongeRepository.deleteById(id);
    }

    public List<DemandeConge> getDemandesByEmployeId(Long employeId) {
        return demandeCongeRepository.findByEmployeId(employeId);
    }

    /**
     * Approuver une demande de congé
     */
    @Transactional
    public DemandeConge approuverDemande(Long demandeId, Long approbateurId) {
        DemandeConge demande = demandeCongeRepository.findById(demandeId)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        if (demande.getStatut() != DemandeConge.StatutDemande.EN_ATTENTE) {
            throw new RuntimeException("Cette demande a déjà été traitée");
        }

        demande.setStatut(DemandeConge.StatutDemande.APPROUVE);
        demande.setApprouvePar(approbateurId);
        demande.setDateTraitement(LocalDate.now().atStartOfDay());

        return demandeCongeRepository.save(demande);
    }

    /**
     * Rejeter une demande de congé
     */
    @Transactional
    public DemandeConge rejeterDemande(Long demandeId, Long approbateurId, String motifRejet) {
        DemandeConge demande = demandeCongeRepository.findById(demandeId)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        if (demande.getStatut() != DemandeConge.StatutDemande.EN_ATTENTE) {
            throw new RuntimeException("Cette demande a déjà été traitée");
        }

        demande.setStatut(DemandeConge.StatutDemande.REJETE);
        demande.setApprouvePar(approbateurId);
        demande.setDateTraitement(LocalDate.now().atStartOfDay());
        demande.setMotifRejet(motifRejet);

        return demandeCongeRepository.save(demande);
    }

    /**
     * Annuler une demande de congé
     */
    @Transactional
    public DemandeConge annulerDemande(Long demandeId) {
        DemandeConge demande = demandeCongeRepository.findById(demandeId)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        if (demande.getStatut() == DemandeConge.StatutDemande.APPROUVE &&
                demande.getDateDebut().isBefore(LocalDate.now())) {
            throw new RuntimeException("Impossible d'annuler une demande approuvée déjà commencée");
        }

        demande.setStatut(DemandeConge.StatutDemande.ANNULE);
        demande.setDateTraitement(LocalDate.now().atStartOfDay());

        return demandeCongeRepository.save(demande);
    }

    /**
     * Obtenir les demandes en attente
     */
    public List<DemandeConge> getDemandesEnAttente() {
        return demandeCongeRepository.findByStatut(DemandeConge.StatutDemande.EN_ATTENTE);
    }

    /**
     * Obtenir les demandes par statut
     */
    public List<DemandeConge> getDemandesByStatut(DemandeConge.StatutDemande statut) {
        return demandeCongeRepository.findByStatut(statut);
    }

    /**
     * Obtenir les demandes par période
     */
    public List<DemandeConge> getDemandesByPeriode(LocalDate dateDebut, LocalDate dateFin) {
        return demandeCongeRepository.findByDateDebutBetweenOrDateFinBetween(
                dateDebut, dateFin, dateDebut, dateFin);
    }

    /**
     * Vérifier les conflits de congés pour un employé
     */
    public boolean hasConflictingLeave(Long employeId, LocalDate dateDebut, LocalDate dateFin, Long excludeDemandeId) {
        List<DemandeConge> conflictingDemandes = demandeCongeRepository
                .findConflictingLeaves(employeId, dateDebut, dateFin, excludeDemandeId);
        return !conflictingDemandes.isEmpty();
    }

    /**
     * Calculer les jours ouvrables entre deux dates (exclut weekends)
     */
    private long calculateWorkingDays(LocalDate startDate, LocalDate endDate) {
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("La date de début doit être antérieure à la date de fin");
        }

        long totalDays = ChronoUnit.DAYS.between(startDate, endDate) + 1; // +1 pour inclure le jour de début
        long workingDays = 0;

        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            DayOfWeek dayOfWeek = current.getDayOfWeek();
            if (dayOfWeek != DayOfWeek.SATURDAY && dayOfWeek != DayOfWeek.SUNDAY) {
                workingDays++;
            }
            current = current.plusDays(1);
        }

        return workingDays;
    }

    /**
     * Valider les données d'une demande de congé
     */
    private void validateDemande(DemandeConge demande) {
        // Vérifier que l'employé existe
        if (demande.getEmployeId() != null) {
            Employe employe = employeRepository.findById(demande.getEmployeId())
                    .orElseThrow(() -> new RuntimeException("Employé non trouvé avec l'ID: " + demande.getEmployeId()));
        }

        // Vérifier que le type de congé existe
        if (demande.getTypeCongeId() != null) {
            TypeConge typeConge = typeCongeRepository.findById(demande.getTypeCongeId())
                    .orElseThrow(() -> new RuntimeException("Type de congé non trouvé avec l'ID: " + demande.getTypeCongeId()));

            // Vérifier que le nombre de jours demandés ne dépasse pas le nombre alloué
            if (demande.getDateDebut() != null && demande.getDateFin() != null) {
                long joursDemandes = calculateWorkingDays(demande.getDateDebut(), demande.getDateFin());
                if (joursDemandes > typeConge.getJoursAlloues()) {
                    throw new RuntimeException("Le nombre de jours demandés (" + joursDemandes +
                            ") dépasse le nombre alloué (" + typeConge.getJoursAlloues() + ")");
                }
            }
        }

        // Vérifier les dates
        if (demande.getDateDebut() != null && demande.getDateFin() != null) {
            if (demande.getDateDebut().isAfter(demande.getDateFin())) {
                throw new RuntimeException("La date de début doit être antérieure à la date de fin");
            }

            if (demande.getDateDebut().isBefore(LocalDate.now())) {
                throw new RuntimeException("La date de début ne peut pas être dans le passé");
            }
        }

        // Vérifier les conflits de congés
        if (demande.getEmployeId() != null && demande.getDateDebut() != null && demande.getDateFin() != null) {
            Long excludeId = demande.getId(); // Pour les mises à jour
            if (hasConflictingLeave(demande.getEmployeId(), demande.getDateDebut(),
                    demande.getDateFin(), excludeId)) {
                throw new RuntimeException("Il existe déjà une demande de congé approuvée pour cette période");
            }
        }
    }

    /**
     * Obtenir le solde de congés restant pour un employé et un type de congé
     */
    public int getSoldeCongeRestant(Long employeId, Long typeCongeId, int annee) {
        TypeConge typeConge = typeCongeRepository.findById(Math.toIntExact(typeCongeId))
                .orElseThrow(() -> new RuntimeException("Type de congé non trouvé"));

        // Utiliser la méthode optimisée du repository
        Integer joursUtilises = demandeCongeRepository.countJoursUtilises(employeId, typeCongeId, annee);

        return typeConge.getJoursAlloues() - (joursUtilises != null ? joursUtilises : 0);
    }

    /**
     * Mettre à jour seulement le motif d'une demande
     */
    @Transactional
    public DemandeConge updateMotif(Long demandeId, String motif) {
        DemandeConge demande = demandeCongeRepository.findById(demandeId)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        // Permettre la modification du motif seulement si la demande est en attente
        if (demande.getStatut() != DemandeConge.StatutDemande.EN_ATTENTE) {
            throw new RuntimeException("Le motif ne peut être modifié que pour les demandes en attente");
        }

        demande.setMotif(motif);
        return demandeCongeRepository.save(demande);
    }

    /**
     * Obtenir les statistiques des demandes pour une année
     */
    public Map<String, Long> getStatistiquesDemandesParAnnee(Integer annee) {
        List<Object[]> statistiques = demandeCongeRepository.countDemandesByStatutAndAnnee(annee);

        Map<String, Long> result = new HashMap<>();
        result.put("EN_ATTENTE", 0L);
        result.put("APPROUVE", 0L);
        result.put("REJETE", 0L);
        result.put("ANNULE", 0L);

        for (Object[] stat : statistiques) {
            DemandeConge.StatutDemande statut = (DemandeConge.StatutDemande) stat[0];
            Long count = (Long) stat[1];
            result.put(statut.name(), count);
        }

        return result;
    }

    /**
     * Obtenir les statistiques par type de congé pour une année
     */
    public Map<String, Long> getStatistiquesParTypeConge(Integer annee) {
        List<Object[]> statistiques = demandeCongeRepository.countDemandesByTypeCongeAndAnnee(annee);

        Map<String, Long> result = new HashMap<>();
        for (Object[] stat : statistiques) {
            String typeCongeNom = (String) stat[0];
            Long count = (Long) stat[1];
            result.put(typeCongeNom, count);
        }

        return result;
    }

    /**
     * Vérifier si un employé peut prendre des congés à une date donnée
     */
    public boolean peutPrendreCongeALaDate(Long employeId, LocalDate date) {
        return !demandeCongeRepository.isEmployeEnCongeALaDate(employeId, date);
    }

    /**
     * Obtenir la liste des employés en congé aujourd'hui
     */
    public List<DemandeConge> getEmployesEnCongeAujourdhui() {
        return demandeCongeRepository.findDemandesEnCours();
    }

    /**
     * Obtenir les congés qui commencent dans les prochains jours
     */
    public List<DemandeConge> getCongesCommencantBientot(int nombreJours) {
        LocalDate dateLimite = LocalDate.now().plusDays(nombreJours);
        return demandeCongeRepository.findDemandesCommencantBientot(dateLimite);
    }
}