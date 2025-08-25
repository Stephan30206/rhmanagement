package com.rhmanagement.config;

import com.fasterxml.jackson.databind.SerializationFeature;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfig {

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer jsonCustomizer() {
        return builder -> {
            builder.simpleDateFormat("yyyy-MM-dd");
            builder.featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
            // Désactive l'écriture des BigDecimal en notation simple
            builder.featuresToDisable(SerializationFeature.WRITE_BIGDECIMAL_AS_PLAIN);
        };
    }
}
