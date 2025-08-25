package com.rhmanagement.repository;

import com.rhmanagement.entity.Competence;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CompetenceRepository extends JpaRepository<Competence, Long> {
    List<Competence> findByEmployeId(Long employeId);
    List<Competence> findByEmployeIdAndCategorie(Long employeId, String categorie);
}