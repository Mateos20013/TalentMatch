namespace InternalTalentManagement.Models;

public class Objective
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime TargetDate { get; set; }
    public ObjectiveStatus Status { get; set; } = ObjectiveStatus.InProgress;
    public int CompletionPercentage { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    public ApplicationUser User { get; set; } = null!;
    public ICollection<ObjectiveProgress> ProgressUpdates { get; set; } = new List<ObjectiveProgress>();
}

public enum ObjectiveStatus
{
    NotStarted,
    InProgress,
    Completed,
    Cancelled
}
