package com.rhmanagement.entity;

import com.rhmanagement.entity.Employe;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    // correspond à `nom_utilisateur`
    @Column(name = "nom_utilisateur", nullable = false, unique = true, length = 50)
    private String nomUtilisateur;

    // correspond à `mot_de_passe`
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

    // correspond à `photo_profil`
    @Column(name = "photo_profil", length = 255)
    private String photoProfil;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // correspond à `employe_id`
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employe_id")
    private Employe employe;

    @Column(nullable = false)
    private Boolean actif = true;

    // correspond à `date_creation`
    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();

    public enum Role {
        ADMIN, SECRETAIRE_FEDERAL, RESPONSABLE_DISTRICT, PASTEUR, ASSISTANT_RH
    }
}