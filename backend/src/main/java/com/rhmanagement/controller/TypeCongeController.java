package com.rhmanagement.controller;

import com.rhmanagement.entity.TypeConge;
import com.rhmanagement.service.TypeCongeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/types-conge")
@CrossOrigin(origins = "http://localhost:5173")
public class TypeCongeController {

    @Autowired
    private TypeCongeService typeCongeService;

    @GetMapping
    public ResponseEntity<List<TypeConge>> getAllTypesConge() {
        List<TypeConge> types = typeCongeService.getAllTypesConge();
        return ResponseEntity.ok(types);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TypeConge> getTypeCongeById(@PathVariable Integer id) {
        Optional<TypeConge> type = typeCongeService.getTypeCongeById(id);
        return type.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<TypeConge> createTypeConge(@RequestBody TypeConge typeConge) {
        TypeConge nouveauType = typeCongeService.saveTypeConge(typeConge);
        return ResponseEntity.ok(nouveauType);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TypeConge> updateTypeConge(@PathVariable Integer id, @RequestBody TypeConge typeConge) {
        if (typeCongeService.getTypeCongeById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        typeConge.setId(id);
        TypeConge typeMaj = typeCongeService.saveTypeConge(typeConge);
        return ResponseEntity.ok(typeMaj);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTypeConge(@PathVariable Integer id) {
        if (typeCongeService.getTypeCongeById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        typeCongeService.deleteTypeConge(id);
        return ResponseEntity.ok().build();
    }
}