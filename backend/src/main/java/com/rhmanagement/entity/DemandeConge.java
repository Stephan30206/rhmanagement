package com.rhmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "demandesconge")
public class DemandeConge {

    private final LocalDateTime dateCreation;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employeId", nullable = false)
    private Long employeId;

    // getters et setters
    @Column(name = "annee")
    private int annee;

    @Column(name = "typeCongeId", nullable = false)
    private Integer typeCongeId;

    @Column(name = "date_debut", nullable = false)
    private LocalDate dateDebut;

    @Column(name = "date_fin", nullable = false)
    private LocalDate dateFin;

    @Column(name = "motif", columnDefinition = "TEXT")
    private String motif;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    private StatutDemande statut;

    @Column(name = "approuvePar")
    private Long approuvePar;

    @Column(name = "dateTraitement")
    private LocalDateTime dateTraitement;

    @Column(name = "motifRejet", columnDefinition = "TEXT")
    private String motifRejet;

    public int getJoursDemandes() {
        return 0;
    }


    // Relations JPA optionnelles (commentées pour éviter les erreurs)
    /*
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employeId", insertable = false, updatable = false)
    private Employe employe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "typeCongeId", insertable = false, updatable = false)
    private TypeConge typeConge;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approuvePar", insertable = false, updatable = false)
    private Employe approbateur;
    */

    // Enum pour le statut
    public enum StatutDemande {
        EN_ATTENTE, APPROUVE, REJETE, ANNULE
    }

    // Constructeurs
    public DemandeConge() {
        this.dateCreation = LocalDateTime.now();
        this.statut = StatutDemande.EN_ATTENTE;
    }

    // Méthode utilitaire pour calculer le nombre de jours
    public long getNombreJours() {
        if (dateDebut != null && dateFin != null) {
            return java.time.temporal.ChronoUnit.DAYS.between(dateDebut, dateFin) + 1;
        }
        return 0;
    }
}