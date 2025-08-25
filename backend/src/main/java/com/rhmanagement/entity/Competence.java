package com.rhmanagement.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

@Entity
@Table(name = "competences")
@Data
@NoArgsConstructor
@AllArgsConstructor
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

    @Column(name = "employe_id", nullable = false)
    private Long employeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employe_id", insertable = false, updatable = false)
    private Employe employe;

    public enum Niveau {
        DEBUTANT, INTERMEDIAIRE, AVANCE, EXPERT
    }

    /**
     * Méthode pour définir la date d'acquisition avec gestion des différents types d'entrée
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
                    // Tentative avec d'autres formats communs
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
                    this.dateAcquisition = LocalDate.parse(dateString, formatter);
                } catch (DateTimeParseException e2) {
                    try {
                        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM/dd/yyyy");
                        this.dateAcquisition = LocalDate.parse(dateString, formatter);
                    } catch (DateTimeParseException e3) {
                        throw new IllegalArgumentException("Format de date non supporté: " + dateString +
                                ". Utilisez le format YYYY-MM-DD, dd/MM/yyyy ou MM/dd/yyyy");
                    }
                }
            }
            return;
        }

        throw new IllegalArgumentException("Type non supporté pour dateAcquisition: " +
                dateAcquisition.getClass().getName());
    }

    /*
     Méthode pour définir l'ID de l'employé avec validation
     @param employeId ID de l'employé (doit être non null et positif)
     */
    public void setEmployeId(Long employeId) {
        if (employeId == null) {
            throw new IllegalArgumentException("L'ID de l'employé ne peut pas être null");
        }

        if (employeId <= 0) {
            throw new IllegalArgumentException("L'ID de l'employé doit être un nombre positif");
        }

        this.employeId = employeId;
    }

    /**
     * Surcharge de setEmployeId pour accepter aussi les Integer et String
     * @param employeId ID de l'employé sous différentes formes
     */
    public void setEmployeId(Object employeId) {
        if (employeId == null) {
            throw new IllegalArgumentException("L'ID de l'employé ne peut pas être null");
        }

        if (employeId instanceof Long) {
            setEmployeId((Long) employeId);
            return;
        }

        if (employeId instanceof Integer) {
            setEmployeId(((Integer) employeId).longValue());
            return;
        }

        if (employeId instanceof String) {
            try {
                setEmployeId(Long.parseLong((String) employeId));
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("L'ID de l'employé doit être un nombre valide: " + employeId);
            }
            return;
        }

        throw new IllegalArgumentException("Type non supporté pour employeId: " +
                employeId.getClass().getName());
    }

    /**
     * Méthode utilitaire pour obtenir la date formatée
     * @return Date formatée en string ou null si non définie
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