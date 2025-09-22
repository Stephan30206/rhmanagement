package com.rhmanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EntityScan("com.rhmanagement.entity")
@EnableJpaRepositories("com.rhmanagement.repository")
public class RhManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(RhManagementApplication.class, args);
    }
}