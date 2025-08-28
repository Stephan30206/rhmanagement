package com.rhmanagement.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String nom;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_document", nullable = false, length = 50)
    private TypeDocument typeDocument;

    @Column(name = "chemin_fichier", nullable = false, length = 500)
    private String cheminFichier;

    @Column(columnDefinition = "TEXT")
    private String description; // Peut être null

    @Column(name = "date_upload")
    private LocalDate dateUpload = LocalDate.now();

    // Correction du mapping ManyToOne
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employe_id", nullable = false) // Ceci crée la colonne employe_id
    @JsonIgnore
    private Employe employe;

    public enum TypeDocument {
        CV, DIPLOME, CERTIFICAT, CONTRAT, PHOTO, LETTRE_CREANCE,
        ORDINATION, ATTESTATION_TRAVAIL, BULLETIN_PAIE, CIN,
        CNAPS, OSTIE, AUTRE
    }

    @PrePersist
    protected void onCreate() {
        this.dateUpload = LocalDate.now();
    }
}