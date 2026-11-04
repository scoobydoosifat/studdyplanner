package com.mahin.planner.task;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StudyTaskServiceTest {
    @Mock
    private StudyTaskRepository repository;
    @InjectMocks
    private StudyTaskService service;

    @Test
    void createsTrimmedTaskAsPending() {
        when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        StudyTaskRequest request = new StudyTaskRequest(
                "  Revise algebra  ", " Mathematics ", LocalDate.of(2026, 11, 8),
                LocalTime.of(18, 0), 45, Priority.HIGH, "  Chapter 3  ");

        StudyTask task = service.create(request);

        assertThat(task.getTitle()).isEqualTo("Revise algebra");
        assertThat(task.getSubject()).isEqualTo("Mathematics");
        assertThat(task.getNotes()).isEqualTo("Chapter 3");
        assertThat(task.isCompleted()).isFalse();
        verify(repository).save(task);
    }

    @Test
    void completionUpdatesTheTask() {
        StudyTask task = StudyTask.builder().id("task-1").completed(false).build();
        when(repository.findById("task-1")).thenReturn(Optional.of(task));
        when(repository.save(task)).thenReturn(task);

        StudyTask updated = service.setCompleted("task-1", true);

        assertThat(updated.isCompleted()).isTrue();
        assertThat(updated.getCompletedAt()).isNotNull();
    }

    @Test
    void calculatesSummary() {
        LocalDate day = LocalDate.of(2026, 11, 5);
        List<StudyTask> tasks = List.of(
                StudyTask.builder().date(day).subject("English").durationMinutes(30).completed(true).build(),
                StudyTask.builder().date(day).subject("Math").durationMinutes(60).completed(false).build());
        when(repository.findByDateBetweenOrderByDateAscStartTimeAsc(day, day)).thenReturn(tasks);

        StudySummary summary = service.summary(day, day);

        assertThat(summary.totalTasks()).isEqualTo(2);
        assertThat(summary.completedTasks()).isEqualTo(1);
        assertThat(summary.completionPercentage()).isEqualTo(50);
        assertThat(summary.plannedMinutes()).isEqualTo(90);
    }

    @Test
    void rejectsBackwardsRange() {
        assertThatThrownBy(() -> service.findBetween(
                LocalDate.of(2026, 12, 1), LocalDate.of(2026, 11, 1)))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void readsOneTask() {
        StudyTask task = StudyTask.builder().id("task-1").title("Read poetry").build();
        when(repository.findById("task-1")).thenReturn(Optional.of(task));

        assertThat(service.findById("task-1")).isSameAs(task);
    }

    @Test
    void reportsMissingTask() {
        when(repository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.findById("missing"))
                .isInstanceOf(TaskNotFoundException.class)
                .hasMessageContaining("missing");
    }

    @Test
    void listsTasksInRequestedDateRange() {
        LocalDate start = LocalDate.of(2026, 11, 1);
        LocalDate end = LocalDate.of(2026, 11, 30);
        StudyTask task = StudyTask.builder().id("task-1").date(start).build();
        when(repository.findByDateBetweenOrderByDateAscStartTimeAsc(start, end)).thenReturn(List.of(task));

        assertThat(service.findBetween(start, end)).containsExactly(task);
        verify(repository).findByDateBetweenOrderByDateAscStartTimeAsc(start, end);
    }

    @Test
    void updatesEveryEditableFieldAndPreservesCompletion() {
        StudyTask existing = StudyTask.builder()
                .id("task-1").title("Old").subject("Math").date(LocalDate.of(2026, 11, 1))
                .startTime(LocalTime.of(9, 0)).durationMinutes(25).priority(Priority.LOW)
                .completed(true).build();
        when(repository.findById("task-1")).thenReturn(Optional.of(existing));
        when(repository.save(existing)).thenReturn(existing);
        StudyTaskRequest request = new StudyTaskRequest(
                " New title ", " English ", LocalDate.of(2026, 12, 2),
                LocalTime.of(17, 30), 90, Priority.HIGH, " Essay practice ");

        StudyTask updated = service.update("task-1", request);

        assertThat(updated.getTitle()).isEqualTo("New title");
        assertThat(updated.getSubject()).isEqualTo("English");
        assertThat(updated.getDate()).isEqualTo(LocalDate.of(2026, 12, 2));
        assertThat(updated.getStartTime()).isEqualTo(LocalTime.of(17, 30));
        assertThat(updated.getDurationMinutes()).isEqualTo(90);
        assertThat(updated.getPriority()).isEqualTo(Priority.HIGH);
        assertThat(updated.isCompleted()).isTrue();
    }

    @Test
    void canMoveCompletedTaskBackToPending() {
        StudyTask task = StudyTask.builder().id("task-1").completed(true)
                .completedAt(java.time.Instant.now()).build();
        when(repository.findById("task-1")).thenReturn(Optional.of(task));
        when(repository.save(task)).thenReturn(task);

        StudyTask updated = service.setCompleted("task-1", false);

        assertThat(updated.isCompleted()).isFalse();
        assertThat(updated.getCompletedAt()).isNull();
    }

    @Test
    void deletesAnExistingTask() {
        StudyTask task = StudyTask.builder().id("task-1").build();
        when(repository.findById("task-1")).thenReturn(Optional.of(task));

        service.delete("task-1");

        verify(repository).delete(task);
    }

    @Test
    void summaryGroupsSubjectsAndDailyProgress() {
        LocalDate first = LocalDate.of(2026, 11, 3);
        LocalDate second = first.plusDays(1);
        List<StudyTask> tasks = List.of(
                StudyTask.builder().date(first).subject("Math").durationMinutes(30).completed(true).build(),
                StudyTask.builder().date(first).subject("Math").durationMinutes(45).completed(false).build(),
                StudyTask.builder().date(second).subject("English").durationMinutes(60).completed(true).build());
        when(repository.findByDateBetweenOrderByDateAscStartTimeAsc(first, second)).thenReturn(tasks);

        StudySummary summary = service.summary(first, second);

        assertThat(summary.dailyProgress()).hasSize(2);
        assertThat(summary.dailyProgress().getFirst().total()).isEqualTo(2);
        assertThat(summary.subjectProgress()).extracting(StudySummary.SubjectProgress::subject)
                .containsExactly("English", "Math");
        assertThat(summary.completedMinutes()).isEqualTo(90);
    }

    @Test
    void rejectsRangesLongerThanOneYear() {
        LocalDate start = LocalDate.of(2026, 1, 1);
        assertThatThrownBy(() -> service.findBetween(start, start.plusYears(1).plusDays(1)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("one year");
    }
}
