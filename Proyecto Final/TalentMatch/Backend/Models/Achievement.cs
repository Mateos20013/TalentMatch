namespace InternalTalentManagement.Models;

public class Achievement
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime AchievedDate { get; set; }
    public string Category { get; set; } = string.Empty; // Ej: Project, Innovation, Leadership
    public int ImpactScore { get; set; } = 5; // 1-10
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Property
    public ApplicationUser User { get; set; } = null!;
}
