package com.rhmanagement.repository;

import com.rhmanagement.entity.DemandeConge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DemandeCongeRepository extends JpaRepository<DemandeConge, Long> {
    List<DemandeConge> findByEmployeId(Long employeId);

    List<DemandeConge> findByEmployeIdAndAnnee(Long employeId, int annee);
}