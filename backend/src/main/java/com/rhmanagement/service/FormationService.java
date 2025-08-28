package com.rhmanagement.service;

import com.rhmanagement.entity.Formation;
import com.rhmanagement.repository.FormationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FormationService {

    @Autowired
    private FormationRepository formationRepository;

    /**
     * Récupère toutes les formations d'un employé triées par date de début décroissante
     */
    public List<Formation> getFormationsByEmployeId(Long employeId) {
        return formationRepository.findByEmployeIdOrderByDateDebutDesc(employeId);
    }

    /**
     * Récupère une formation par son ID
     */
    public Optional<Formation> getFormationById(Long id) {
        return formationRepository.findById(id);
    }

    /**
     * Sauvegarde une formation (création ou mise à jour)
     */
    public Formation saveFormation(Formation formation) {
        return formationRepository.save(formation);
    }

    /**
     * Supprime une formation par son ID
     */
    public void deleteFormation(Long id) {
        formationRepository.deleteById(id);
    }
}