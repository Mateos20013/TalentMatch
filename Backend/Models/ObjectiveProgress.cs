namespace InternalTalentManagement.Models;

public class ObjectiveProgress
{
    public int Id { get; set; }
    public int ObjectiveId { get; set; }
    public string UpdatedBy { get; set; } = string.Empty; // Employee or Supervisor
    public string Notes { get; set; } = string.Empty;
    public int ProgressPercentage { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Property
    public Objective Objective { get; set; } = null!;
}
