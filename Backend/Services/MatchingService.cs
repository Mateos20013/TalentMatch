using Microsoft.EntityFrameworkCore;
using InternalTalentManagement.Data;
using InternalTalentManagement.Models;

namespace InternalTalentManagement.Services;

public class MatchingService : IMatchingService
{
    private readonly ApplicationDbContext _context;

    public MatchingService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<CandidateMatch>> GetRecommendedCandidates(int jobOfferId)
    {
        var jobOffer = await _context.JobOffers.FindAsync(jobOfferId);
        if (jobOffer == null) return new List<CandidateMatch>();

        var candidates = await _context.Users
            .Where(u => u.IsApproved)
            .Include(u => u.Achievements)
            .Include(u => u.Certificates)
            .Include(u => u.ReviewsReceived)
            .ToListAsync();

        var matches = new List<CandidateMatch>();

        foreach (var candidate in candidates)
        {
            var yearsInCompany = (DateTime.UtcNow - candidate.HireDate).Days / 365;

            var avgPerformanceScore = candidate.ReviewsReceived.Any()
                ? candidate.ReviewsReceived.Average(r => r.OverallScore)
                : 0;

            var achievementCount = candidate.Achievements.Count;
            var certificateCount = candidate.Certificates.Count;

            var matchScore = CalculateMatchScore(candidate, jobOffer, avgPerformanceScore, 
                achievementCount, certificateCount);

            
            matches.Add(new CandidateMatch
            {
                UserId = candidate.Id,
                FullName = $"{candidate.FirstName} {candidate.LastName}",
                Email = candidate.Email!,
                Department = candidate.Department,
                Position = candidate.Position,
                MatchScore = matchScore,
                AveragePerformanceScore = avgPerformanceScore,
                YearsInCompany = yearsInCompany,
                AchievementCount = achievementCount,
                CertificationCount = certificateCount,
                MatchingSkills = new List<string>()
            });
        }

        return matches.OrderByDescending(m => m.MatchScore).ToList();
    }

    public decimal CalculateMatchScore(ApplicationUser candidate, JobOffer jobOffer, 
        decimal avgPerformanceScore, int achievementCount, int certificateCount)
    {
        // Peso: Performance 40%, Experiencia 20%, Logros 20%, Certificaciones 20%
        decimal performanceScore = avgPerformanceScore > 0 
            ? (avgPerformanceScore / 5.0m) * 40 
            : 0;
        
        var yearsInCompany = (DateTime.UtcNow - candidate.HireDate).Days / 365;
        decimal experienceScore = jobOffer.MinYearsExperience > 0
            ? Math.Min((yearsInCompany / (decimal)jobOffer.MinYearsExperience), 1) * 20
            : 20; // Si no requiere experiencia mínima, da puntaje completo
        
        decimal achievementScore = Math.Min((achievementCount / 5.0m), 1) * 20;
        decimal certificateScore = Math.Min((certificateCount / 3.0m), 1) * 20;

        return Math.Round(performanceScore + experienceScore + achievementScore + certificateScore, 2);
    }
}
