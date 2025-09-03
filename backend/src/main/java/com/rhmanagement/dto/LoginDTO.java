package com.rhmanagement.dto;

public class LoginDTO {
    private String nom_utilisateur;
    private String mot_de_passe;
    private boolean remember;

    // Constructeur par défaut
    public LoginDTO() {}

    // Getters et Setters
    public String getNom_utilisateur() { return nom_utilisateur; }
    public void setNom_utilisateur(String nom_utilisateur) { this.nom_utilisateur = nom_utilisateur; }

    public String getMot_de_passe() { return mot_de_passe; }
    public void setMot_de_passe(String mot_de_passe) { this.mot_de_passe = mot_de_passe; }

    public boolean isRemember() { return remember; }
    public void setRemember(boolean remember) { this.remember = remember; }
}