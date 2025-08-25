package com.rhmanagement.repository;

import com.rhmanagement.entity.TypeConge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TypeCongeRepository extends JpaRepository<TypeConge, Integer> {
}