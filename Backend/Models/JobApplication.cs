namespace InternalTalentManagement.Models;

public class JobApplication
{
    public int Id { get; set; }
    public int JobOfferId { get; set; }
    public string ApplicantId { get; set; } = string.Empty;
    public DateTime ApplicationDate { get; set; } = DateTime.UtcNow;
    public ApplicationStatus Status { get; set; } = ApplicationStatus.Pending;
    public decimal MatchScore { get; set; }
    public string? HRNotes { get; set; }

    // Navigation Properties
    public JobOffer JobOffer { get; set; } = null!;
    public ApplicationUser Applicant { get; set; } = null!;
}

public enum ApplicationStatus
{
    Pending,
    UnderReview,
    Accepted,
    Rejected
}
