package com.rhmanagement.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "historique_poste")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HistoriquePoste {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String poste;

    @Column(nullable = false, length = 255)
    private String organisation;

    @Column(name = "date_debut", nullable = false)
    private LocalDate dateDebut;

    @Column(name = "date_fin")
    private LocalDate dateFin;

    @Column(name = "salaire_plein_temps", columnDefinition = "DECIMAL(10,2)")
    private BigDecimal salairePleinTemps;

    @Column(name = "pourcentage_salaire", columnDefinition = "DECIMAL(5,2)")
    private BigDecimal pourcentageSalaire;

    @Column(name = "salaire_base_100", columnDefinition = "DECIMAL(10,2)")
    private BigDecimal salaireBase100;

    @Column(name = "employe_id", nullable = false)
    private Long employeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employe_id", insertable = false, updatable = false)
    private Employe employe;

    // Méthode pour calculer le salaire effectif
    public BigDecimal getSalaireEffectif() {
        if (salairePleinTemps == null || pourcentageSalaire == null) {
            return BigDecimal.ZERO;
        }
        return salairePleinTemps.multiply(pourcentageSalaire.divide(BigDecimal.valueOf(100)));
    }
}