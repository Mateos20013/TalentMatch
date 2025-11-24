using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using InternalTalentManagement.Data;
using InternalTalentManagement.Models;

namespace InternalTalentManagement.Controllers;

// [Authorize] // Comentado temporalmente
public class EmployeeController : Controller
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _environment;

    public EmployeeController(ApplicationDbContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    public async Task<IActionResult> Index()
    {
        var userId = GetUserId();
        var user = await _context.Users
            .Include(u => u.Objectives).ThenInclude(o => o.ProgressUpdates)
            .Include(u => u.Achievements)
            .Include(u => u.Certificates)
            .Include(u => u.ReviewsReceived)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return NotFound();
        return View(user);
    }

    // Gestión de Objetivos
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> CreateObjective(Objective model)
    {
        model.UserId = GetUserId();
        model.Status = ObjectiveStatus.InProgress;
        model.CreatedAt = DateTime.UtcNow;

        _context.Objectives.Add(model);
        await _context.SaveChangesAsync();

        TempData["Success"] = "Objetivo creado exitosamente";
        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    public async Task<IActionResult> UpdateObjectiveProgress(int objectiveId, string notes, int progress)
    {
        var objective = await _context.Objectives.FindAsync(objectiveId);
        if (objective == null || objective.UserId != GetUserId()) return NotFound();

        var progressUpdate = new ObjectiveProgress
        {
            ObjectiveId = objectiveId,
            UpdatedBy = GetUserId(),
            Notes = notes,
            ProgressPercentage = progress,
            UpdatedAt = DateTime.UtcNow
        };

        objective.CompletionPercentage = progress;
        if (progress >= 100)
            objective.Status = ObjectiveStatus.Completed;

        _context.ObjectiveProgresses.Add(progressUpdate);
        await _context.SaveChangesAsync();

        return RedirectToAction(nameof(Index));
    }

    // Gestión de Certificados
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> CreateCertificate(Certificate model, IFormFile? file)
    {
        model.UserId = GetUserId();
        model.CreatedAt = DateTime.UtcNow;

        if (file != null && file.Length > 0)
        {
            var uploadsPath = Path.Combine(_environment.WebRootPath, "uploads", "certificates");
            Directory.CreateDirectory(uploadsPath);
            
            var fileName = $"{Guid.NewGuid()}_{file.FileName}";
            var filePath = Path.Combine(uploadsPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            model.FileUrl = $"/uploads/certificates/{fileName}";
        }

        _context.Certificates.Add(model);
        await _context.SaveChangesAsync();

        TempData["Success"] = "Certificado agregado exitosamente";
        return RedirectToAction(nameof(Index));
    }

    // Gestión de Logros
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> CreateAchievement(Achievement model)
    {
        model.UserId = GetUserId();
        model.CreatedAt = DateTime.UtcNow;

        _context.Achievements.Add(model);
        await _context.SaveChangesAsync();

        TempData["Success"] = "Logro agregado exitosamente";
        return RedirectToAction(nameof(Index));
    }

    // Ver ofertas disponibles
    public async Task<IActionResult> JobOffers()
    {
        var offers = await _context.JobOffers
            .Where(jo => jo.Status == JobOfferStatus.Active)
            .OrderByDescending(jo => jo.PostedDate)
            .ToListAsync();

        var userId = GetUserId();
        var appliedOfferIds = await _context.JobApplications
            .Where(ja => ja.ApplicantId == userId)
            .Select(ja => ja.JobOfferId)
            .ToListAsync();

        ViewBag.AppliedOfferIds = appliedOfferIds;
        return View(offers);
    }

    // Aplicar a oferta
    [HttpPost]
    public async Task<IActionResult> ApplyToJob(int jobId)
    {
        var userId = GetUserId();
        var exists = await _context.JobApplications
            .AnyAsync(ja => ja.JobOfferId == jobId && ja.ApplicantId == userId);

        if (exists)
        {
            TempData["Error"] = "Ya has aplicado a esta oferta";
            return RedirectToAction(nameof(JobOffers));
        }

        var user = await _context.Users
            .Include(u => u.ReviewsReceived)
            .Include(u => u.Achievements)
            .Include(u => u.Certificates)
            .FirstOrDefaultAsync(u => u.Id == userId);

        var jobOffer = await _context.JobOffers.FindAsync(jobId);
        if (jobOffer == null) return NotFound();

        // Calcular match score
        var avgPerformance = user!.ReviewsReceived.Any() 
            ? user.ReviewsReceived.Average(r => r.OverallScore) 
            : 0;

        var yearsInCompany = (DateTime.UtcNow - user.HireDate).Days / 365;
        var matchScore = CalculateMatchScore(avgPerformance, yearsInCompany, 
            user.Achievements.Count, user.Certificates.Count, jobOffer);

        var application = new JobApplication
        {
            JobOfferId = jobId,
            ApplicantId = userId,
            ApplicationDate = DateTime.UtcNow,
            Status = ApplicationStatus.Pending,
            MatchScore = matchScore
        };

        _context.JobApplications.Add(application);
        await _context.SaveChangesAsync();

        TempData["Success"] = "Aplicación enviada exitosamente";
        return RedirectToAction(nameof(JobOffers));
    }

    private decimal CalculateMatchScore(decimal avgPerformance, int yearsInCompany, 
        int achievementCount, int certificateCount, JobOffer jobOffer)
    {
        decimal performanceScore = (avgPerformance / 5.0m) * 40;
        decimal experienceScore = Math.Min((yearsInCompany / (decimal)jobOffer.MinYearsExperience), 1) * 20;
        decimal achievementScore = Math.Min((achievementCount / 5.0m), 1) * 20;
        decimal certificateScore = Math.Min((certificateCount / 3.0m), 1) * 20;

        return Math.Round(performanceScore + experienceScore + achievementScore + certificateScore, 2);
    }

    private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    // API Endpoints
    [HttpGet("api/employee/profile")]
    public async Task<IActionResult> ApiGetProfile([FromQuery] string email)
    {
        if (string.IsNullOrEmpty(email))
            return BadRequest(new { message = "Email requerido" });

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null) return NotFound();

        var result = new
        {
            id = user.Id,
            email = user.Email,
            firstName = user.FirstName,
            lastName = user.LastName,
            position = user.Position,
            department = user.Department,
            hireDate = user.HireDate,
            isApproved = user.IsApproved
        };
        return Ok(result);
    }

    [HttpPost("api/employee/update-profile")]
    public async Task<IActionResult> ApiUpdateProfile([FromBody] UpdateProfileRequest request)
    {
        if (string.IsNullOrEmpty(request.Email))
            return BadRequest(new { message = "Email requerido" });

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null) return NotFound();

        user.FirstName = request.FirstName ?? user.FirstName;
        user.LastName = request.LastName ?? user.LastName;
        user.Position = request.Position ?? user.Position;
        user.Department = request.Department ?? user.Department;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Perfil actualizado" });
    }

    [HttpGet("api/employee/objectives")]
    public async Task<IActionResult> ApiGetObjectives([FromQuery] string email)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null) return NotFound();

        var objectives = await _context.Objectives
            .Where(o => o.UserId == user.Id)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new
            {
                id = o.Id,
                title = o.Title,
                description = o.Description,
                startDate = o.StartDate,
                targetDate = o.TargetDate,
                status = o.Status.ToString(),
                completionPercentage = o.CompletionPercentage,
                createdAt = o.CreatedAt
            })
            .ToListAsync();
        return Ok(objectives);
    }

    [HttpPost("api/employee/create-objective")]
    public async Task<IActionResult> ApiCreateObjective([FromBody] CreateObjectiveRequest request)
    {
        if (string.IsNullOrEmpty(request.Email))
            return BadRequest(new { message = "Email requerido" });

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null) return NotFound();

        DateTime targetDate = DateTime.UtcNow.AddMonths(1);
        if (request.Deadline.HasValue)
        {
            targetDate = request.Deadline.Value.Kind == DateTimeKind.Utc 
                ? request.Deadline.Value 
                : DateTime.SpecifyKind(request.Deadline.Value, DateTimeKind.Utc);
        }

        var objective = new Objective
        {
            UserId = user.Id,
            Title = request.Title ?? "",
            Description = request.Description ?? "",
            StartDate = DateTime.UtcNow,
            TargetDate = targetDate,
            Status = ObjectiveStatus.InProgress,
            CompletionPercentage = 0,
            CreatedAt = DateTime.UtcNow
        };

        _context.Objectives.Add(objective);
        await _context.SaveChangesAsync();

        // Devolver DTO sin referencias circulares
        var result = new
        {
            id = objective.Id,
            title = objective.Title,
            description = objective.Description,
            startDate = objective.StartDate,
            targetDate = objective.TargetDate,
            status = objective.Status.ToString(),
            completionPercentage = objective.CompletionPercentage,
            createdAt = objective.CreatedAt
        };

        return Ok(result);
    }

    [HttpGet("api/employee/certificates")]
    public async Task<IActionResult> ApiGetCertificates([FromQuery] string email)
    {
        if (string.IsNullOrEmpty(email))
            return BadRequest(new { message = "Email requerido" });

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null) return NotFound();

        var certs = await _context.Certificates
            .Where(c => c.UserId == user.Id)
            .OrderByDescending(c => c.IssueDate)
            .Select(c => new
            {
                id = c.Id,
                name = c.Name,
                issuingOrganization = c.IssuingOrganization,
                issueDate = c.IssueDate,
                expirationDate = c.ExpirationDate,
                fileUrl = c.FileUrl
            })
            .ToListAsync();
        return Ok(certs);
    }

    [HttpPost("api/employee/create-certificate")]
    public async Task<IActionResult> ApiCreateCertificate([FromQuery] string email, [FromForm] string name, [FromForm] string issuingOrganization, [FromForm] DateTime issueDate, [FromForm] DateTime? expiryDate, IFormFile? file)
    {
        if (string.IsNullOrEmpty(email))
            return BadRequest(new { message = "Email requerido" });

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null) return NotFound();

        string? fileUrl = null;
        if (file != null)
        {
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "certificates");
            Directory.CreateDirectory(uploadsFolder);
            var fileName = $"{Guid.NewGuid()}_{file.FileName}";
            var filePath = Path.Combine(uploadsFolder, fileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            fileUrl = $"/uploads/certificates/{fileName}";
        }

        var certificate = new Certificate
        {
            UserId = user.Id,
            Name = name,
            IssuingOrganization = issuingOrganization,
            IssueDate = DateTime.SpecifyKind(issueDate, DateTimeKind.Utc),
            ExpirationDate = expiryDate.HasValue ? DateTime.SpecifyKind(expiryDate.Value, DateTimeKind.Utc) : null,
            FileUrl = fileUrl
        };

        _context.Certificates.Add(certificate);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            id = certificate.Id,
            name = certificate.Name,
            issuingOrganization = certificate.IssuingOrganization,
            issueDate = certificate.IssueDate,
            expirationDate = certificate.ExpirationDate,
            fileUrl = certificate.FileUrl
        });
    }

    [HttpGet("api/employee/achievements")]
    public async Task<IActionResult> ApiGetAchievements([FromQuery] string email)
    {
        if (string.IsNullOrEmpty(email))
            return BadRequest(new { message = "Email requerido" });

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null) return NotFound();

        var achievements = await _context.Achievements
            .Where(a => a.UserId == user.Id)
            .OrderByDescending(a => a.AchievedDate)
            .Select(a => new
            {
                id = a.Id,
                title = a.Title,
                description = a.Description,
                achievedDate = a.AchievedDate,
                impactScore = a.ImpactScore
            })
            .ToListAsync();
        return Ok(achievements);
    }

    [HttpPost("api/employee/create-achievement")]
    public async Task<IActionResult> ApiCreateAchievement([FromBody] CreateAchievementRequest request)
    {
        if (string.IsNullOrEmpty(request.Email))
            return BadRequest(new { message = "Email requerido" });

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null) return NotFound();

        var achievement = new Achievement
        {
            UserId = user.Id,
            Title = request.Title ?? "",
            Description = request.Description ?? "",
            AchievedDate = request.Date.HasValue 
                ? DateTime.SpecifyKind(request.Date.Value, DateTimeKind.Utc) 
                : DateTime.UtcNow,
            ImpactScore = request.ImpactScore ?? 1
        };

        _context.Achievements.Add(achievement);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            id = achievement.Id,
            title = achievement.Title,
            description = achievement.Description,
            achievedDate = achievement.AchievedDate,
            impactScore = achievement.ImpactScore
        });
    }

    [HttpGet("api/employee/job-offers")]
    public async Task<IActionResult> ApiGetAvailableJobOffers([FromQuery] string email)
    {
        // Get employee with performance reviews
        var employee = await _context.Users
            .Include(u => u.ReviewsReceived)
            .FirstOrDefaultAsync(u => u.Email == email);
        
        if (employee == null)
            return NotFound(new { message = "Empleado no encontrado" });

        // Calculate average performance score
        var avgPerformanceScore = employee.ReviewsReceived.Any()
            ? employee.ReviewsReceived.Average(pr => pr.OverallScore)
            : 0;

        // Filter job offers by minimum performance requirement
        var offers = await _context.JobOffers
            .Where(jo => jo.Status == JobOfferStatus.Active && 
                        jo.MinPerformanceScore <= avgPerformanceScore)
            .OrderByDescending(jo => jo.PostedDate)
            .Select(jo => new
            {
                jo.Id,
                jo.Title,
                jo.Description,
                jo.RequiredSkills,
                jo.MinYearsExperience,
                jo.MinPerformanceScore,
                jo.PostedDate,
                jo.ClosingDate,
                jo.Status,
                employeePerformanceScore = avgPerformanceScore
            })
            .ToListAsync();
            
        return Ok(offers);
    }

    [HttpGet("api/employee/applications")]
    public async Task<IActionResult> ApiGetMyApplications()
    {
        var userId = GetUserId();
        var apps = await _context.JobApplications
            .Include(a => a.JobOffer)
            .Where(a => a.ApplicantId == userId)
            .OrderByDescending(a => a.ApplicationDate)
            .ToListAsync();
        return Ok(apps);
    }

    [HttpGet("api/employee/reviews")]
    public async Task<IActionResult> ApiGetMyReviews()
    {
        var userId = GetUserId();
        var reviews = await _context.PerformanceReviews
            .Include(r => r.Reviewer)
            .Where(r => r.EmployeeId == userId)
            .OrderByDescending(r => r.ReviewDate)
            .ToListAsync();
        return Ok(reviews);
    }

    [HttpPost("api/employee/apply-to-job/{jobId}")]
    public async Task<IActionResult> ApiApplyToJob(int jobId, [FromBody] ApplyToJobRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null)
            return NotFound(new { message = "Usuario no encontrado" });

        var exists = await _context.JobApplications
            .AnyAsync(ja => ja.JobOfferId == jobId && ja.ApplicantId == user.Id);

        if (exists)
            return BadRequest(new { message = "Ya has aplicado a esta oferta" });

        var userWithData = await _context.Users
            .Include(u => u.ReviewsReceived)
            .Include(u => u.Achievements)
            .Include(u => u.Certificates)
            .FirstOrDefaultAsync(u => u.Id == user.Id);

        var jobOffer = await _context.JobOffers.FindAsync(jobId);
        if (jobOffer == null) 
            return NotFound(new { message = "Oferta no encontrada" });

        // Calcular match score
        var avgPerformance = userWithData!.ReviewsReceived.Any() 
            ? userWithData.ReviewsReceived.Average(r => r.OverallScore) 
            : 0;

        var yearsInCompany = (int)((DateTime.UtcNow - userWithData.HireDate).Days / 365.0);
        var matchScore = CalculateMatchScore(avgPerformance, yearsInCompany, 
            userWithData.Achievements.Count, userWithData.Certificates.Count, jobOffer);

        var application = new JobApplication
        {
            JobOfferId = jobId,
            ApplicantId = userWithData.Id,
            ApplicationDate = DateTime.UtcNow,
            Status = ApplicationStatus.Pending,
            MatchScore = matchScore
        };

        _context.JobApplications.Add(application);
        await _context.SaveChangesAsync();

        return Ok(new { 
            message = "Aplicación enviada exitosamente", 
            matchScore = matchScore,
            applicationId = application.Id 
        });
    }
}

public class UpdateProfileRequest
{
    public string? Email { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Position { get; set; }
    public string? Department { get; set; }
}

public class CreateObjectiveRequest
{
    public string? Email { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
    public DateTime? Deadline { get; set; }
}

public class CreateAchievementRequest
{
    public string? Email { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
    public DateTime? Date { get; set; }
    public int? ImpactScore { get; set; }
}

public class ApplyToJobRequest
{
    public string Email { get; set; } = string.Empty;
}
