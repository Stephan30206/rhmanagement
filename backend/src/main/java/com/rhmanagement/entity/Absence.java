package com.rhmanagement.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "absences")
public class Absence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employe_id", nullable = false)
    private Long employeId;

    @Column(name = "type_absence_id", nullable = false)
    private Integer typeAbsenceId;

    @Column(name = "date_absence", nullable = false)
    private LocalDate dateAbsence;

    @Column(name = "duree")
    private String duree; // "JOURNEE", "MATIN", "APRES_MIDI"

    @Column(name = "motif", columnDefinition = "TEXT")
    private String motif;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    private StatutAbsence statut;

    @Column(name = "justificatif")
    private String justificatif;

    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    @Column(name = "date_modification")
    private LocalDateTime dateModification;

    @Column(name = "annee", nullable = false)
    private Integer annee;

    // Enum pour le statut
    public enum StatutAbsence {
        EN_ATTENTE, VALIDE, REJETE, ANNULE
    }

    // Initialisation automatique AVANT INSERTION
    @PrePersist
    protected void onCreate() {
        this.dateCreation = LocalDateTime.now();
        if (this.statut == null) {
            this.statut = StatutAbsence.EN_ATTENTE;
        }
        if (this.annee == null) {
            this.annee = LocalDate.now().getYear();
        }
        if (this.duree == null) {
            this.duree = "JOURNEE";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.dateModification = LocalDateTime.now();
    }
}