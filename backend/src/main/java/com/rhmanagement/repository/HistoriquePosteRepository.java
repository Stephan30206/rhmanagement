package com.rhmanagement.repository;

import com.rhmanagement.entity.HistoriquePoste;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HistoriquePosteRepository extends JpaRepository<HistoriquePoste, Long> {
    List<HistoriquePoste> findByEmployeIdOrderByDateDebutDesc(Long employeId);
}