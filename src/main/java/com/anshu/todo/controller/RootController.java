package com.anshu.todo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class RootController {

    @GetMapping({"/", "/api"})
    public ResponseEntity<Map<String, Object>> getRootStatus() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "OK");
        response.put("message", "Todo API is running smoothly");
        response.put("version", "1.0.0");
        response.put("timestamp", LocalDateTime.now());
        response.put("endpoints", Map.of(
                "todos", "/api/todos",
                "actuator_health", "/actuator/health"
        ));
        return ResponseEntity.ok(response);
    }
}
