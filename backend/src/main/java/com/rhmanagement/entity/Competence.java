package com.rhmanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

@Entity
@Table(name = "competences")
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Competence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String nom;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Niveau niveau;

    @Column(length = 100)
    private String categorie;

    @Column(name = "date_acquisition")
    private LocalDate dateAcquisition;

    // CORRECTION : Supprimer employeId et utiliser seulement la relation
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employe_id", nullable = false)
    @JsonIgnore // Éviter la récursion infinie dans la sérialisation JSON
    private Employe employe;

    public enum Niveau {
        DEBUTANT, INTERMEDIAIRE, AVANCE, EXPERT
    }

    // Méthode de commodité pour obtenir l'ID de l'employé via la relation
    public Long getEmployeId() {
        return employe != null ? employe.getId() : null;
    }

    /**
     * Méthode pour définir la date d'acquisition avec gestion de différents types d'entrée
     * @param dateAcquisition Peut être LocalDate, String (format ISO), ou null
     */
    public void setDateAcquisition(Object dateAcquisition) {
        if (dateAcquisition == null) {
            this.dateAcquisition = null;
            return;
        }

        if (dateAcquisition instanceof LocalDate) {
            this.dateAcquisition = (LocalDate) dateAcquisition;
            return;
        }

        if (dateAcquisition instanceof String) {
            String dateString = (String) dateAcquisition;
            if (dateString.isEmpty()) {
                this.dateAcquisition = null;
                return;
            }

            try {
                // Tentative de parsing en format ISO (YYYY-MM-DD)
                this.dateAcquisition = LocalDate.parse(dateString);
            } catch (DateTimeParseException e1) {
                try {
                    // Tentative avec d'autres formats courants
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
                    this.dateAcquisition = LocalDate.parse(dateString, formatter);
                } catch (DateTimeParseException e2) {
                    try {
                        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM/dd/yyyy");
                        this.dateAcquisition = LocalDate.parse(dateString, formatter);
                    } catch (DateTimeParseException e3) {
                        throw new IllegalArgumentException("Format de date non supporté : " + dateString +
                                ". Utilisez le format YYYY-MM-DD, dd/MM/yyyy ou MM/dd/yyyy");
                    }
                }
            }
            return;
        }

        throw new IllegalArgumentException("Type non supporté pour dateAcquisition : " +
                dateAcquisition.getClass().getName());
    }

    /**
     * Méthode utilitaire pour obtenir la date formatée
     * @return Date formatée en chaîne de caractères ou null si non définie
     */
    public String getDateAcquisitionFormatted() {
        if (dateAcquisition == null) {
            return null;
        }
        return dateAcquisition.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
    }

    /**
     * Méthode utilitaire pour vérifier si la compétence est récente (moins d'un an)
     * @return true si la compétence a été acquise il y a moins d'un an
     */
    public boolean isRecent() {
        if (dateAcquisition == null) {
            return false;
        }
        return dateAcquisition.isAfter(LocalDate.now().minusYears(1));
    }
}