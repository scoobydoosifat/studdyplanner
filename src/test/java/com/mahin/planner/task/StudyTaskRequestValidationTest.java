package com.mahin.planner.task;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.assertj.core.api.Assertions.assertThat;

class StudyTaskRequestValidationTest {
    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void acceptsTheThreeSupportedSubjects() {
        for (String subject : new String[]{"English", "Bangla", "General Knowledge"}) {
            assertThat(validator.validate(requestWith(subject))).isEmpty();
        }
    }

    @Test
    void rejectsAnUnsupportedSubject() {
        var violations = validator.validate(requestWith("Mathematics"));

        assertThat(violations).anySatisfy(violation -> {
            assertThat(violation.getPropertyPath().toString()).isEqualTo("subject");
            assertThat(violation.getMessage()).contains("English, Bangla, or General Knowledge");
        });
    }

    private StudyTaskRequest requestWith(String subject) {
        return new StudyTaskRequest("Read a chapter", subject, LocalDate.of(2026, 11, 5),
                LocalTime.of(18, 0), 30, Priority.MEDIUM, null);
    }
}
