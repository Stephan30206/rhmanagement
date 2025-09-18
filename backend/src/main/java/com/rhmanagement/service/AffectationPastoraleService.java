package com.rhmanagement.service;

import com.rhmanagement.entity.AffectationPastorale;
import com.rhmanagement.entity.Employe;
import com.rhmanagement.repository.AffectationPastoraleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AffectationPastoraleService {

    @Autowired
    private AffectationPastoraleRepository affectationPastoraleRepository;

    public List<AffectationPastorale> getAffectationsByPasteur(Long pasteurId) {
        return affectationPastoraleRepository.findByPasteurIdOrderByDateDebutDesc(pasteurId);
    }

    public AffectationPastorale createAffectation(AffectationPastorale affectation) {
        return affectationPastoraleRepository.save(affectation);
    }

    public AffectationPastorale updateAffectation(Long id, AffectationPastorale affectationDetails) {
        Optional<AffectationPastorale> optionalAffectation = affectationPastoraleRepository.findById(id);
        if (optionalAffectation.isPresent()) {
            AffectationPastorale affectation = optionalAffectation.get();
//            affectation.setEgliseLocale(affectationDetails.getEgliseLocale());
            affectation.setDistrict(affectationDetails.getDistrict());
            affectation.setDateDebut(affectationDetails.getDateDebut());
            affectation.setDateFin(affectationDetails.getDateFin());
            affectation.setFonction(affectationDetails.getFonction());
            affectation.setStatut(affectationDetails.getStatut());
            affectation.setLettreAffectation(affectationDetails.getLettreAffectation());
            affectation.setObservations(affectationDetails.getObservations());
            return affectationPastoraleRepository.save(affectation);
        }
        return null;
    }

    public void deleteAffectation(Long id) {
        affectationPastoraleRepository.deleteById(id);
    }

    public boolean isPasteur(Optional<Employe> employe) {
        if (employe.isPresent()) {
            Employe.Poste poste = employe.get().getPoste();
            return poste == Employe.Poste.EVANGELISTE ||
                    poste == Employe.Poste.PASTEUR_STAGIAIRE ||
                    poste == Employe.Poste.PASTEUR_AUTORISE||
                    poste == Employe.Poste.PASTEUR_CONSACRE;
        }
        return false;
    }
}