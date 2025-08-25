package com.rhmanagement.repository;

import com.rhmanagement.entity.Enfant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EnfantRepository extends JpaRepository<Enfant, Long> {
    List<Enfant> findByEmployeId(Long employeId);
}