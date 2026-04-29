package com.clinic.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
public class XuLyNgoaiLeToanCuc {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + (e.getDefaultMessage() != null ? e.getDefaultMessage() : "không hợp lệ"))
                .collect(Collectors.joining("; "));
        return response(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", message);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntime(RuntimeException ex) {
        log.warn("RuntimeException: {}", ex.getMessage());
        return response(HttpStatus.BAD_REQUEST, "ERROR", ex.getMessage() != null ? ex.getMessage() : "Có lỗi xảy ra");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleOther(Exception ex) {
        log.error("Exception", ex);
        return response(HttpStatus.INTERNAL_SERVER_ERROR, "SERVER_ERROR", "Lỗi hệ thống. Vui lòng thử lại sau.");
    }

    private ResponseEntity<Map<String, Object>> response(HttpStatus status, String code, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("code", code);
        body.put("message", message);
        body.put("timestamp", java.time.Instant.now().toString());
        return ResponseEntity.status(status).body(body);
    }
}
