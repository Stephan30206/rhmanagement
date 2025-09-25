package com.rhmanagement.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path rootLocation = Paths.get("uploads");

    public FileStorageService() {
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage", e);
        }
    }

    public String storeFile(MultipartFile file) {
        try {
            if (file.isEmpty()) {
                throw new RuntimeException("Failed to store empty file.");
            }

            // Générer un nom de fichier unique
            String originalFileName = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            String fileName = UUID.randomUUID().toString() + fileExtension;

            // Créer le dossier de destination s'il n'existe pas
            Path destinationDirectory = rootLocation.resolve("profiles");
            Files.createDirectories(destinationDirectory);

            // Sauvegarder le fichier
            Path destinationFile = destinationDirectory.resolve(fileName);
            Files.copy(file.getInputStream(), destinationFile);

            return fileName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file.", e);
        }
    }

    public Path loadFile(String filename) {
        return rootLocation.resolve("profiles").resolve(filename);
    }

    public void deleteFile(String filename) {
        try {
            Path file = loadFile(filename);
            Files.deleteIfExists(file);
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete file.", e);
        }
    }
}