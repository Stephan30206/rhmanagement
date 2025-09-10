package com.rhmanagement.service;

import com.rhmanagement.entity.Absence;
import com.rhmanagement.entity.Employe;
import com.rhmanagement.entity.TypeAbsence;
import com.rhmanagement.repository.AbsenceRepository;
import com.rhmanagement.repository.EmployeRepository;
import com.rhmanagement.repository.TypeAbsenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AbsenceService {

    @Autowired
    private AbsenceRepository absenceRepository;

    @Autowired
    private EmployeRepository employeRepository;

    @Autowired
    private TypeAbsenceRepository typeAbsenceRepository;

    public List<Absence> getAllAbsences() {
        return absenceRepository.findAll();
    }

    public Optional<Absence> getAbsenceById(Long id) {
        return absenceRepository.findById(id);
    }

    @Transactional
    public Absence saveAbsence(Absence absence) {
        validateAbsence(absence);

        if (absence.getStatut() == null) {
            absence.setStatut(Absence.StatutAbsence.EN_ATTENTE);
        }

        if (absence.getAnnee() == null) {
            absence.setAnnee(LocalDate.now().getYear());
        }

        return absenceRepository.save(absence);
    }

    public void deleteAbsence(Long id) {
        absenceRepository.deleteById(id);
    }

    public List<Absence> getAbsencesByEmployeId(Long employeId) {
        return absenceRepository.findByEmployeId(employeId);
    }

    public List<Absence> getAbsencesByStatut(Absence.StatutAbsence statut) {
        return absenceRepository.findByStatut(statut);
    }

    public List<Absence> getAbsencesByPeriode(LocalDate startDate, LocalDate endDate) {
        return absenceRepository.findByPeriode(startDate, endDate);
    }

    public List<Absence> getAbsencesByEmployeAndPeriode(Long employeId, LocalDate startDate, LocalDate endDate) {
        return absenceRepository.findByEmployeAndPeriode(employeId, startDate, endDate);
    }

    @Transactional
    public Absence validerAbsence(Long absenceId, Long validateurId) {
        Absence absence = absenceRepository.findById(absenceId)
                .orElseThrow(() -> new RuntimeException("Absence non trouvée"));

        if (absence.getStatut() != Absence.StatutAbsence.EN_ATTENTE) {
            throw new RuntimeException("Cette absence a déjà été traitée");
        }

        absence.setStatut(Absence.StatutAbsence.VALIDE);
        return absenceRepository.save(absence);
    }

    @Transactional
    public Absence rejeterAbsence(Long absenceId, String motifRejet) {
        Absence absence = absenceRepository.findById(absenceId)
                .orElseThrow(() -> new RuntimeException("Absence non trouvée"));

        if (absence.getStatut() != Absence.StatutAbsence.EN_ATTENTE) {
            throw new RuntimeException("Cette absence a déjà été traitée");
        }

        absence.setStatut(Absence.StatutAbsence.REJETE);
        absence.setMotif(motifRejet);
        return absenceRepository.save(absence);
    }

    @Transactional
    public Absence annulerAbsence(Long absenceId) {
        Absence absence = absenceRepository.findById(absenceId)
                .orElseThrow(() -> new RuntimeException("Absence non trouvée"));

        if (absence.getDateAbsence().isBefore(LocalDate.now())) {
            throw new RuntimeException("Impossible d'annuler une absence déjà passée");
        }

        absence.setStatut(Absence.StatutAbsence.ANNULE);
        return absenceRepository.save(absence);
    }

    public boolean isEmployeAbsentALaDate(Long employeId, LocalDate date) {
        List<Absence> absences = absenceRepository.findByEmployeAndDate(employeId, date);
        return absences.stream()
                .anyMatch(a -> a.getStatut() == Absence.StatutAbsence.VALIDE);
    }

    public int getNombreAbsencesRestantes(Long employeId, Integer typeAbsenceId, Integer annee) {
        TypeAbsence typeAbsence = typeAbsenceRepository.findById(typeAbsenceId)
                .orElseThrow(() -> new RuntimeException("Type d'absence non trouvé"));

        if (typeAbsence.getPlafondAnnuel() == null) {
            return Integer.MAX_VALUE; // Pas de plafond
        }

        Integer absencesUtilisees = absenceRepository.countAbsencesByTypeAndYear(employeId, typeAbsenceId, annee);
        return typeAbsence.getPlafondAnnuel() - (absencesUtilisees != null ? absencesUtilisees : 0);
    }

    public Map<String, Long> getStatistiquesAbsencesParAnnee(Integer annee) {
        List<Object[]> statistiques = absenceRepository.countAbsencesByStatutAndAnnee(annee);

        Map<String, Long> result = new HashMap<>();
        result.put("EN_ATTENTE", 0L);
        result.put("VALIDE", 0L);
        result.put("REJETE", 0L);
        result.put("ANNULE", 0L);

        for (Object[] stat : statistiques) {
            Absence.StatutAbsence statut = (Absence.StatutAbsence) stat[0];
            Long count = (Long) stat[1];
            result.put(statut.name(), count);
        }

        return result;
    }

    public Map<String, Long> getStatistiquesAbsencesParType(Integer annee) {
        List<Object[]> statistiques = absenceRepository.countAbsencesByTypeAndAnnee(annee);

        Map<String, Long> result = new HashMap<>();
        for (Object[] stat : statistiques) {
            String typeAbsenceNom = (String) stat[0];
            Long count = (Long) stat[1];
            result.put(typeAbsenceNom, count);
        }

        return result;
    }

    private void validateAbsence(Absence absence) {
        // Vérifier que l'employé existe
        if (absence.getEmployeId() != null) {
            Employe employe = employeRepository.findById(absence.getEmployeId())
                    .orElseThrow(() -> new RuntimeException("Employé non trouvé avec l'ID: " + absence.getEmployeId()));
        }

        // Vérifier que le type d'absence existe
        if (absence.getTypeAbsenceId() != null) {
            TypeAbsence typeAbsence = typeAbsenceRepository.findById(absence.getTypeAbsenceId())
                    .orElseThrow(() -> new RuntimeException("Type d'absence non trouvé avec l'ID: " + absence.getTypeAbsenceId()));

            // Vérifier le plafond annuel si applicable
            if (typeAbsence.getPlafondAnnuel() != null) {
                int absencesRestantes = getNombreAbsencesRestantes(
                        absence.getEmployeId(),
                        absence.getTypeAbsenceId(),
                        absence.getAnnee() != null ? absence.getAnnee() : LocalDate.now().getYear()
                );

                if (absencesRestantes <= 0) {
                    throw new RuntimeException("Plafond annuel atteint pour ce type d'absence");
                }
            }
        }

        // Vérifier la date
        if (absence.getDateAbsence() != null) {
            if (absence.getDateAbsence().isBefore(LocalDate.now())) {
                throw new RuntimeException("La date d'absence ne peut pas être dans le passé");
            }
        }

        // Vérifier si l'employé n'est pas déjà absent à cette date
        if (absence.getEmployeId() != null && absence.getDateAbsence() != null) {
            List<Absence> absencesExistantes = absenceRepository.findByEmployeAndDate(
                    absence.getEmployeId(), absence.getDateAbsence());

            boolean hasValidAbsence = absencesExistantes.stream()
                    .anyMatch(a ->
                            !a.getId().equals(absence.getId()) && // Exclure l'absence actuelle en cas de modification
                                    a.getStatut() == Absence.StatutAbsence.VALIDE
                    );

            if (hasValidAbsence) {
                throw new RuntimeException("L'employé a déjà une absence validée à cette date");
            }
        }
    }

    public List<Map<String, Object>> getAllAbsencesWithDetails() {
        List<Absence> absences = absenceRepository.findAll();

        return absences.stream().map(absence -> {
            Map<String, Object> absenceWithDetails = new HashMap<>();

            // Copier les données de base
            absenceWithDetails.put("id", absence.getId());
            absenceWithDetails.put("employeId", absence.getEmployeId());
            absenceWithDetails.put("typeAbsenceId", absence.getTypeAbsenceId());
            absenceWithDetails.put("dateAbsence", absence.getDateAbsence());
            absenceWithDetails.put("duree", absence.getDuree());
            absenceWithDetails.put("motif", absence.getMotif());
            absenceWithDetails.put("statut", absence.getStatut());
            absenceWithDetails.put("justificatif", absence.getJustificatif());
            absenceWithDetails.put("dateCreation", absence.getDateCreation());
            absenceWithDetails.put("dateModification", absence.getDateModification());

            // Récupérer et ajouter les détails de l'employé
            if (absence.getEmployeId() != null) {
                Optional<Employe> employe = employeRepository.findById(absence.getEmployeId());
                if (employe.isPresent()) {
                    Map<String, Object> employeMap = new HashMap<>();
                    employeMap.put("id", employe.get().getId());
                    employeMap.put("nom", employe.get().getNom());
                    employeMap.put("prenom", employe.get().getPrenom());
                    employeMap.put("matricule", employe.get().getMatricule());
                    employeMap.put("photoProfil", employe.get().getPhotoProfil());
                    absenceWithDetails.put("employe", employeMap);
                }
            }

            // Récupérer et ajouter les détails du type d'absence
            if (absence.getTypeAbsenceId() != null) {
                Optional<TypeAbsence> typeAbsence = typeAbsenceRepository.findById(absence.getTypeAbsenceId());
                if (typeAbsence.isPresent()) {
                    Map<String, Object> typeAbsenceMap = new HashMap<>();
                    typeAbsenceMap.put("id", typeAbsence.get().getId());
                    typeAbsenceMap.put("nom", typeAbsence.get().getNom());
                    typeAbsenceMap.put("code", typeAbsence.get().getCode());
                    typeAbsenceMap.put("estPaye", typeAbsence.get().getEstPaye());
                    typeAbsenceMap.put("necessiteJustificatif", typeAbsence.get().getNecessiteJustificatif());
                    typeAbsenceMap.put("plafondAnnuel", typeAbsence.get().getPlafondAnnuel());
                    typeAbsenceMap.put("couleur", typeAbsence.get().getCouleur());
                    absenceWithDetails.put("typeAbsence", typeAbsenceMap);
                }
            }

            return absenceWithDetails;
        }).collect(Collectors.toList());
    }
}