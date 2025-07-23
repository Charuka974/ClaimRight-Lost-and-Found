//package com.assignment.ijse.back_end.util;
//
//import com.assignment.ijse.back_end.exceptions.StorageException;
//import org.springframework.stereotype.Service;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.io.IOException;
//import java.nio.file.Files;
//import java.nio.file.Path;
//import java.nio.file.Paths;
//import java.util.UUID;
//
//@Service
//public class FileStorageUtil {
//
//    private final Path rootLocation = Paths.get("../ClaimRight/Uploads_Storage/images");
//
//    public FileStorageUtil() {
//        try {
//            if (!Files.exists(rootLocation)) {
//                Files.createDirectories(rootLocation);
//            }
//        } catch (IOException e) {
//            throw new RuntimeException("Could not initialize storage folder", e);
//        }
//    }
//
//    public String save(MultipartFile file) throws IOException {
//        if (file.isEmpty()) {
//            throw new StorageException("Failed to store empty file.");
//        }
//
//        String filename = UUID.randomUUID() + "-" + file.getOriginalFilename();
//
//        Path destinationFile = rootLocation.resolve(Paths.get(filename)).normalize().toAbsolutePath();
//
//        if (!destinationFile.getParent().equals(rootLocation.toAbsolutePath())) {
//            throw new StorageException("Cannot store file outside current directory.");
//        }
//
//        Files.copy(file.getInputStream(), destinationFile);
//
//        // Return URL that frontend can use
//        return "/images/" + filename;
//
//    }
//
//}
