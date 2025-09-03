// Utilisateur.java
package com.rhmanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "utilisateurs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nom_utilisateur", nullable = false, unique = true, length = 50)
    private String nomUtilisateur;

    @Column(name = "mot_de_passe", nullable = false, length = 255)
    private String motDePasse;

    @Column(unique = true, length = 100)
    private String email;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(nullable = false, length = 100)
    private String prenom;

    @Column(length = 20)
    private String telephone;

    @Column(length = 100)
    private String poste;

    @Column(name = "photo_profil", length = 255)
    private String photoProfil;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.ADMIN; // Valeur par défaut

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employe_id")
    private Employe employe;

    @Column(nullable = false)
    private Boolean actif = true;

    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();

    @Column(name = "date_naissance")
    private LocalDate dateNaissance;

    @Column(length = 500)
    private String adresse;

    @Column(length = 1)
    private String genre; // M ou F

    // Getters pour les nouveaux champs
    // Méthodes complétées
    // AJOUTEZ CES CHAMPS POUR L'INSCRIPTION
    @Column(name = "date_inscription")
    private LocalDateTime dateInscription;

    @Column(name = "statut", length = 20)
    private String statut;

    public enum Role {
        ADMIN, SECRETAIRE_FEDERAL, RESPONSABLE_DISTRICT, PASTEUR, ASSISTANT_RH
    }
}