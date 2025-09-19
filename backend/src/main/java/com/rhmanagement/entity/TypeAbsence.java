package com.rhmanagement.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "types_absence")
public class TypeAbsence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "code", nullable = false, unique = true)
    private String code;

    @Column(name = "nom", nullable = false)
    private String nom;

    @Column(name = "est_paye")
    private Boolean estPaye = true;

    @Column(name = "necessite_justificatif")
    private Boolean necessiteJustificatif = false;

    @Column(name = "plafond_annuel")
    private Integer plafondAnnuel;

    @Column(name = "couleur")
    private String couleur = "#6B7280";

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}