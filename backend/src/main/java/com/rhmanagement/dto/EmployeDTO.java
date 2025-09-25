package com.rhmanagement.dto;

import lombok.*;

public class EmployeDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String matricule;
    private String poste;
    // Getters et setters
    @Getter
    @Setter
    private String postePersonnalise; // AJOUTEZ ce champ
}
