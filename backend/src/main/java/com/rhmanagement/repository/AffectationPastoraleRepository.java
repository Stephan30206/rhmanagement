package com.rhmanagement.repository;

import com.rhmanagement.entity.AffectationPastorale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AffectationPastoraleRepository extends JpaRepository<AffectationPastorale, Long> {

    // CETTE METHODE DOIT EXISTER
    List<AffectationPastorale> findByPasteurIdOrderByDateDebutDesc(Long pasteurId);

    List<AffectationPastorale> findByPasteurIdAndStatut(Long pasteurId, AffectationPastorale.StatutAffectation statut);
}