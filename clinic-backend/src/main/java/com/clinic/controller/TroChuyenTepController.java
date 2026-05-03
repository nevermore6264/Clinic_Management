package com.clinic.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Tải lên / tải xuống tệp đính kèm tin nhắn (ảnh, PDF, Office nhỏ).
 */
@RestController
@RequestMapping("/api/tro-chuyen")
public class TroChuyenTepController {

    private static final long KICH_TOI_DA = 15L * 1024 * 1024;
    private static final Pattern AN_TOAN_TEN = Pattern.compile(
            "^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}\\.[A-Za-z0-9]{1,12}$");

    private final Path thuMuc;

    public TroChuyenTepController(@Value("${app.chat.upload-dir:uploads/chat}") String duongLuu) {
        this.thuMuc = Paths.get(duongLuu).toAbsolutePath().normalize();
    }

    @PostMapping("/tai-len")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> taiLen(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        if (file.getSize() > KICH_TOI_DA) {
            return ResponseEntity.badRequest().body(Map.of("message", "Tệp vượt quá 15 MB."));
        }
        String tenGoc = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
        String moRong = layMoRongAnToan(tenGoc);
        String loai = file.getContentType();
        if (loai == null || loai.isBlank()) {
            loai = doanMimeTuMoRong(moRong);
        }
        if (!duocPhep(loai, moRong)) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Chỉ chấp nhận ảnh, PDF hoặc Word (.doc/.docx)."));
        }
        Files.createDirectories(thuMuc);
        String tenLuu = UUID.randomUUID() + "." + moRong;
        Path dich = thuMuc.resolve(tenLuu).normalize();
        if (!dich.startsWith(thuMuc)) {
            return ResponseEntity.badRequest().build();
        }
        file.transferTo(dich.toFile());
        String duongDan = "/tro-chuyen/tep/" + tenLuu;
        return ResponseEntity.ok(Map.of(
                "duongDan", duongDan,
                "tenHienThi", tenGoc.length() > 200 ? tenGoc.substring(0, 200) : tenGoc,
                "loaiMime", loai,
                "kichThuoc", file.getSize()
        ));
    }

    @GetMapping("/tep/{filename:.+}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> taiXuong(@PathVariable String filename) throws IOException {
        if (!AN_TOAN_TEN.matcher(filename).matches()) {
            return ResponseEntity.notFound().build();
        }
        Path tep = thuMuc.resolve(filename).normalize();
        if (!tep.startsWith(thuMuc) || !Files.isRegularFile(tep)) {
            return ResponseEntity.notFound().build();
        }
        Resource resource = new FileSystemResource(tep);
        String mime = Files.probeContentType(tep);
        if (mime == null) {
            mime = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(mime))
                .header(HttpHeaders.CACHE_CONTROL, "private, max-age=3600")
                .body(resource);
    }

    private static String layMoRongAnToan(String tenGoc) {
        int i = tenGoc.lastIndexOf('.');
        if (i < 0 || i >= tenGoc.length() - 1) return "bin";
        String ext = tenGoc.substring(i + 1).toLowerCase(Locale.ROOT);
        return ext.replaceAll("[^a-z0-9]", "");
    }

    private static String doanMimeTuMoRong(String moRong) {
        return switch (moRong) {
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "gif" -> "image/gif";
            case "webp" -> "image/webp";
            case "pdf" -> "application/pdf";
            case "doc" -> "application/msword";
            case "docx" -> "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            default -> "application/octet-stream";
        };
    }

    private static boolean duocPhep(String loai, String moRong) {
        if (loai != null) {
            String l = loai.toLowerCase(Locale.ROOT);
            if (l.startsWith("image/")) return true;
            if (l.contains("pdf")) return true;
            if (l.contains("msword") || l.contains("wordprocessingml") || l.contains("officedocument")) return true;
        }
        return moRong.matches("jpe?g|png|gif|webp|pdf|doc|docx");
    }
}
