// CustomUserDetailsService.java
package com.rhmanagement.security;

import com.rhmanagement.entity.Utilisateur;
import com.rhmanagement.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Utilisateur utilisateur = utilisateurRepository.findByNomUtilisateur(username)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé: " + username));

        if (!utilisateur.getActif()) {
            throw new UsernameNotFoundException("Utilisateur désactivé: " + username);
        }

        return User
                .withUsername(utilisateur.getNomUtilisateur())
                .password(utilisateur.getMotDePasse())
                .roles(utilisateur.getRole().name())
                .build();
    }
}