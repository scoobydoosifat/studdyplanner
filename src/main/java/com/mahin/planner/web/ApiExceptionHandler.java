package com.mahin.planner.web;

import com.mahin.planner.task.TaskNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(TaskNotFoundException.class)
    public ResponseEntity<ApiError> notFound(TaskNotFoundException exception, HttpServletRequest request) {
        return error(HttpStatus.NOT_FOUND, exception.getMessage(), request, Map.of());
    }

    @ExceptionHandler({IllegalArgumentException.class, MissingServletRequestParameterException.class})
    public ResponseEntity<ApiError> badRequest(Exception exception, HttpServletRequest request) {
        return error(HttpStatus.BAD_REQUEST, exception.getMessage(), request, Map.of());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> validation(MethodArgumentNotValidException exception,
                                                HttpServletRequest request) {
        Map<String, String> fields = new LinkedHashMap<>();
        exception.getBindingResult().getFieldErrors().forEach(field ->
                fields.putIfAbsent(field.getField(), field.getDefaultMessage()));
        return error(HttpStatus.BAD_REQUEST, "Please check the task details", request, fields);
    }

    private ResponseEntity<ApiError> error(HttpStatus status, String message,
                                           HttpServletRequest request, Map<String, String> fields) {
        return ResponseEntity.status(status).body(new ApiError(
                Instant.now(), status.value(), status.getReasonPhrase(), message,
                request.getRequestURI(), fields));
    }

    public record ApiError(Instant timestamp, int status, String error, String message,
                           String path, Map<String, String> validationErrors) {}
}

