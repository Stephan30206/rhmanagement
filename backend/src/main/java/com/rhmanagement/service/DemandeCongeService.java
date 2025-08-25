package com.rhmanagement.service;

import com.rhmanagement.entity.DemandeConge;
import com.rhmanagement.entity.TypeConge;
import com.rhmanagement.repository.DemandeCongeRepository;
import com.rhmanagement.repository.TypeCongeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DemandeCongeService {

    @Autowired
    private DemandeCongeRepository demandeCongeRepository;

    @Autowired
    private TypeCongeRepository typeCongeRepository;

    public List<DemandeConge> getAllDemandes() {
        return demandeCongeRepository.findAll();
    }

    public Optional<DemandeConge> getDemandeById(Long id) {
        return demandeCongeRepository.findById(id);
    }

    public DemandeConge saveDemande(DemandeConge demande) {
        // Définir le statut par défaut si non défini
        if (demande.getStatut() == null) {
            demande.setStatut(DemandeConge.StatutDemande.EN_ATTENTE);
        }
        return demandeCongeRepository.save(demande);
    }

    public void deleteDemande(Long id) {
        demandeCongeRepository.deleteById(id);
    }

    public List<DemandeConge> getDemandesByEmployeId(Long employeId) {
        return demandeCongeRepository.findByEmployeId(employeId);
    }

    // Méthode pour récupérer les types de congé
    public List<TypeConge> getTypesConge() {
        return typeCongeRepository.findAll();
    }

    // Nouvelle méthode pour calculer le solde de congés
    public int getSoldeConges(Long employeId, int annee) {
        List<DemandeConge> conges = demandeCongeRepository.findByEmployeIdAndAnnee(employeId, annee);
        int congesPris = conges.stream()
                .filter(d -> d.getStatut() == DemandeConge.StatutDemande.APPROUVE)
                .mapToInt(DemandeConge::getJoursDemandes)
                .sum();

        // 25 jours de congés annuels alloués
        return 25 - congesPris;
    }
}