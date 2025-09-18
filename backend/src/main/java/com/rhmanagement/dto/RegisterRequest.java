// RegisterRequest.java
package com.rhmanagement.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class RegisterRequest {
    private String nomUtilisateur;
    private String motDePasse;
    private String email;
    private String nom;
    private String prenom;
    private String telephone;
    private String poste;
    private String adresse;
    private LocalDate dateNaissance;
    private String genre;
}