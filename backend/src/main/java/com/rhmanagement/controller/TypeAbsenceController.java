// TypeAbsenceController.java
package com.rhmanagement.controller;

import com.rhmanagement.entity.TypeAbsence;
import com.rhmanagement.repository.TypeAbsenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/types-absence") // Doit correspondre exactement
@CrossOrigin(origins = "http://localhost:5173")
public class TypeAbsenceController {

    @Autowired
    private TypeAbsenceRepository typeAbsenceRepository;

    @GetMapping // Cette annotation est cruciale
    public ResponseEntity<List<TypeAbsence>> getAllTypesAbsence() {
        try {
            List<TypeAbsence> types = typeAbsenceRepository.findAll();
            return ResponseEntity.ok(types);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}