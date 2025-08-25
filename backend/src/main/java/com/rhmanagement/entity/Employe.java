package com.rhmanagement.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "employes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Employe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String matricule;

    @Column(nullable = false, length = 50)
    private String nom;

    @Column(nullable = false, length = 50)
    private String prenom;

    @Column(nullable = false)
    private LocalDate dateNaissance;

    @Column(length = 100)
    private String lieuNaissance;

    @Column(length = 50)
    private String nationalite = "Malgache";

    @Column(length = 20)
    private String cin;

    @Column(columnDefinition = "TEXT")
    private String adresse;

    @Column(length = 20)
    private String telephone;

    @Column(length = 100)
    private String email;

    @Column(length = 255)
    private String photoProfil;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private StatutMatrimonial statutMatrimonial = StatutMatrimonial.CELIBATAIRE;

    @Column
    private LocalDate dateMariage;

    @Column(length = 100)
    private String nomConjoint;

    @Column
    private LocalDate dateNaissanceConjoint;

    @Column
    private Integer nombreEnfants = 0;

    @Column(length = 50)
    private String numeroCNAPS;

    @Column(length = 100)
    private String contactUrgenceNom;

    @Column(length = 50)
    private String contactUrgenceLien;

    @Column(length = 20)
    private String contactUrgenceTelephone;

    @Column(length = 100)
    private String nomPere;

    @Column(length = 100)
    private String nomMere;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Poste poste;

    @Column(length = 100)
    private String organisationEmployeur;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private TypeContrat typeContrat = TypeContrat.CDD;

    @Column
    private LocalDate dateDebut;

    @Column
    private LocalDate dateFin;

    @Column(columnDefinition = "DECIMAL(12,2)")
    private BigDecimal salaireBase = BigDecimal.ZERO;

    @Column(columnDefinition = "DECIMAL(5,2)")
    private BigDecimal pourcentageSalaire = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatutEmploye statut = StatutEmploye.ACTIF;

    @Column
    private LocalDate dateAccreditation;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private NiveauAccreditation niveauAccreditation = NiveauAccreditation.LOCAL;

    @Column(length = 100)
    private String groupeAccreditation;

    @Column(length = 100)
    private String superviseurHierarchique;

    @Column(length = 100)
    private String affectationActuelle;

    @OneToMany(mappedBy = "employe", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Enfant> enfants = new ArrayList<>();

    @OneToMany(mappedBy = "employe", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Diplome> diplomes = new ArrayList<>();

    @OneToMany(mappedBy = "employe", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<HistoriquePoste> historiquePostes = new ArrayList<>();

    @OneToMany(mappedBy = "employe", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Competence> competences = new ArrayList<>();

    @OneToMany(mappedBy = "employe", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Formation> formations = new ArrayList<>();

    @OneToMany(mappedBy = "employe", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Document> documents = new ArrayList<>();

    @Column(name = "date_creation", updatable = false)
    private LocalDate dateCreation = LocalDate.now();

    @Column(name = "date_mise_a_jour")
    private LocalDate dateMiseAJour = LocalDate.now();

    // Enums
    public enum StatutMatrimonial {
        CELIBATAIRE, MARIE, DIVORCE, VEUF
    }

    public enum Poste {
        PASTEUR_TITULAIRE, PASTEUR_ASSOCIE, EVANGELISTE, ANCIEN, MISSIONNAIRE,
        ENSEIGNANT, SECRETAIRE_EXECUTIF, TRESORIER, ASSISTANT_RH, AUTRE
    }

    public enum TypeContrat {
        CDI, CDD, STAGE, BENEVOLAT
    }

    public enum StatutEmploye {
        ACTIF, INACTIF, EN_CONGE
    }

    public enum NiveauAccreditation {
        LOCAL, DISTRICT, FEDERATION, UNION, DIVISION, CONFERENCE_GENERALE
    }

    @PreUpdate
    public void preUpdate() {
        this.dateMiseAJour = LocalDate.now();
    }
}