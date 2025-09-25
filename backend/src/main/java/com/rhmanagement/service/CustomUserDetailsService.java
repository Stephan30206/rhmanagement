package com.rhmanagement.service;

import com.rhmanagement.entity.Utilisateur;
import com.rhmanagement.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<Utilisateur> opt = utilisateurRepository.findByNomUtilisateur(username);
        Utilisateur u = opt.orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé: " + username));

        // map role -> ROLE_*
        String roleStr = (u.getRole() != null) ? u.getRole().toString() : "ADMIN";
        List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + roleStr));

        return User.builder()
                .username(u.getNomUtilisateur())
                .password(u.getMotDePasse()) // mot de passe encodé en DB
                .authorities(authorities)
                .accountLocked(false)
                .disabled(false)
                .build();
    }
}
