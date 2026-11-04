package com.mahin.planner.web;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RootController {
    private final String frontendUrl;

    public RootController(@Value("${app.frontend.url}") String frontendUrl) {
        this.frontendUrl = frontendUrl;
    }

    @GetMapping("/")
    public ResponseEntity<Void> openPlanner() {
        return ResponseEntity.status(302)
                .header(HttpHeaders.LOCATION, frontendUrl)
                .build();
    }
}
