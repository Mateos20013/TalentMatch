namespace InternalTalentManagement.Models;

public class JobOffer
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string RequiredSkills { get; set; } = string.Empty;
    public int MinYearsExperience { get; set; }
    public decimal MinPerformanceScore { get; set; }
    public string? PreferredCertifications { get; set; }
    public JobOfferStatus Status { get; set; } = JobOfferStatus.Active;
    public DateTime PostedDate { get; set; } = DateTime.UtcNow;
    public DateTime? ClosingDate { get; set; }
    public string CreatedById { get; set; } = string.Empty;

    // Navigation Properties
    public ApplicationUser CreatedBy { get; set; } = null!;
    public ICollection<JobApplication> Applications { get; set; } = new List<JobApplication>();
}

public enum JobOfferStatus
{
    Active,
    Closed,
    Cancelled
}
