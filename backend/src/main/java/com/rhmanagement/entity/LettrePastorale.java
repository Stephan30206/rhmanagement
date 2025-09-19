package com.rhmanagement.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "lettrespastorales")
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LettrePastorale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employeId", nullable = false)
    private Employe employe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "typeLettreId", nullable = false)
    private TypeLettrePastorale typeLettre;

    @Column(nullable = false, unique = true, length = 50)
    private String numeroLettre;

    @Column(nullable = false)
    private LocalDate dateEmission;

    private LocalDate dateExpiration;

    @Column(nullable = false, length = 100)
    private String emetteur;

    @Column(length = 100)
    private String reference;

    @Column(length = 255)
    private String documentPath;

    @Column(columnDefinition = "TEXT")
    private String observations;
}