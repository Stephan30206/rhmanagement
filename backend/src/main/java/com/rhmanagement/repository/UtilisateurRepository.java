package com.rhmanagement.repository;

import com.rhmanagement.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {

    @Query("SELECT COUNT(u) FROM Utilisateur u")
    long count();

    Optional<Utilisateur> findByNomUtilisateur(String nomUtilisateur);
    Optional<Utilisateur> findByEmail(String email);
    boolean existsByNomUtilisateur(String nomUtilisateur);
    boolean existsByEmail(String email);
}