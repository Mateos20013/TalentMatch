using Microsoft.AspNetCore.Identity;

namespace InternalTalentManagement.Models;

public class ApplicationUser : IdentityUser
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Department { get; set; }
    public string? Position { get; set; }
    public DateTime HireDate { get; set; } = DateTime.UtcNow;
    public bool IsApproved { get; set; } = false;

    // Navigation Properties
    public ICollection<Objective> Objectives { get; set; } = new List<Objective>();
    public ICollection<Certificate> Certificates { get; set; } = new List<Certificate>();
    public ICollection<Achievement> Achievements { get; set; } = new List<Achievement>();
    public ICollection<PerformanceReview> ReviewsReceived { get; set; } = new List<PerformanceReview>();
    public ICollection<PerformanceReview> ReviewsGiven { get; set; } = new List<PerformanceReview>();
    public ICollection<JobOffer> JobOffers { get; set; } = new List<JobOffer>();
}
