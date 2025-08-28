package com.rhmanagement.repository;

import com.rhmanagement.entity.DemandeConge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DemandeCongeRepository extends JpaRepository<DemandeConge, Long> {

    // Méthodes existantes
    List<DemandeConge> findByEmployeId(Long employeId);

    List<DemandeConge> findByEmployeIdAndAnnee(Long employeId, int annee);

    // Nouvelles méthodes pour le service amélioré

    /**
     * Trouver les demandes par statut
     */
    List<DemandeConge> findByStatut(DemandeConge.StatutDemande statut);

    /**
     * Trouver les demandes par période (chevauchement de dates)
     */
    @Query("SELECT d FROM DemandeConge d WHERE " +
            "(d.dateDebut BETWEEN :dateDebut AND :dateFin) OR " +
            "(d.dateFin BETWEEN :dateDebut AND :dateFin) OR " +
            "(d.dateDebut <= :dateDebut AND d.dateFin >= :dateFin)")
    List<DemandeConge> findByDateDebutBetweenOrDateFinBetween(
            @Param("dateDebut") LocalDate dateDebut,
            @Param("dateFin") LocalDate dateFin);

    /**
     * Trouver les demandes approuvées pour un employé, type de congé et année spécifiques
     */
    List<DemandeConge> findByEmployeIdAndTypeCongeIdAndAnneeAndStatut(
            Long employeId,
            Long typeCongeId,
            Integer annee,
            DemandeConge.StatutDemande statut);

    /**
     * Trouver les congés conflictuels pour un employé sur une période donnée
     * Exclut une demande spécifique (utile pour les modifications)
     */
    @Query("SELECT d FROM DemandeConge d WHERE d.employeId = :employeId " +
            "AND d.statut IN ('APPROUVE', 'EN_ATTENTE') " +
            "AND ((d.dateDebut BETWEEN :dateDebut AND :dateFin) " +
            "OR (d.dateFin BETWEEN :dateDebut AND :dateFin) " +
            "OR (d.dateDebut <= :dateDebut AND d.dateFin >= :dateFin)) " +
            "AND (:excludeId IS NULL OR d.id != :excludeId)")
    List<DemandeConge> findConflictingLeaves(
            @Param("employeId") Long employeId,
            @Param("dateDebut") LocalDate dateDebut,
            @Param("dateFin") LocalDate dateFin,
            @Param("excludeId") Long excludeId);

    /**
     * Trouver toutes les demandes d'un employé pour une année donnée
     */
    List<DemandeConge> findByEmployeIdAndAnneeOrderByDateDebutDesc(Long employeId, Integer annee);

    /**
     * Trouver les demandes par type de congé
     */
    List<DemandeConge> findByTypeCongeId(Long typeCongeId);

    /**
     * Trouver les demandes en attente pour un employé
     */
    List<DemandeConge> findByEmployeIdAndStatut(Long employeId, DemandeConge.StatutDemande statut);

    /**
     * Compter les jours de congé utilisés pour un employé et un type de congé sur une année
     */
    // Option 2: Si ce champ n'existe pas, calculer les jours avec les dates
    @Query("SELECT COALESCE(SUM(DATEDIFF(d.dateFin, d.dateDebut) + 1), 0) FROM DemandeConge d WHERE " +
            "d.employeId = :employeId AND d.typeCongeId = :typeCongeId " +
            "AND d.annee = :annee AND d.statut = 'APPROUVE'")
    Integer countJoursUtilises(
            @Param("employeId") Long employeId,
            @Param("typeCongeId") Long typeCongeId,
            @Param("annee") Integer annee);

    /**
     * Trouver les demandes par approbateur
     */
    List<DemandeConge> findByApprouvePar(Long approbateurId);

    /**
     * Trouver les demandes créées entre deux dates
     */
    List<DemandeConge> findByDateCreationBetween(LocalDate dateDebut, LocalDate dateFin);

    /**
     * Trouver les demandes par statut et année
     */
    List<DemandeConge> findByStatutAndAnnee(DemandeConge.StatutDemande statut, Integer annee);

    /**
     * Statistiques : compter les demandes par statut pour une année
     */
    @Query("SELECT d.statut, COUNT(d) FROM DemandeConge d WHERE d.annee = :annee GROUP BY d.statut")
    List<Object[]> countDemandesByStatutAndAnnee(@Param("annee") Integer annee);

    /**
     * Statistiques : compter les demandes par type de congé pour une année
     */
    @Query("SELECT tc.nom, COUNT(d) FROM DemandeConge d " +
            "JOIN TypeConge tc ON d.typeCongeId = tc.id " +
            "WHERE d.annee = :annee GROUP BY tc.nom")
    List<Object[]> countDemandesByTypeCongeAndAnnee(@Param("annee") Integer annee);

    /**
     * Trouver les demandes qui commencent bientôt (dans les X jours)
     */
    @Query("SELECT d FROM DemandeConge d WHERE d.statut = 'APPROUVE' " +
            "AND d.dateDebut BETWEEN CURRENT_DATE AND :dateLimite " +
            "ORDER BY d.dateDebut ASC")
    List<DemandeConge> findDemandesCommencantBientot(@Param("dateLimite") LocalDate dateLimite);

    /**
     * Trouver les demandes en cours (congé actuellement pris)
     */
    @Query("SELECT d FROM DemandeConge d WHERE d.statut = 'APPROUVE' " +
            "AND CURRENT_DATE BETWEEN d.dateDebut AND d.dateFin")
    List<DemandeConge> findDemandesEnCours();

    /**
     * Vérifier si un employé est en congé à une date donnée
     */
    @Query("SELECT COUNT(d) > 0 FROM DemandeConge d WHERE d.employeId = :employeId " +
            "AND d.statut = 'APPROUVE' AND :date BETWEEN d.dateDebut AND d.dateFin")
    boolean isEmployeEnCongeALaDate(@Param("employeId") Long employeId, @Param("date") LocalDate date);

    List<DemandeConge> findByDateDebutBetweenOrDateFinBetween(LocalDate dateDebut, LocalDate dateFin, LocalDate dateDebut1, LocalDate dateFin1);
}