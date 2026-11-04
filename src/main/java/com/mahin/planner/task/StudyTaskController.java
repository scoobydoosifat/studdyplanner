package com.mahin.planner.task;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class StudyTaskController {
    private final StudyTaskService service;

    @GetMapping
    public List<StudyTask> findAll(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return service.findBetween(start, end);
    }

    @GetMapping("/{id}")
    public StudyTask findById(@PathVariable String id) {
        return service.findById(id);
    }

    @PostMapping
    public ResponseEntity<StudyTask> create(@Valid @RequestBody StudyTaskRequest request) {
        StudyTask task = service.create(request);
        return ResponseEntity.created(URI.create("/api/tasks/" + task.getId())).body(task);
    }

    @PutMapping("/{id}")
    public StudyTask update(@PathVariable String id, @Valid @RequestBody StudyTaskRequest request) {
        return service.update(id, request);
    }

    @PatchMapping("/{id}/completion")
    public StudyTask setCompleted(@PathVariable String id, @RequestBody CompletionRequest request) {
        return service.setCompleted(id, request.completed());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/summary")
    public StudySummary summary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return service.summary(start, end);
    }

    public record CompletionRequest(boolean completed) {}
}

