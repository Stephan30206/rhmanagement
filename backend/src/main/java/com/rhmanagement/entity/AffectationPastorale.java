package com.rhmanagement.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "affectationspastorales")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AffectationPastorale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pasteur_id", nullable = false)
    @JsonBackReference
    private Employe pasteur;

    @Column(name = "eglise_locale", nullable = false, length = 100)
    private String egliseLocale;

    @Column(name = "district", nullable = false, length = 100)
    private String district;

    @Column(name = "date_debut", nullable = false)
    private LocalDate dateDebut;

    @Column(name = "date_fin")
    private LocalDate dateFin;

    @Enumerated(EnumType.STRING)
    @Column(name = "fonction", nullable = false, length = 50)
    private Fonction fonction;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", length = 20)
    private StatutAffectation statut = StatutAffectation.ACTIVE;

    @Column(name = "lettre_affectation", length = 255)
    private String lettreAffectation;

    @Column(name = "observations", columnDefinition = "TEXT")
    private String observations;

    @Column(name = "date_creation")
    private LocalDate dateCreation = LocalDate.now();

    @Column(name = "date_mise_a_jour")
    private LocalDate dateMiseAJour = LocalDate.now();

    public enum Fonction {
        PASTEUR_TITULAIRE,
        PASTEUR_ASSOCIE,
        PASTEUR_STAGIAIRE,
        PIONNIER,
        EVANGELISTE,
        ANCIEN,
        RESPONSABLE_DISTRICT,
        SECRETAIRE_DISTRICT,
        TRESORIER_DISTRICT
    }

    public enum StatutAffectation {
        ACTIVE,
        TERMINEE,
        PROVISOIRE
    }

    @PreUpdate
    public void preUpdate() {
        this.dateMiseAJour = LocalDate.now();
    }
}