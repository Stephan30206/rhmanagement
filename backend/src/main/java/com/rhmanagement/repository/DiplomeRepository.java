package com.rhmanagement.repository;

import com.rhmanagement.entity.Diplome;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DiplomeRepository extends JpaRepository<Diplome, Long> {
    List<Diplome> findByEmployeId(Long employeId);
}