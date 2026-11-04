package com.mahin.planner.task;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;

public record StudyTaskRequest(
        @NotBlank(message = "Give this study session a title")
        @Size(max = 100, message = "Title must be 100 characters or fewer")
        String title,

        @NotBlank(message = "Choose or enter a subject")
        @Size(max = 50, message = "Subject must be 50 characters or fewer")
        @Pattern(regexp = "\\s*(English|Bangla|General Knowledge)\\s*",
                message = "Subject must be English, Bangla, or General Knowledge")
        String subject,

        @NotNull(message = "Choose a study date")
        LocalDate date,

        @NotNull(message = "Choose a start time")
        LocalTime startTime,

        @NotNull(message = "Add the planned study time")
        @Min(value = 10, message = "Plan at least 10 minutes")
        @Max(value = 480, message = "Keep one session within 8 hours")
        Integer durationMinutes,

        @NotNull(message = "Choose a priority")
        Priority priority,

        @Size(max = 400, message = "Notes must be 400 characters or fewer")
        String notes
) {
}
