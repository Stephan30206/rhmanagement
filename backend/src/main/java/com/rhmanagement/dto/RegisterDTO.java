package com.rhmanagement.dto;

public class RegisterDTO {
    private String nom_utilisateur;
    private String mot_de_passe;
    private String email;
    private String nom;
    private String prenom;
    private String telephone;
    private String poste;

    // Constructeur par défaut
    public RegisterDTO() {}

    // Getters et Setters
    public String getNom_utilisateur() { return nom_utilisateur; }
    public void setNom_utilisateur(String nom_utilisateur) { this.nom_utilisateur = nom_utilisateur; }

    public String getMot_de_passe() { return mot_de_passe; }
    public void setMot_de_passe(String mot_de_passe) { this.mot_de_passe = mot_de_passe; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }

    public String getPoste() { return poste; }
    public void setPoste(String poste) { this.poste = poste; }

    @Override
    public String toString() {
        return "RegisterDTO{" +
                "nom_utilisateur='" + nom_utilisateur + '\'' +
                ", email='" + email + '\'' +
                ", nom='" + nom + '\'' +
                ", prenom='" + prenom + '\'' +
                ", telephone='" + telephone + '\'' +
                ", poste='" + poste + '\'' +
                '}';
    }
}