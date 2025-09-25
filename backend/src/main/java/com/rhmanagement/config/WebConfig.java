package com.rhmanagement.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;
import java.io.File;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String currentDir = Paths.get("").toAbsolutePath().toString();
        String uploadsAbsolute = currentDir + File.separator + "uploads" + File.separator;

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:./uploads/")
                .addResourceLocations("file:" + uploadsAbsolute)
                .setCachePeriod(0);

        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(3600);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/uploads/**")
                .allowedOriginPatterns("*") // Ou spécifiez "http://localhost:5173"
                .allowedMethods("GET", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false); // Important pour les ressources statiques
    }
//    @Override
//    public void addCorsMappings(CorsRegistry registry) {
//        // ✅ CORS pour les uploads
//        registry.addMapping("/uploads/**")
//                .allowedOriginPatterns("http://localhost:*", "http://127.0.0.1:*")
//                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
//                .allowedHeaders("*")
//                .allowCredentials(true);
//
//        // ✅ CORS global pour les API
//        registry.addMapping("/api/**")
//                .allowedOriginPatterns("http://localhost:*", "http://127.0.0.1:*")
//                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
//                .allowedHeaders("*")
//                .allowCredentials(true);
//    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.setOrder(Ordered.HIGHEST_PRECEDENCE);
    }
}