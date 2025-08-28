package com.rhmanagement.service;

import com.rhmanagement.entity.HistoriquePoste;
import com.rhmanagement.repository.HistoriquePosteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class HistoriquePosteService {

    @Autowired
    private HistoriquePosteRepository historiquePosteRepository;

    public List<HistoriquePoste> getHistoriqueByEmployeId(Long employeId) {
        return historiquePosteRepository.findByEmployeIdOrderByDateDebutDesc(employeId);
    }

    public Optional<HistoriquePoste> getHistoriqueById(Long id) {
        return historiquePosteRepository.findById(id);
    }

    public HistoriquePoste saveHistorique(HistoriquePoste historique) {
        return historiquePosteRepository.save(historique);
    }

    public void deleteHistorique(Long id) {
        historiquePosteRepository.deleteById(id);
    }
}