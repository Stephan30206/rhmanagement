package com.rhmanagement.dto;

public class EmployeDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String matricule;
    private String poste;
    // N'incluez pas les collections pour éviter la sérialisation circulaire
}
