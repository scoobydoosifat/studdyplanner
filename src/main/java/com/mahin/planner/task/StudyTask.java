package com.mahin.planner.task;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "study_tasks")
public class StudyTask {
    @Id
    private String id;
    private String title;
    private String subject;
    @Indexed
    private LocalDate date;
    private LocalTime startTime;
    private Integer durationMinutes;
    private Priority priority;
    private String notes;
    @Indexed
    private boolean completed;
    private Instant completedAt;
    private Instant createdAt;
    private Instant updatedAt;
    @Version
    private Long version;
}

