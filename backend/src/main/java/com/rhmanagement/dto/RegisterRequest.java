package com.rhmanagement.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

public class RegisterRequest {

    // ======== Setters ========
    @Setter
    @JsonProperty("nom_utilisateur")
    private String username;

    @Getter
    @Setter
    @JsonProperty("mot_de_passe")
    private String password;

    @JsonProperty("email")
    private String email;

    @JsonProperty("nom")
    private String firstName;

    @JsonProperty("prenom")
    private String lastName;

    @Setter
    @JsonProperty("telephone")
    private String phone;

    @JsonProperty("poste")
    private String role;

    // ======== toString (optionnel pour debug) ========
    @Override
    public String toString() {
        return "RegisterRequest{" +
                "username='" + username + '\'' +
                ", password='" + password + '\'' +
                ", email='" + email + '\'' +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", phone='" + phone + '\'' +
                ", role='" + role + '\'' +
                '}';
    }

    public String getEmail() {
        return null;
    }

    public void setMotDePasse(String encode) {

    }

    public String getNomUtilisateur() {
        return null;
    }

    public CharSequence getMotDePasse() {
        return null;
    }

    public void setDateInscription(LocalDateTime now) {

    }

    public void setStatut(String actif) {

    }

    public String getNom() {
        return null;
    }

    public String getPrenom() {
        return null;
    }

    public String getTelephone() {
        return null;
    }

    public Object getRole() {
        return null;
    }
}

