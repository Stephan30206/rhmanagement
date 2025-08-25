package com.rhmanagement.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "formations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Formation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String intitule;

    @Column(length = 255)
    private String organisme;

    @Column(name = "date_debut", nullable = false)
    private LocalDate dateDebut;

    @Column(name = "date_fin")
    private LocalDate dateFin;

    @Column(name = "duree_heures")
    private Integer dureeHeures;

    @Column(length = 255)
    private String certificat;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employe_id", nullable = false)
    private Employe employe;
}