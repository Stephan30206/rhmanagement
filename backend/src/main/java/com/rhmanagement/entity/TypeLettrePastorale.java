package com.rhmanagement.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "typeslettrespastorales")
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TypeLettrePastorale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 20)
    private String code;

    @Column(nullable = false, length = 100)
    private String nom;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NiveauAutorite niveauAutorite;

    @Column(name = "validiteAnnees")
    private Integer validiteAnnees;

    public enum NiveauAutorite {
        EGLISE_LOCALE, DISTRICT, FEDERATION, UNION, DIVISION
    }
}