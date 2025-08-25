package com.rhmanagement.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "typesconge")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TypeConge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 20)
    private String code;

    @Column(nullable = false, length = 50)
    private String nom;

    @Column(nullable = false)
    private Integer joursAlloues;

    @Column(nullable = false)
    private Boolean reportable = false;

    @Column(columnDefinition = "TEXT")
    private String exigences;

    // Relations commentées pour éviter les erreurs de mapping
    /*
    @OneToMany(mappedBy = "typeConge", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DemandeConge> demandes = new ArrayList<>();
    */
}