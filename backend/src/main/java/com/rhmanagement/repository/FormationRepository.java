package com.rhmanagement.repository;

import com.rhmanagement.entity.Formation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FormationRepository extends JpaRepository<Formation, Long> {

    /**
     * Trouve toutes les formations d'un employé, triées par date de début décroissante
     * Utilise une requête JPQL pour accéder à la relation employe
     */
    @Query("SELECT f FROM Formation f WHERE f.employe.id = :employeId ORDER BY f.dateDebut DESC")
    List<Formation> findByEmployeIdOrderByDateDebutDesc(@Param("employeId") Long employeId);

    /**
     * Trouve toutes les formations d'un employé par organisme
     */
    @Query("SELECT f FROM Formation f WHERE f.employe.id = :employeId AND f.organisme = :organisme")
    List<Formation> findByEmployeIdAndOrganisme(@Param("employeId") Long employeId, @Param("organisme") String organisme);

    /**
     * Trouve toutes les formations avec certificat pour un employé
     */
    @Query("SELECT f FROM Formation f WHERE f.employe.id = :employeId AND f.certificat IS NOT NULL AND f.certificat != ''")
    List<Formation> findFormationsWithCertificateByEmployeId(@Param("employeId") Long employeId);
}