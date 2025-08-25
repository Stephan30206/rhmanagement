package com.rhmanagement.repository;

import com.rhmanagement.entity.Formation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FormationRepository extends JpaRepository<Formation, Long> {
    List<Formation> findByEmployeIdOrderByDateDebutDesc(Long employeId);
}