package com.rhmanagement.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "postes")
public class Poste {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String nom;

    @Column
    private boolean actif = true;

    // constructeurs, getters, setters
}