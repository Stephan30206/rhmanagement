package com.rhmanagement.security;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.http.SessionCreationPolicy;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {})
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // ✅ CORS preflight - TRÈS IMPORTANT de le mettre en premier
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // ✅ Ressources statiques - ordre important !
                        .requestMatchers("/uploads/**").permitAll()
                        .requestMatchers("/static/**").permitAll()
                        .requestMatchers("/favicon.ico").permitAll()

                        // ✅ Endpoints d'authentification publics
                        .requestMatchers("/api/auth/login",
                                "/api/auth/register",
                                "/api/auth/refresh",
                                "/api/auth/validate",
                                "/api/auth/test").permitAll()

                        // ✅ Endpoints protégés nécessitant une authentification
                        .requestMatchers("/api/auth/profile",
                                "/api/auth/me",
                                "/api/auth/change-password",
                                "/api/auth/upload-photo").authenticated()

                        // ✅ CORRECTION PRINCIPALE : Ajout des affectations pastorales
                        .requestMatchers("/api/affectations-pastorales/**").authenticated()

                        // ✅ Autres endpoints d'administration
                        .requestMatchers("/api/utilisateurs/**",
                                "/api/employes/**",
                                "/api/admin/**").authenticated()

                        // ✅ Tous les autres endpoints d'API nécessitent une authentification
                        .requestMatchers("/api/**").authenticated()

                        // ✅ Tout le reste est autorisé (pour les erreurs Spring Boot)
                        .anyRequest().permitAll()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}