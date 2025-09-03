package com.rhmanagement.repository;

import com.rhmanagement.entity.TypeConge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TypeCongeRepository extends JpaRepository<TypeConge, Integer> {
    Optional<TypeConge> findByCode(String code);
    List<TypeConge> findByReportableTrue();
    List<TypeConge> findByJoursAllouesGreaterThan(Integer jours);
}
