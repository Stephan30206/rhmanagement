package com.rhmanagement.controller;

import com.rhmanagement.repository.EmployeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class TestController {

    @Autowired
    private EmployeRepository employeRepository;

    @GetMapping("/test-db")
    public ResponseEntity<?> testDatabase() {
        try {
            long count = employeRepository.count();
            Map<String, Object> response = new HashMap<>();
            response.put("status", "OK");
            response.put("message", "Base de données connectée");
            response.put("nombre_employes", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("status", "ERROR");
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}