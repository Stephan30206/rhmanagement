package com.rhmanagement.service;

import com.rhmanagement.entity.TypeConge;
import com.rhmanagement.repository.TypeCongeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TypeCongeService {

    @Autowired
    private TypeCongeRepository typeCongeRepository;

    public List<TypeConge> getAllTypesConge() {
        return typeCongeRepository.findAll();
    }

    public Optional<TypeConge> getTypeCongeById(Integer id) {
        return typeCongeRepository.findById(id);
    }

    public TypeConge saveTypeConge(TypeConge typeConge) {
        return typeCongeRepository.save(typeConge);
    }

    public void deleteTypeConge(Integer id) {
        typeCongeRepository.deleteById(id);
    }
}