namespace InternalTalentManagement.Models;

public class PerformanceReview
{
    public int Id { get; set; }
    public string EmployeeId { get; set; } = string.Empty;
    public string ReviewerId { get; set; } = string.Empty;
    public string Period { get; set; } = string.Empty; // Ej: "Q1 2025"
    public DateTime ReviewDate { get; set; } = DateTime.UtcNow;
    
    // Ratings (1-5)
    public int TechnicalSkillsRating { get; set; }
    public int TeamworkRating { get; set; }
    public int LeadershipRating { get; set; }
    public int CommunicationRating { get; set; }
    public int InitiativeRating { get; set; }
    public int ProductivityRating { get; set; }
    
    public decimal OverallScore { get; set; }
    public string? Strengths { get; set; }
    public string? AreasForImprovement { get; set; }
    public string? SupervisorComments { get; set; }

    // Navigation Properties
    public ApplicationUser Employee { get; set; } = null!;
    public ApplicationUser Reviewer { get; set; } = null!;
}
