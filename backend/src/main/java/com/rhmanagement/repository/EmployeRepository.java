package com.rhmanagement.repository;

import com.rhmanagement.entity.Employe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeRepository extends JpaRepository<Employe, Long> {

    Optional<Employe> findByMatricule(String matricule);

    Optional<Employe> findByCin(String cin);

    List<Employe> findByStatut(Employe.StatutEmploye statut);

    List<Employe> findByPoste(Employe.Poste poste);

    @Query("SELECT e FROM Employe e WHERE " +
            "LOWER(e.nom) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(e.prenom) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "e.matricule LIKE CONCAT('%', :search, '%')")
    List<Employe> searchEmployes(@Param("search") String search);

    @Query("SELECT e FROM Employe e WHERE e.poste IN ('PASTEUR_TITULAIRE', 'PASTEUR_ASSOCIE', 'EVANGELISTE', 'ANCIEN', 'MISSIONNAIRE')")
    List<Employe> findAllPasteurs();

    long countByStatut(Employe.StatutEmploye statut);
}