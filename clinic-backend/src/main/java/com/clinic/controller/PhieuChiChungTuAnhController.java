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

@RestController
@RequestMapping("/api/phieu-chi/chung-tu-anh")
public class PhieuChiChungTuAnhController {

    private static final long KICH_TOI_DA = 5L * 1024 * 1024;
    private static final Pattern AN_TOAN_TEN = Pattern.compile(
            "^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}\\.[A-Za-z0-9]{1,12}$");

    private final Path thuMuc;

    public PhieuChiChungTuAnhController(
            @Value("${app.phieu-chi.chung-tu-upload-dir:uploads/phieu-chi-chung-tu}") String duongLuu) {
        this.thuMuc = Paths.get(duongLuu).toAbsolutePath().normalize();
    }

    @PostMapping("/tai-len")
    @PreAuthorize("hasAnyRole('QUAN_TRI','THU_NGAN')")
    public ResponseEntity<Map<String, Object>> taiLen(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        if (file.getSize() > KICH_TOI_DA) {
            return ResponseEntity.badRequest().body(Map.of("message", "Ảnh vượt quá 5 MB."));
        }
        String tenGoc = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
        String moRong = layMoRongAnToan(tenGoc);
        String loai = file.getContentType();
        if (loai == null || loai.isBlank()) {
            loai = doanMimeTuMoRong(moRong);
        }
        if (!laAnh(loai, moRong)) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Chỉ chấp nhận ảnh (JPEG, PNG, GIF, WebP)."));
        }
        Files.createDirectories(thuMuc);
        String tenLuu = UUID.randomUUID() + "." + moRong;
        Path dich = thuMuc.resolve(tenLuu).normalize();
        if (!dich.startsWith(thuMuc)) {
            return ResponseEntity.badRequest().build();
        }
        file.transferTo(dich.toFile());
        String duongDan = "/phieu-chi/chung-tu-anh/" + tenLuu;
        return ResponseEntity.ok(Map.of(
                "duongDan", duongDan,
                "tenHienThi", tenGoc.length() > 200 ? tenGoc.substring(0, 200) : tenGoc,
                "loaiMime", loai,
                "kichThuoc", file.getSize()));
    }

    @GetMapping("/{filename:.+}")
    @PreAuthorize("hasAnyRole('QUAN_TRI','THU_NGAN')")
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
        if (i < 0 || i >= tenGoc.length() - 1) return "jpg";
        String ext = tenGoc.substring(i + 1).toLowerCase(Locale.ROOT);
        return ext.replaceAll("[^a-z0-9]", "");
    }

    private static String doanMimeTuMoRong(String moRong) {
        return switch (moRong) {
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "gif" -> "image/gif";
            case "webp" -> "image/webp";
            default -> "application/octet-stream";
        };
    }

    private static boolean laAnh(String loai, String moRong) {
        if (loai != null) {
            String l = loai.toLowerCase(Locale.ROOT);
            if (l.startsWith("image/")) {
                return !l.contains("svg");
            }
        }
        return moRong.matches("jpe?g|png|gif|webp");
    }
}
