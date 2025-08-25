// CompetenceService.java
package com.rhmanagement.service;

import com.rhmanagement.entity.Competence;
import com.rhmanagement.repository.CompetenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CompetenceService {

    @Autowired
    private CompetenceRepository competenceRepository;

    public List<Competence> getCompetencesByEmployeId(Long employeId) {
        return competenceRepository.findByEmployeId(employeId);
    }

    public Optional<Competence> getCompetenceById(Long id) {
        return competenceRepository.findById(id);
    }

    public Competence saveCompetence(Competence competence) {
        return competenceRepository.save(competence);
    }

    public void deleteCompetence(Long id) {
        competenceRepository.deleteById(id);
    }
}