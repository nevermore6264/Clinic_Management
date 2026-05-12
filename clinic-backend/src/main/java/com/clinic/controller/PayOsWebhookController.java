package com.clinic.controller;

import com.clinic.service.payos.PayOsWebhookService;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/webhooks")
@RequiredArgsConstructor
public class PayOsWebhookController {

    private final PayOsWebhookService payOsWebhookService;

    @PostMapping("/payos")
    public ResponseEntity<Void> nhan(@RequestBody JsonNode body) {
        payOsWebhookService.xuLyWebhook(body);
        return ResponseEntity.ok().build();
    }
}
