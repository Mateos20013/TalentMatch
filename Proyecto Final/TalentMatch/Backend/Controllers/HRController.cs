using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using InternalTalentManagement.Data;
using InternalTalentManagement.Models;
using InternalTalentManagement.Services;

namespace InternalTalentManagement.Controllers;

// [Authorize(Roles = "HR")] // Comentado temporalmente para desarrollo
public class HRController : Controller
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IMatchingService _matchingService;

    public HRController(ApplicationDbContext context, UserManager<ApplicationUser> userManager, IMatchingService matchingService)
    {
        _context = context;
        _userManager = userManager;
        _matchingService = matchingService;
    }

    public async Task<IActionResult> Index()
    {
        var pendingUsers = await _context.Users.Where(u => !u.IsApproved).ToListAsync();
        var jobOffers = await _context.JobOffers.Where(jo => jo.Status == JobOfferStatus.Active).ToListAsync();
        ViewBag.PendingCount = pendingUsers.Count;
        ViewBag.ActiveJobsCount = jobOffers.Count;
        return View();
    }

    // Gestión de Usuarios Pendientes
    public async Task<IActionResult> PendingUsers()
    {
        var users = await _context.Users.Where(u => !u.IsApproved).OrderBy(u => u.Email).ToListAsync();
        return View(users);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ApproveUser(string userId, string role)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return NotFound();

        user.IsApproved = true;
        await _context.SaveChangesAsync();

        // Asignar rol
        var currentRoles = await _userManager.GetRolesAsync(user);
        if (currentRoles.Any())
            await _userManager.RemoveFromRolesAsync(user, currentRoles);
        
        await _userManager.AddToRoleAsync(user, role);
        
        TempData["Success"] = $"Usuario {user.Email} aprobado como {role}";
        return RedirectToAction(nameof(PendingUsers));
    }

    // Gestión de Ofertas de Trabajo
    public async Task<IActionResult> JobOffers()
    {
        var offers = await _context.JobOffers
            .Include(jo => jo.CreatedBy)
            .Include(jo => jo.Applications)
            .OrderByDescending(jo => jo.PostedDate)
            .ToListAsync();
        return View(offers);
    }

    [HttpGet]
    public IActionResult CreateJobOffer() => View();

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> CreateJobOffer(JobOffer model)
    {
        if (!ModelState.IsValid) return View(model);

        model.CreatedById = GetUserId();
        model.PostedDate = DateTime.UtcNow;
        model.Status = JobOfferStatus.Active;

        _context.JobOffers.Add(model);
        await _context.SaveChangesAsync();

        TempData["Success"] = "Oferta de trabajo creada exitosamente";
        return RedirectToAction(nameof(JobOffers));
    }

    // Candidatos Recomendados
    public async Task<IActionResult> RecommendedCandidates(int jobId)
    {
        var jobOffer = await _context.JobOffers.FindAsync(jobId);
        if (jobOffer == null) return NotFound();

        var candidates = await _matchingService.GetRecommendedCandidates(jobId);
        ViewBag.JobOffer = jobOffer;
        return View(candidates);
    }

    // Ver aplicaciones a una oferta
    public async Task<IActionResult> JobApplications(int jobId)
    {
        var applications = await _context.JobApplications
            .Include(ja => ja.Applicant)
            .Include(ja => ja.JobOffer)
            .Where(ja => ja.JobOfferId == jobId)
            .OrderByDescending(ja => ja.MatchScore)
            .ToListAsync();

        ViewBag.JobOffer = await _context.JobOffers.FindAsync(jobId);
        return View(applications);
    }

    [HttpPost]
    public async Task<IActionResult> UpdateApplicationStatus(int applicationId, ApplicationStatus status, string? notes)
    {
        var application = await _context.JobApplications.FindAsync(applicationId);
        if (application == null) return NotFound();

        application.Status = status;
        application.HRNotes = notes;
        await _context.SaveChangesAsync();

        return RedirectToAction(nameof(JobApplications), new { jobId = application.JobOfferId });
    }

    // API Endpoints para Angular
    [HttpGet("api/hr/pending-users")]
    public async Task<IActionResult> ApiGetPendingUsers()
    {
        Console.WriteLine("=== API GET PENDING USERS LLAMADO ===");
        
        var users = await _context.Users
            .Where(u => !u.IsApproved)
            .OrderBy(u => u.Email)
            .ToListAsync();
        
        Console.WriteLine($"Usuarios pendientes encontrados: {users.Count}");
        
        var result = users.Select(u => new
        {
            id = u.Id,
            email = u.Email,
            fullName = $"{u.FirstName} {u.LastName}",
            userName = u.UserName,
            position = u.Position,
            department = u.Department,
            yearsOfExperience = 0,
            isApproved = u.IsApproved,
            roles = new string[] { }
        }).ToList();
        
        Console.WriteLine($"Resultado serializado: {result.Count} usuarios");
        return Ok(result);
    }

    [HttpPost("api/hr/approve-user")]
    public async Task<IActionResult> ApiApproveUser([FromBody] ApproveUserRequest request)
    {
        var user = await _userManager.FindByIdAsync(request.UserId);
        if (user == null) return NotFound(new { message = "Usuario no encontrado" });

        user.IsApproved = true;
        await _context.SaveChangesAsync();

        // Asignar rol
        var currentRoles = await _userManager.GetRolesAsync(user);
        if (currentRoles.Any())
            await _userManager.RemoveFromRolesAsync(user, currentRoles);
        
        await _userManager.AddToRoleAsync(user, request.Role);

        return Ok(new { message = $"Usuario aprobado como {request.Role}" });
    }

    [HttpGet("api/hr/stats")]
    public async Task<IActionResult> ApiGetStats()
    {
        var pendingUsersCount = await _context.Users.CountAsync(u => !u.IsApproved);
        var openJobOffersCount = await _context.JobOffers.CountAsync(jo => jo.Status == JobOfferStatus.Active);
        var pendingApplicationsCount = await _context.JobApplications.CountAsync(ja => ja.Status == ApplicationStatus.Pending);

        return Ok(new
        {
            pendingUsersCount,
            openJobOffersCount,
            pendingApplicationsCount
        });
    }

    [HttpGet("api/hr/job-offers")]
    public async Task<IActionResult> ApiGetJobOffers()
    {
        var offers = await _context.JobOffers
            .Include(jo => jo.CreatedBy)
            .Include(jo => jo.Applications)
            .OrderByDescending(jo => jo.PostedDate)
            .Select(jo => new
            {
                id = jo.Id,
                title = jo.Title,
                description = jo.Description,
                requirements = jo.RequiredSkills,
                department = jo.Department,
                minYearsExperience = jo.MinYearsExperience,
                minPerformanceScore = jo.MinPerformanceScore,
                status = jo.Status.ToString(),
                postedDate = jo.PostedDate,
                closingDate = jo.ClosingDate,
                createdBy = new
                {
                    id = jo.CreatedBy.Id,
                    fullName = $"{jo.CreatedBy.FirstName} {jo.CreatedBy.LastName}"
                },
                applications = jo.Applications.Select(a => new
                {
                    id = a.Id,
                    applicantId = a.ApplicantId,
                    applicationDate = a.ApplicationDate,
                    status = a.Status.ToString(),
                    matchScore = a.MatchScore
                }).ToList()
            })
            .ToListAsync();

        return Ok(offers);
    }

    [HttpPost("api/hr/create-job-offer")]
    public async Task<IActionResult> ApiCreateJobOffer([FromBody] CreateJobOfferRequest request)
    {
        var creator = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.CreatedByEmail);
        if (creator == null)
            return NotFound(new { message = "Usuario creador no encontrado" });

        var jobOffer = new JobOffer
        {
            Title = request.Title,
            Description = request.Description,
            Department = request.Department,
            RequiredSkills = request.Requirements,
            MinYearsExperience = request.MinYearsExperience,
            MinPerformanceScore = request.MinPerformanceScore,
            CreatedById = creator.Id,
            PostedDate = DateTime.UtcNow,
            Status = JobOfferStatus.Active
        };

        _context.JobOffers.Add(jobOffer);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Oferta creada exitosamente", id = jobOffer.Id });
    }

    [HttpGet("api/hr/recommended-candidates/{jobId}")]
    public async Task<IActionResult> ApiGetRecommendedCandidates(int jobId)
    {
        var candidates = await _matchingService.GetRecommendedCandidates(jobId);
        return Ok(candidates);
    }

    [HttpGet("api/hr/job-applications/{jobId}")]
    public async Task<IActionResult> ApiGetJobApplications(int jobId)
    {
        var applications = await _context.JobApplications
            .Include(ja => ja.Applicant)
            .Include(ja => ja.JobOffer)
            .Where(ja => ja.JobOfferId == jobId)
            .OrderByDescending(ja => ja.MatchScore)
            .Select(ja => new
            {
                id = ja.Id,
                jobOfferId = ja.JobOfferId,
                applicantId = ja.ApplicantId,
                applicant = new
                {
                    id = ja.Applicant.Id,
                    fullName = $"{ja.Applicant.FirstName} {ja.Applicant.LastName}",
                    email = ja.Applicant.Email,
                    position = ja.Applicant.Position,
                    department = ja.Applicant.Department
                },
                applicationDate = ja.ApplicationDate,
                status = ja.Status.ToString(),
                matchScore = ja.MatchScore,
                hrNotes = ja.HRNotes
            })
            .ToListAsync();

        return Ok(applications);
    }

    [HttpPost("api/hr/update-application-status")]
    public async Task<IActionResult> ApiUpdateApplicationStatus([FromBody] UpdateApplicationStatusRequest request)
    {
        var application = await _context.JobApplications.FindAsync(request.ApplicationId);
        if (application == null) return NotFound(new { message = "Aplicación no encontrada" });

        if (Enum.TryParse<ApplicationStatus>(request.Status, out var status))
        {
            application.Status = status;
        }
        
        application.HRNotes = request.HrNotes;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Estado actualizado exitosamente" });
    }

    private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;
}

// Request DTOs
public class ApproveUserRequest
{
    public string UserId { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}

public class CreateJobOfferRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Requirements { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public int MinYearsExperience { get; set; }
    public decimal MinPerformanceScore { get; set; }
    public string CreatedByEmail { get; set; } = string.Empty;
}

public class UpdateApplicationStatusRequest
{
    public int ApplicationId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? HrNotes { get; set; }
}
