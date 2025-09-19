package com.rhmanagement.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "demandesconge")
public class DemandeConge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employe_id", nullable = false)
    private Long employeId;

    @Column(name = "type_conge", nullable = false, length = 100)
    private String typeConge;

    @Column(name = "date_debut", nullable = false)
    private LocalDate dateDebut;

    @Column(name = "date_fin", nullable = false)
    private LocalDate dateFin;

    @Column(name = "motif", columnDefinition = "TEXT")
    private String motif;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    private StatutDemande statut;

    @Column(name = "approuve_par")
    private Long approuvePar;

    @Column(name = "date_traitement")
    private LocalDateTime dateTraitement;

    @Column(name = "motif_rejet", columnDefinition = "TEXT")
    private String motifRejet;

    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    @Column(name = "annee", nullable = false)
    private Integer annee;

    @Column(name = "jours_demandes", insertable = false, updatable = false)
    private Integer joursDemandes;

    // Enum pour le statut
    public enum StatutDemande {
        EN_ATTENTE, APPROUVE, REJETE, ANNULE
    }

    // Initialisation automatique AVANT INSERTION
    @PrePersist
    protected void onCreate() {
        this.dateCreation = LocalDateTime.now();
        if (this.statut == null) {
            this.statut = StatutDemande.EN_ATTENTE;
        }
        if (this.annee == null) {
            this.annee = LocalDate.now().getYear();
        }
    }

    // Méthode utilitaire pour calculer le nombre de jours
    public long getNombreJours() {
        if (dateDebut != null && dateFin != null) {
            return ChronoUnit.DAYS.between(dateDebut, dateFin) + 1;
        }
        return 0;
    }
}