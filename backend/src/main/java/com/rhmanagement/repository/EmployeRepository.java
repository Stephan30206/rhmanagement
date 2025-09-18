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

    // Modifier :search en :query
    @Query("SELECT e FROM Employe e WHERE " +
            "LOWER(e.nom) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(e.prenom) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "e.matricule LIKE CONCAT('%', :query, '%')")
    List<Employe> searchEmployes(@Param("query") String query);

    @Query("SELECT e FROM Employe e WHERE e.poste IN (' EVANGELISTE', 'PASTEUR_STAGIAIRE', 'PASTEUR_AUTORISE', 'PASTEUR_CONSACRE')")
    List<Employe> findAllPasteurs();

    long countByStatut(Employe.StatutEmploye statut);
}