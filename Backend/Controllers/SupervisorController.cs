using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using InternalTalentManagement.Data;
using InternalTalentManagement.Models;

namespace InternalTalentManagement.Controllers;

//[Authorize(Roles = "Supervisor,HR")]
public class SupervisorController : Controller
{
    private readonly ApplicationDbContext _context;

    public SupervisorController(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IActionResult> Index()
    {
        var employees = await _context.Users
            .Where(u => u.IsApproved && u.Id != GetUserId())
            .Include(u => u.Objectives)
            .Include(u => u.ReviewsReceived)
            .ToListAsync();

        return View(employees);
    }

    // Ver perfil de empleado
    public async Task<IActionResult> EmployeeProfile(string id)
    {
        var employee = await _context.Users
            .Include(u => u.Objectives).ThenInclude(o => o.ProgressUpdates)
            .Include(u => u.Achievements)
            .Include(u => u.Certificates)
            .Include(u => u.ReviewsReceived)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (employee == null) return NotFound();
        return View(employee);
    }

    // Crear evaluación de desempeño
    [HttpGet]
    public async Task<IActionResult> CreateReview(string employeeId)
    {
        var employee = await _context.Users.FindAsync(employeeId);
        if (employee == null) return NotFound();

        ViewBag.Employee = employee;
        return View();
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> CreateReview(PerformanceReview model)
    {
        if (!ModelState.IsValid)
        {
            var employee = await _context.Users.FindAsync(model.EmployeeId);
            ViewBag.Employee = employee;
            return View(model);
        }

        model.ReviewerId = GetUserId();
        model.ReviewDate = DateTime.UtcNow;
        model.OverallScore = (model.TechnicalSkillsRating + model.TeamworkRating + 
            model.LeadershipRating + model.CommunicationRating + 
            model.InitiativeRating + model.ProductivityRating) / 6.0m;

        _context.PerformanceReviews.Add(model);
        await _context.SaveChangesAsync();

        TempData["Success"] = "Evaluación de desempeño creada exitosamente";
        return RedirectToAction(nameof(EmployeeProfile), new { id = model.EmployeeId });
    }

    // Comentar progreso de objetivo
    [HttpPost]
    public async Task<IActionResult> CommentObjectiveProgress(int objectiveId, string notes, int progress)
    {
        var objective = await _context.Objectives.FindAsync(objectiveId);
        if (objective == null) return NotFound();

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

        return RedirectToAction(nameof(EmployeeProfile), new { id = objective.UserId });
    }

    private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    // API Endpoints
    [HttpGet("api/supervisor/employees")]
    public async Task<IActionResult> ApiGetEmployees()
    {
        Console.WriteLine("=== API GET EMPLOYEES LLAMADO ===");
        
        // Get all user IDs with Employee role
        var employeeRoleId = await _context.Roles
            .Where(r => r.Name == "Employee")
            .Select(r => r.Id)
            .FirstOrDefaultAsync();

        Console.WriteLine($"Employee Role ID: {employeeRoleId}");

        if (employeeRoleId == null)
        {
            Console.WriteLine("No se encontró el rol Employee");
            return Ok(new List<object>());
        }

        var employeeIds = await _context.UserRoles
            .Where(ur => ur.RoleId == employeeRoleId)
            .Select(ur => ur.UserId)
            .ToListAsync();

        Console.WriteLine($"Employee IDs encontrados: {employeeIds.Count}");
        foreach (var id in employeeIds)
        {
            Console.WriteLine($"  - {id}");
        }

        var employees = await _context.Users
            .Where(u => u.IsApproved && employeeIds.Contains(u.Id))
            .OrderBy(u => u.FirstName)
            .Select(u => new
            {
                id = u.Id,
                email = u.Email,
                firstName = u.FirstName,
                lastName = u.LastName,
                fullName = u.FirstName + " " + u.LastName,
                position = u.Position,
                department = u.Department
            })
            .ToListAsync();

        Console.WriteLine($"Empleados retornados: {employees.Count}");
        return Ok(employees);
    }

    [HttpPost("api/supervisor/create-review")]
    public async Task<IActionResult> ApiCreateReview([FromBody] CreateReviewRequest request)
    {
        var reviewer = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.ReviewerEmail);
        if (reviewer == null) return NotFound(new { message = "Reviewer not found" });

        var overallScore = (request.TechnicalSkills + request.Communication + request.Teamwork + 
            request.ProblemSolving + request.Productivity + request.Leadership) / 6.0m;

        var review = new PerformanceReview
        {
            EmployeeId = request.EmployeeId ?? "",
            ReviewerId = reviewer.Id,
            ReviewDate = DateTime.UtcNow,
            TechnicalSkillsRating = request.TechnicalSkills,
            CommunicationRating = request.Communication,
            TeamworkRating = request.Teamwork,
            InitiativeRating = request.ProblemSolving,
            ProductivityRating = request.Productivity,
            LeadershipRating = request.Leadership,
            SupervisorComments = request.Comments ?? "",
            OverallScore = overallScore
        };

        _context.PerformanceReviews.Add(review);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            id = review.Id,
            employeeId = review.EmployeeId,
            reviewDate = review.ReviewDate,
            overallScore = review.OverallScore
        });
    }

    [HttpGet("api/supervisor/my-reviews")]
    public async Task<IActionResult> ApiGetMyReviews([FromQuery] string email)
    {
        var supervisor = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (supervisor == null) return NotFound(new { message = "Supervisor not found" });

        var reviews = await _context.PerformanceReviews
            .Include(r => r.Employee)
            .Where(r => r.ReviewerId == supervisor.Id)
            .OrderByDescending(r => r.ReviewDate)
            .Select(r => new
            {
                id = r.Id,
                employeeId = r.EmployeeId,
                employeeName = r.Employee.FirstName + " " + r.Employee.LastName,
                employeeEmail = r.Employee.Email,
                reviewDate = r.ReviewDate,
                overallScore = r.OverallScore,
                technicalSkills = r.TechnicalSkillsRating,
                communication = r.CommunicationRating,
                teamwork = r.TeamworkRating,
                problemSolving = r.InitiativeRating,
                productivity = r.ProductivityRating,
                leadership = r.LeadershipRating,
                comments = r.SupervisorComments
            })
            .ToListAsync();

        return Ok(reviews);
    }

    [HttpGet("api/supervisor/employee-objectives")]
    public async Task<IActionResult> ApiGetEmployeeObjectives()
    {
        var objectives = await _context.Objectives
            .Include(o => o.User)
            .Include(o => o.ProgressUpdates)
            .Where(o => o.User.IsApproved)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new
            {
                id = o.Id,
                title = o.Title,
                description = o.Description,
                status = o.Status.ToString(),
                targetDate = o.TargetDate,
                completionPercentage = o.CompletionPercentage,
                employeeId = o.UserId,
                employeeName = o.User.FirstName + " " + o.User.LastName,
                employeeEmail = o.User.Email,
                createdAt = o.CreatedAt,
                progressCount = o.ProgressUpdates.Count,
                lastProgress = o.ProgressUpdates.OrderByDescending(p => p.UpdatedAt).FirstOrDefault()
            })
            .ToListAsync();

        return Ok(objectives);
    }

    [HttpPost("api/supervisor/comment-objective")]
    public async Task<IActionResult> ApiCommentObjective([FromBody] CommentObjectiveRequest request)
    {
        var objective = await _context.Objectives
            .Include(o => o.ProgressUpdates)
            .FirstOrDefaultAsync(o => o.Id == request.ObjectiveId);

        if (objective == null)
            return NotFound(new { message = "Objetivo no encontrado" });

        var supervisor = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.SupervisorEmail);
        if (supervisor == null)
            return NotFound(new { message = "Supervisor no encontrado" });

        var progress = new ObjectiveProgress
        {
            ObjectiveId = objective.Id,
            UpdatedAt = DateTime.UtcNow,
            Notes = request.Comment ?? "",
            ProgressPercentage = request.CompletionPercentage ?? 0,
            UpdatedBy = request.SupervisorEmail
        };

        _context.ObjectiveProgresses.Add(progress);

        // Actualizar porcentaje y status del objetivo si está completo
        objective.CompletionPercentage = request.CompletionPercentage ?? 0;
        if (request.CompletionPercentage >= 100)
        {
            objective.Status = ObjectiveStatus.Completed;
            objective.CompletionPercentage = 100;
        }
        else if (objective.Status == ObjectiveStatus.NotStarted)
        {
            objective.Status = ObjectiveStatus.InProgress;
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Comentario agregado exitosamente",
            progressId = progress.Id,
            objectiveStatus = objective.Status.ToString()
        });
    }
}

public class CommentObjectiveRequest
{
    public int ObjectiveId { get; set; }
    public string SupervisorEmail { get; set; } = string.Empty;
    public string? Comment { get; set; }
    public int? CompletionPercentage { get; set; }
}

public class CreateReviewRequest
{
    public string? ReviewerEmail { get; set; }
    public string? EmployeeId { get; set; }
    public int TechnicalSkills { get; set; }
    public int Communication { get; set; }
    public int Teamwork { get; set; }
    public int ProblemSolving { get; set; }
    public int Productivity { get; set; }
    public int Leadership { get; set; }
    public string? Comments { get; set; }
}
