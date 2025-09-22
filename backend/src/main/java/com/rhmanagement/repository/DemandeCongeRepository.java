package com.rhmanagement.repository;

import com.rhmanagement.entity.DemandeConge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DemandeCongeRepository extends JpaRepository<DemandeConge, Long> {

    List<DemandeConge> findByEmployeId(Long employeId);
    List<DemandeConge> findByStatut(DemandeConge.StatutDemande statut);

    @Query("SELECT d FROM DemandeConge d WHERE " +
            "(d.dateDebut BETWEEN :dateDebut AND :dateFin) OR " +
            "(d.dateFin BETWEEN :dateDebut AND :dateFin)")
    List<DemandeConge> findByDateDebutBetweenOrDateFinBetween(
            @Param("dateDebut") LocalDate dateDebut,
            @Param("dateFin") LocalDate dateFin
    );

    @Query("SELECT d FROM DemandeConge d WHERE d.employeId = :employeId AND " +
            "d.statut = 'APPROUVE' AND " +
            "((d.dateDebut BETWEEN :dateDebut AND :dateFin) OR " +
            "(d.dateFin BETWEEN :dateDebut AND :dateFin) OR " +
            "(d.dateDebut <= :dateDebut AND d.dateFin >= :dateFin)) AND " +
            "(:excludeId IS NULL OR d.id != :excludeId)")
    List<DemandeConge> findConflictingLeaves(
            @Param("employeId") Long employeId,
            @Param("dateDebut") LocalDate dateDebut,
            @Param("dateFin") LocalDate dateFin,
            @Param("excludeId") Long excludeId
    );

    @Query("SELECT d.statut, COUNT(d) FROM DemandeConge d WHERE d.annee = :annee GROUP BY d.statut")
    List<Object[]> countDemandesByStatutAndAnnee(@Param("annee") Integer annee);

    @Query("SELECT CASE WHEN COUNT(d) > 0 THEN true ELSE false END FROM DemandeConge d WHERE " +
            "d.employeId = :employeId AND d.statut = 'APPROUVE' AND " +
            ":date BETWEEN d.dateDebut AND d.dateFin")
    boolean isEmployeEnCongeALaDate(@Param("employeId") Long employeId, @Param("date") LocalDate date);

    @Query("SELECT d FROM DemandeConge d WHERE d.statut = 'APPROUVE' AND " +
            "CURRENT_DATE BETWEEN d.dateDebut AND d.dateFin")
    List<DemandeConge> findDemandesEnCours();

    @Query("SELECT d FROM DemandeConge d WHERE d.statut = 'APPROUVE' AND " +
            "d.dateDebut BETWEEN CURRENT_DATE AND :dateLimite")
    List<DemandeConge> findDemandesCommencantBientot(@Param("dateLimite") LocalDate dateLimite);

    @Query("SELECT d FROM DemandeConge d WHERE d.employeId = :employeId AND d.statut = :statut")
    List<DemandeConge> findByEmployeIdAndStatut(
            @Param("employeId") Long employeId,
            @Param("statut") DemandeConge.StatutDemande statut);

    // AJOUTS POUR LA GESTION AUTOMATIQUE DES CONGÉS TERMINÉS

    /**
     * Trouve toutes les demandes de congé approuvées qui sont terminées (date de fin <= aujourd'hui)
     */
    @Query("SELECT d FROM DemandeConge d WHERE d.statut = 'APPROUVE' AND d.dateFin <= :aujourdhui")
    List<DemandeConge> findCongesApprouvesTermines(@Param("aujourdhui") LocalDate aujourdhui);

    /**
     * Trouve les demandes de congé approuvées pour un employé spécifique qui sont terminées
     */
    @Query("SELECT d FROM DemandeConge d WHERE d.employeId = :employeId AND d.statut = 'APPROUVE' AND d.dateFin <= :aujourdhui")
    List<DemandeConge> findCongesApprouvesTerminesByEmployeId(
            @Param("employeId") Long employeId,
            @Param("aujourdhui") LocalDate aujourdhui);

    /**
     * Vérifie si un employé a des congés approuvés qui se terminent aujourd'hui ou avant
     */
    @Query("SELECT CASE WHEN COUNT(d) > 0 THEN true ELSE false END FROM DemandeConge d " +
            "WHERE d.employeId = :employeId AND d.statut = 'APPROUVE' AND d.dateFin <= :aujourdhui")
    boolean hasCongesTermines(@Param("employeId") Long employeId, @Param("aujourdhui") LocalDate aujourdhui);

    /**
     * Trouve les demandes de congé approuvées qui se terminent aujourd'hui
     */
    @Query("SELECT d FROM DemandeConge d WHERE d.statut = 'APPROUVE' AND d.dateFin = :aujourdhui")
    List<DemandeConge> findCongesSeTerminantAujourdhui(@Param("aujourdhui") LocalDate aujourdhui);

    /**
     * Trouve les demandes de congé approuvées qui se terminent dans les prochains jours
     */
    @Query("SELECT d FROM DemandeConge d WHERE d.statut = 'APPROUVE' AND " +
            "d.dateFin BETWEEN :aujourdhui AND :dateLimite")
    List<DemandeConge> findCongesSeTerminantBientot(
            @Param("aujourdhui") LocalDate aujourdhui,
            @Param("dateLimite") LocalDate dateLimite);

    /**
     * Calcule le nombre total de jours de congé approuvés pour un employé dans une année
     */
    @Query("SELECT COALESCE(SUM(d.joursDemandes), 0) FROM DemandeConge d " +
            "WHERE d.employeId = :employeId AND d.statut = 'APPROUVE' AND d.annee = :annee")
    Integer calculateTotalJoursCongesApprouves(
            @Param("employeId") Long employeId,
            @Param("annee") Integer annee);

    /**
     * Trouve les demandes de congé par statut et par période
     */
    @Query("SELECT d FROM DemandeConge d WHERE d.statut = :statut AND " +
            "(d.dateDebut BETWEEN :dateDebut AND :dateFin OR d.dateFin BETWEEN :dateDebut AND :dateFin)")
    List<DemandeConge> findByStatutAndPeriode(
            @Param("statut") DemandeConge.StatutDemande statut,
            @Param("dateDebut") LocalDate dateDebut,
            @Param("dateFin") LocalDate dateFin);

    /**
     * Compte le nombre de demandes de congé par employé et par statut
     */
    @Query("SELECT d.employeId, COUNT(d) FROM DemandeConge d WHERE d.statut = :statut GROUP BY d.employeId")
    List<Object[]> countByEmployeIdAndStatut(@Param("statut") DemandeConge.StatutDemande statut);

    /**
     * Trouve un congé actif pour un employé à une date donnée
     */
    @Query("SELECT d FROM DemandeConge d WHERE d.employeId = :employeId " +
            "AND d.statut = 'APPROUVE' " +
            "AND d.dateDebut <= :date " +
            "AND d.dateFin >= :date")
    Optional<DemandeConge> findCongeActif(@Param("employeId") Long employeId,
                                          @Param("date") LocalDate date);

    /**
     * Trouve tous les congés qui se terminent aujourd'hui
     */
    @Query("SELECT d FROM DemandeConge d WHERE d.statut = 'APPROUVE' " +
            "AND d.dateFin = :date")
    List<DemandeConge> findCongesTerminantAujourdhui(@Param("date") LocalDate date);

    /**
     * Compte le nombre de congés actifs à une date donnée
     */
    @Query("SELECT COUNT(d) FROM DemandeConge d WHERE d.statut = 'APPROUVE' AND d.dateDebut <= :date AND d.dateFin >= :date")
    int countCongesActifs(@Param("date") LocalDate date);

    List<DemandeConge> findByDateDebutBetweenOrDateFinBetween(LocalDate dateDebut, LocalDate dateFin, LocalDate dateDebut1, LocalDate dateFin1);

    /**
     * Trouve les congés actifs pour un employé à une date donnée
     */
    @Query("SELECT d FROM DemandeConge d WHERE d.employeId = :employeId " +
            "AND d.statut = 'APPROUVE' " +
            "AND d.dateDebut <= :date " +
            "AND d.dateFin >= :date")
    List<DemandeConge> findCongesActifs(@Param("employeId") Long employeId,
                                        @Param("date") LocalDate date);


}