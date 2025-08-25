package com.rhmanagement.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "diplomes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Diplome {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_diplome", nullable = false, length = 50)
    private TypeDiplome typeDiplome;

    @Column(nullable = false, length = 255)
    private String intitule;

    @Column(length = 255)
    private String ecole;

    @Column(name = "annee_obtention")
    private Integer anneeObtention;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employe_id", nullable = false)
    private Employe employe;

    public enum TypeDiplome {
        CEPE, BEPC, BACC, LICENCE, MASTER, DOCTORAT, AUTRE
    }
}