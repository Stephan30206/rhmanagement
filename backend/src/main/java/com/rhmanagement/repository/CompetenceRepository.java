package com.rhmanagement.repository;

import com.rhmanagement.entity.Competence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompetenceRepository extends JpaRepository<Competence, Long> {

    // CORRECTION : Utilisez le underscore pour naviguer dans la relation
    List<Competence> findByEmploye_Id(Long employeId);

    // OU alternative avec @Query (plus explicite)
    @Query("SELECT c FROM Competence c WHERE c.employe.id = :employeId")
    List<Competence> findByEmployeId(@Param("employeId") Long employeId);
}