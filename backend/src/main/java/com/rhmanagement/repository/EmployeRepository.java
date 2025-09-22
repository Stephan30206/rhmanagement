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

    List<Employe> findByPoste(Employe.Poste poste);

    // Modifier :search en :query
    @Query("SELECT e FROM Employe e WHERE " +
            "LOWER(e.nom) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(e.prenom) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "e.matricule LIKE CONCAT('%', :query, '%')")
    List<Employe> searchEmployes(@Param("query") String query);

    @Query("SELECT e FROM Employe e WHERE e.poste IN (' EVANGELISTE', 'PASTEUR_STAGIAIRE', 'PASTEUR_AUTORISE', 'PASTEUR_CONSACRE')")
    List<Employe> findAllPasteurs();


    List<Employe> findByStatut(String statut);

    List<Employe> findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCase(String nom, String prenom);

    @Query("SELECT e FROM Employe e WHERE e.statut = 'EN_CONGE'")
    List<Employe> findEmployesEnConge();

    @Query("SELECT e FROM Employe e WHERE e.poste = :poste")
    List<Employe> findByPoste(@Param("poste") String poste);

    boolean existsByEmail(String email);

    boolean existsByTelephone(String telephone);

    int countByStatut(Employe.StatutEmploye statut);
    List<Employe> findByStatut(Employe.StatutEmploye statut);

}