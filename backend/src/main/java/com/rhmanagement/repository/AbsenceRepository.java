package com.rhmanagement.repository;

import com.rhmanagement.entity.Absence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AbsenceRepository extends JpaRepository<Absence, Long> {

    List<Absence> findByEmployeId(Long employeId);
    List<Absence> findByStatut(Absence.StatutAbsence statut);

    @Query("SELECT a FROM Absence a WHERE a.employeId = :employeId AND a.dateAbsence = :date")
    List<Absence> findByEmployeAndDate(@Param("employeId") Long employeId, @Param("date") LocalDate date);

    @Query("SELECT a FROM Absence a WHERE a.dateAbsence BETWEEN :startDate AND :endDate")
    List<Absence> findByPeriode(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT a FROM Absence a WHERE a.employeId = :employeId AND a.dateAbsence BETWEEN :startDate AND :endDate")
    List<Absence> findByEmployeAndPeriode(@Param("employeId") Long employeId,
                                          @Param("startDate") LocalDate startDate,
                                          @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(a) FROM Absence a WHERE a.employeId = :employeId AND a.typeAbsenceId = :typeAbsenceId AND a.annee = :annee AND a.statut = 'VALIDE'")
    Integer countAbsencesByTypeAndYear(@Param("employeId") Long employeId,
                                       @Param("typeAbsenceId") Integer typeAbsenceId,
                                       @Param("annee") Integer annee);

    @Query("SELECT a.statut, COUNT(a) FROM Absence a WHERE a.annee = :annee GROUP BY a.statut")
    List<Object[]> countAbsencesByStatutAndAnnee(@Param("annee") Integer annee);

    @Query("SELECT ta.nom, COUNT(a) FROM Absence a JOIN TypeAbsence ta ON a.typeAbsenceId = ta.id WHERE a.annee = :annee GROUP BY ta.nom")
    List<Object[]> countAbsencesByTypeAndAnnee(@Param("annee") Integer annee);
}