package com.mahin.planner.task;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StudyTaskService {
    private final StudyTaskRepository repository;
    private final Clock clock = Clock.systemDefaultZone();

    public List<StudyTask> findBetween(LocalDate start, LocalDate end) {
        validateRange(start, end);
        return repository.findByDateBetweenOrderByDateAscStartTimeAsc(start, end);
    }

    public StudyTask findById(String id) {
        return repository.findById(id).orElseThrow(() -> new TaskNotFoundException(id));
    }

    public StudyTask create(StudyTaskRequest request) {
        Instant now = clock.instant();
        StudyTask task = StudyTask.builder()
                .title(request.title().trim())
                .subject(request.subject().trim())
                .date(request.date())
                .startTime(request.startTime())
                .durationMinutes(request.durationMinutes())
                .priority(request.priority())
                .notes(cleanNotes(request.notes()))
                .completed(false)
                .createdAt(now)
                .updatedAt(now)
                .build();
        return repository.save(task);
    }

    public StudyTask update(String id, StudyTaskRequest request) {
        StudyTask task = findById(id);
        task.setTitle(request.title().trim());
        task.setSubject(request.subject().trim());
        task.setDate(request.date());
        task.setStartTime(request.startTime());
        task.setDurationMinutes(request.durationMinutes());
        task.setPriority(request.priority());
        task.setNotes(cleanNotes(request.notes()));
        task.setUpdatedAt(clock.instant());
        return repository.save(task);
    }

    public StudyTask setCompleted(String id, boolean completed) {
        StudyTask task = findById(id);
        task.setCompleted(completed);
        task.setCompletedAt(completed ? clock.instant() : null);
        task.setUpdatedAt(clock.instant());
        return repository.save(task);
    }

    public void delete(String id) {
        StudyTask task = findById(id);
        repository.delete(task);
    }

    public StudySummary summary(LocalDate start, LocalDate end) {
        List<StudyTask> tasks = findBetween(start, end);
        long completed = tasks.stream().filter(StudyTask::isCompleted).count();
        int plannedMinutes = tasks.stream().mapToInt(StudyTask::getDurationMinutes).sum();
        int completedMinutes = tasks.stream().filter(StudyTask::isCompleted)
                .mapToInt(StudyTask::getDurationMinutes).sum();
        int percentage = tasks.isEmpty() ? 0 : (int) Math.round(completed * 100.0 / tasks.size());

        List<StudySummary.DailyProgress> daily = start.datesUntil(end.plusDays(1))
                .map(date -> {
                    List<StudyTask> dayTasks = tasks.stream().filter(task -> task.getDate().equals(date)).toList();
                    return new StudySummary.DailyProgress(
                            date,
                            dayTasks.size(),
                            dayTasks.stream().filter(StudyTask::isCompleted).count(),
                            dayTasks.stream().mapToInt(StudyTask::getDurationMinutes).sum());
                }).toList();

        Map<String, List<StudyTask>> bySubject = new LinkedHashMap<>();
        tasks.stream().sorted(Comparator.comparing(StudyTask::getSubject, String.CASE_INSENSITIVE_ORDER))
                .forEach(task -> bySubject.computeIfAbsent(task.getSubject(), key -> new ArrayList<>()).add(task));
        List<StudySummary.SubjectProgress> subjects = bySubject.entrySet().stream()
                .map(entry -> new StudySummary.SubjectProgress(
                        entry.getKey(),
                        entry.getValue().size(),
                        entry.getValue().stream().filter(StudyTask::isCompleted).count(),
                        entry.getValue().stream().mapToInt(StudyTask::getDurationMinutes).sum()))
                .toList();

        return new StudySummary(start, end, tasks.size(), completed, tasks.size() - completed,
                percentage, plannedMinutes, completedMinutes, calculateStreak(tasks, end), daily, subjects);
    }

    private int calculateStreak(List<StudyTask> tasks, LocalDate rangeEnd) {
        LocalDate cursor = rangeEnd.isAfter(LocalDate.now(clock)) ? LocalDate.now(clock) : rangeEnd;
        int streak = 0;
        while (true) {
            LocalDate day = cursor;
            List<StudyTask> dayTasks = tasks.stream().filter(task -> task.getDate().equals(day)).toList();
            if (dayTasks.isEmpty() || dayTasks.stream().anyMatch(task -> !task.isCompleted())) {
                return streak;
            }
            streak++;
            cursor = cursor.minusDays(1);
        }
    }

    private void validateRange(LocalDate start, LocalDate end) {
        if (end.isBefore(start)) {
            throw new IllegalArgumentException("End date must be on or after start date");
        }
        if (start.plusYears(1).isBefore(end)) {
            throw new IllegalArgumentException("Choose a date range of one year or less");
        }
    }

    private String cleanNotes(String notes) {
        return notes == null || notes.isBlank() ? null : notes.trim();
    }
}
