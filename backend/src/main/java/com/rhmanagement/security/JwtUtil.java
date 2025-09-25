package com.rhmanagement.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    private static final String SECRET_KEY = "TaCleSecreteSuperLongueEtSecuriseePourJWT1234567890"; // ⚠️ mets une clé d'au moins 32 caractères
    private static final long EXPIRATION_TIME = 1000 * 60 * 60; // 1 heure

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // Générer un token à partir d'un username
    public String generateToken(String username) {
        return generateToken(new HashMap<>(), username);
    }

    public String generateToken(Map<String, Object> extraClaims, String username) {
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Rafraîchir un token (nouvelle date d’expiration)
    public String refreshToken(String token) {
        String username = extractUsername(token);
        return generateToken(new HashMap<>(), username);
    }

    // Extraire l'username depuis le token
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // Extraire une information spécifique
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // Vérifier si un token est valide
    public boolean isTokenValid(String token) {
        try {
            String username = extractUsername(token);
            return (username != null && !isTokenExpired(token));
        } catch (Exception e) {
            return false;
        }
    }

    // Vérifier si un token est proche de l’expiration (minutes avant fin)
    public boolean isTokenExpiringSoon(String token, int minutesBefore) {
        Date expiration = extractExpiration(token);
        return expiration.getTime() - System.currentTimeMillis() <= minutesBefore * 60 * 1000L;
    }

    // Extraire la date d’expiration
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // Vérifier si le token est expiré
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // Parser tous les claims du token
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
