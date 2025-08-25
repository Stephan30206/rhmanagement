package com.rhmanagement.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Configuration pour les fichiers uploadés
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:./uploads/")
                .setCachePeriod(3600)
                .resourceChain(true);

        // Configuration pour les ressources statiques (optionnel)
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(3600);
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Assure la priorité des contrôleurs API sur les ressources statiques
        registry.setOrder(Ordered.HIGHEST_PRECEDENCE);
    }
}