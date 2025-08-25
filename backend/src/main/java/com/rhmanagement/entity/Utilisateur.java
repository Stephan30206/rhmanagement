package com.rhmanagement.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

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

    @Column(nullable = false, unique = true, length = 50)
    private String nomUtilisateur;

    @Column(nullable = false, length = 255)
    private String motDePasse;

    @Column(unique = true, length = 100)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employeId")
    private Employe employe;

    @Column(nullable = false)
    private Boolean actif = true;

    @Column(updatable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();

    public enum Role {
        ADMIN, SECRETAIRE_FEDERAL, RESPONSABLE_DISTRICT, PASTEUR, ASSISTANT_RH
    }
}