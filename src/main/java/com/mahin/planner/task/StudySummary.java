package com.mahin.planner.task;

import java.time.LocalDate;
import java.util.List;

public record StudySummary(
        LocalDate startDate,
        LocalDate endDate,
        long totalTasks,
        long completedTasks,
        long pendingTasks,
        int completionPercentage,
        int plannedMinutes,
        int completedMinutes,
        int studyStreak,
        List<DailyProgress> dailyProgress,
        List<SubjectProgress> subjectProgress
) {
    public record DailyProgress(LocalDate date, long total, long completed, int plannedMinutes) {}
    public record SubjectProgress(String subject, long total, long completed, int plannedMinutes) {}
}

