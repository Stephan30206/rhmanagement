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

    List<DemandeConge> findByEmployeId(Long employeId);
    List<DemandeConge> findByStatut(DemandeConge.StatutDemande statut);

    @Query("SELECT d FROM DemandeConge d WHERE " +
            "(d.dateDebut BETWEEN :dateDebut AND :dateFin) OR " +
            "(d.dateFin BETWEEN :dateDebut AND :dateFin)")
    List<DemandeConge> findByDateDebutBetweenOrDateFinBetween(
            @Param("dateDebut") LocalDate dateDebut,
            @Param("dateFin") LocalDate dateFin,
            @Param("dateDebut") LocalDate dateDebut2,
            @Param("dateFin") LocalDate dateFin2
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

    @Query("SELECT COALESCE(SUM(d.joursDemandes), 0) FROM DemandeConge d WHERE " +
            "d.employeId = :employeId AND d.typeCongeId = :typeCongeId AND " +
            "d.annee = :annee AND d.statut = 'APPROUVE'")
    Integer countJoursUtilises(
            @Param("employeId") Long employeId,
            @Param("typeCongeId") Long typeCongeId,
            @Param("annee") Integer annee
    );

    @Query("SELECT d.statut, COUNT(d) FROM DemandeConge d WHERE d.annee = :annee GROUP BY d.statut")
    List<Object[]> countDemandesByStatutAndAnnee(@Param("annee") Integer annee);

    @Query("SELECT tc.nom, COUNT(d) FROM DemandeConge d JOIN TypeConge tc ON d.typeCongeId = tc.id " +
            "WHERE d.annee = :annee GROUP BY tc.nom")
    List<Object[]> countDemandesByTypeCongeAndAnnee(@Param("annee") Integer annee);

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
}