package com.rhmanagement.controller;

import com.rhmanagement.entity.TypeConge;
import com.rhmanagement.service.TypeCongeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/types-conge")
@CrossOrigin(origins = "http://localhost:5173")
public class TypeCongeController {

    @Autowired
    private TypeCongeService typeCongeService;

    @GetMapping
    public ResponseEntity<List<TypeConge>> getTypesConge() {
        List<TypeConge> types = typeCongeService.getAllTypesConge();
        return ResponseEntity.ok(types);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TypeConge> getTypeCongeById(@PathVariable Integer id) {
        return typeCongeService.getTypeCongeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}