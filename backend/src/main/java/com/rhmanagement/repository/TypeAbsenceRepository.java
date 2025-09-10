package com.rhmanagement.repository;

import com.rhmanagement.entity.TypeAbsence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TypeAbsenceRepository extends JpaRepository<TypeAbsence, Integer> {

    Optional<TypeAbsence> findByCode(String code);

}
