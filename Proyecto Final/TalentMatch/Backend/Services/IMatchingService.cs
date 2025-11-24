using InternalTalentManagement.Models;

namespace InternalTalentManagement.Services;

public interface IMatchingService
{
    Task<List<CandidateMatch>> GetRecommendedCandidates(int jobOfferId);
    decimal CalculateMatchScore(ApplicationUser candidate, JobOffer jobOffer, 
        decimal avgPerformanceScore, int achievementCount, int certificateCount);
}

public class CandidateMatch
{
    public string UserId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Department { get; set; }
    public string? Position { get; set; }
    public decimal MatchScore { get; set; }
    public decimal AveragePerformanceScore { get; set; }
    public int YearsInCompany { get; set; }
    public int AchievementCount { get; set; }
    public int CertificationCount { get; set; }
    public List<string> MatchingSkills { get; set; } = new();
}
