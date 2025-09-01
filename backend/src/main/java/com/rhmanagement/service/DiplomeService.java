package com.rhmanagement.service;

import com.rhmanagement.entity.Diplome;
import com.rhmanagement.entity.Employe;
import com.rhmanagement.repository.DiplomeRepository;
import com.rhmanagement.repository.EmployeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DiplomeService {

    @Autowired
    private DiplomeRepository diplomeRepository;

    @Autowired
    private EmployeRepository employeRepository;

    public List<Diplome> getDiplomesByEmployeId(Long employeId) {
        return diplomeRepository.findByEmployeId(employeId);
    }

    public Diplome saveDiplome(Long employeId, Diplome diplome) {
        Optional<Employe> employe = employeRepository.findById(employeId);
        if (employe.isPresent()) {
            diplome.setEmploye(employe.get());
            return diplomeRepository.save(diplome);
        }
        throw new RuntimeException("Employé non trouvé avec l'ID: " + employeId);
    }

    public void deleteDiplome(Long employeId, Long diplomeId) {
        Optional<Diplome> diplome = diplomeRepository.findById(diplomeId);
        if (diplome.isPresent() && diplome.get().getEmploye().getId().equals(employeId)) {
            diplomeRepository.deleteById(diplomeId);
        } else {
            throw new RuntimeException("Diplôme non trouvé ou n'appartient pas à l'employé");
        }
    }
}
