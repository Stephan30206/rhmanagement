package com.rhmanagement.repository;

import com.rhmanagement.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByEmployeId(Long employeId);
    List<Document> findByEmployeIdAndTypeDocument(Long employeId, Document.TypeDocument typeDocument);
}