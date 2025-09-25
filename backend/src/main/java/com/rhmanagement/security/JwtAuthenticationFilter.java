package com.rhmanagement.security;

import com.rhmanagement.service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();

        // Debug log pour voir quels paths sont traités
        logger.debug("Vérification du path: {}", path);

        boolean shouldSkip = path.startsWith("/uploads/") ||
                path.startsWith("/api/auth/login") ||
                path.startsWith("/api/auth/register") ||
                path.startsWith("/api/auth/refresh") ||
                path.startsWith("/api/auth/validate") ||
                path.startsWith("/api/auth/test") ||
                path.equals("/favicon.ico") ||
                path.startsWith("/static/") ||
                request.getMethod().equals("OPTIONS");

        logger.debug("Path {} sera {} par le filtre JWT", path, shouldSkip ? "ignoré" : "traité");
        return shouldSkip;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String header = request.getHeader("Authorization");
        String token = null;

        logger.debug("=== JWT FILTER DEBUG ===");
        logger.debug("Path: {}", path);
        logger.debug("Authorization header: {}", header != null ? "Present" : "Absent");

        // Extraction du token
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            token = header.substring(7);
            logger.debug("Token extrait: {}...", token.substring(0, Math.min(10, token.length())));
        } else {
            logger.debug("Pas de token Bearer trouvé dans les headers");
        }

        try {
            if (token != null) {
                logger.debug("Validation du token en cours...");

                // Vérification de la validité du token
                if (jwtUtil.isTokenValid(token)) {
                    logger.debug("Token valide, extraction du username...");

                    String username = jwtUtil.extractUsername(token);
                    logger.debug("Username extrait: {}", username);

                    if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                        logger.debug("Chargement des détails utilisateur pour: {}", username);

                        UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                        if (userDetails != null) {
                            logger.debug("UserDetails trouvé. Authorities: {}", userDetails.getAuthorities());

                            // Création du token d'authentification
                            UsernamePasswordAuthenticationToken auth =
                                    new UsernamePasswordAuthenticationToken(
                                            userDetails,
                                            null,
                                            userDetails.getAuthorities()
                                    );

                            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                            SecurityContextHolder.getContext().setAuthentication(auth);

                            logger.debug("Authentification définie avec succès pour: {}", username);
                        } else {
                            logger.warn("UserDetails null pour username: {}", username);
                        }
                    } else if (SecurityContextHolder.getContext().getAuthentication() != null) {
                        logger.debug("Utilisateur déjà authentifié: {}",
                                SecurityContextHolder.getContext().getAuthentication().getName());
                    }
                } else {
                    logger.warn("Token JWT invalide ou expiré");
                    // Nettoyer le contexte de sécurité en cas de token invalide
                    SecurityContextHolder.clearContext();
                }
            } else {
                logger.debug("Aucun token JWT fourni");
            }
        } catch (Exception ex) {
            logger.error("Erreur lors du traitement du JWT pour le path {}: {}", path, ex.getMessage(), ex);

            // Important: Nettoyer le contexte en cas d'erreur
            SecurityContextHolder.clearContext();

            // Pour debug: ne pas faire échouer la requête, juste log l'erreur
            // En production, vous pourriez vouloir retourner une erreur 401
        }

        logger.debug("Authentification finale: {}",
                SecurityContextHolder.getContext().getAuthentication() != null ?
                        SecurityContextHolder.getContext().getAuthentication().getName() : "null");
        logger.debug("=== FIN JWT FILTER ===");

        filterChain.doFilter(request, response);
    }
}