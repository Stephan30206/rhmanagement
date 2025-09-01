package com.rhmanagement.service;

import com.rhmanagement.entity.Enfant;
import com.rhmanagement.entity.Employe;
import com.rhmanagement.repository.EnfantRepository;
import com.rhmanagement.repository.EmployeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class EnfantService {

    @Autowired
    private EnfantRepository enfantRepository;

    @Autowired
    private EmployeRepository employeRepository;

    /**
     * Récupère tous les enfants d'un employé spécifique
     * @param employeId L'ID de l'employé
     * @return Liste des enfants de l'employé
     */
    public List<Enfant> getEnfantsByEmployeId(Long employeId) {
        // Vérifier que l'employé existe
        if (!employeRepository.existsById(employeId)) {
            throw new RuntimeException("Employé non trouvé avec l'ID: " + employeId);
        }
        return enfantRepository.findByEmployeId(employeId);
    }

    /**
     * Ajoute un enfant à un employé
     * @param employeId L'ID de l'employé parent
     * @param enfant L'enfant à ajouter
     * @return L'enfant sauvegardé
     */
    public Enfant saveEnfant(Long employeId, Enfant enfant) {
        // Récupérer l'employé
        Optional<Employe> employeOpt = employeRepository.findById(employeId);
        if (employeOpt.isEmpty()) {
            throw new RuntimeException("Employé non trouvé avec l'ID: " + employeId);
        }

        Employe employe = employeOpt.get();

        // Associer l'enfant à l'employé
        enfant.setEmploye(employe);

        // Sauvegarder l'enfant
        return enfantRepository.save(enfant);
    }

    /**
     * Supprime un enfant spécifique d'un employé
     * @param employeId L'ID de l'employé
     * @param enfantId L'ID de l'enfant à supprimer
     */
    public void deleteEnfant(Long employeId, Long enfantId) {
        // Vérifier que l'employé existe
        if (!employeRepository.existsById(employeId)) {
            throw new RuntimeException("Employé non trouvé avec l'ID: " + employeId);
        }

        // Récupérer l'enfant
        Optional<Enfant> enfantOpt = enfantRepository.findById(enfantId);
        if (!enfantOpt.isPresent()) {
            throw new RuntimeException("Enfant non trouvé avec l'ID: " + enfantId);
        }

        Enfant enfant = enfantOpt.get();

        // Vérifier que l'enfant appartient bien à cet employé
        if (!enfant.getEmploye().getId().equals(employeId)) {
            throw new RuntimeException("L'enfant avec l'ID " + enfantId +
                    " n'appartient pas à l'employé avec l'ID " + employeId);
        }

        // Supprimer l'enfant
        enfantRepository.deleteById(enfantId);
    }

    /**
     * Récupère un enfant par son ID
     * @param enfantId L'ID de l'enfant
     * @return L'enfant trouvé
     */
    public Optional<Enfant> getEnfantById(Long enfantId) {
        return enfantRepository.findById(enfantId);
    }

    /**
     * Met à jour les informations d'un enfant
     * @param employeId L'ID de l'employé
     * @param enfantId L'ID de l'enfant à mettre à jour
     * @param enfantDetails Les nouvelles informations de l'enfant
     * @return L'enfant mis à jour
     */
    public Enfant updateEnfant(Long employeId, Long enfantId, Enfant enfantDetails) {
        // Vérifier que l'employé existe
        if (!employeRepository.existsById(employeId)) {
            throw new RuntimeException("Employé non trouvé avec l'ID: " + employeId);
        }

        // Récupérer l'enfant existant
        Optional<Enfant> enfantOpt = enfantRepository.findById(enfantId);
        if (!enfantOpt.isPresent()) {
            throw new RuntimeException("Enfant non trouvé avec l'ID: " + enfantId);
        }

        Enfant enfant = enfantOpt.get();

        // Vérifier que l'enfant appartient bien à cet employé
        if (!enfant.getEmploye().getId().equals(employeId)) {
            throw new RuntimeException("L'enfant avec l'ID " + enfantId +
                    " n'appartient pas à l'employé avec l'ID " + employeId);
        }

        // Mettre à jour les champs (ajustez selon vos attributs d'Enfant)
        enfant.setNom(enfantDetails.getNom());
        enfant.setDateNaissance(enfantDetails.getDateNaissance());
        // Ajoutez d'autres champs selon votre entité Enfant

        return enfantRepository.save(enfant);
    }
}