package com.rhmanagement.entity;

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
    private String description;

    @Column(name = "date_upload")
    private LocalDate dateUpload = LocalDate.now();

    @Column(name = "uploaded_by", length = 100)
    private String uploadedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employe_id", nullable = false)
    private Employe employe;

    public enum TypeDocument {
        CV, DIPLOME, CERTIFICAT, CONTRAT, PHOTO, LETTRE_CREANCE,
        ORDINATION, ATTESTATION_TRAVAIL, BULLETIN_PAIE, CNI,
        CNPS, OSTIE, AUTRE
    }
}