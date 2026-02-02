using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using InternalTalentManagement.Models;
using InternalTalentManagement.ViewModels;

using InternalTalentManagement.Services;

namespace InternalTalentManagement.Controllers;

public class AccountController : Controller
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly ILogger<AccountController> _logger;
    private readonly IAuthenticationService _authService;

    public AccountController(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager, ILogger<AccountController> logger, IAuthenticationService authService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _logger = logger;
        _authService = authService;
    }

    [HttpGet]
    public IActionResult Login() => View();

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Login(LoginViewModel model)
    {
        if (!ModelState.IsValid) return View(model);

        var user = await _authService.AuthenticateUserAsync(model.Email, model.Password);
        if (user == null || !await _authService.IsUserApprovedAsync(user))
        {
            ModelState.AddModelError("", "Usuario no encontrado o no aprobado.");
            return View(model);
        }

        await _signInManager.SignInAsync(user, isPersistent: model.RememberMe);

        var roles = await _userManager.GetRolesAsync(user);
        var role = roles.FirstOrDefault() ?? "Employee";

        return role switch
        {
            "HR" => RedirectToAction("Index", "HR"),
            "Supervisor" => RedirectToAction("Index", "Supervisor"),
            _ => RedirectToAction("Index", "Employee")
        };
    }

    [HttpGet]
    public IActionResult Register() => View();

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Register(RegisterViewModel model)
    {
        if (!ModelState.IsValid) return View(model);

        var user = new ApplicationUser
        {
            UserName = model.Email,
            Email = model.Email,
            FirstName = model.FirstName,
            LastName = model.LastName,
            Department = model.Department,
            Position = model.Position,
            HireDate = model.HireDate,
            IsApproved = false
        };

        var result = await _userManager.CreateAsync(user, model.Password);
        if (!result.Succeeded)
        {
            foreach (var error in result.Errors)
                ModelState.AddModelError("", error.Description);
            return View(model);
        }

        await _userManager.AddToRoleAsync(user, "Employee");
        TempData["Success"] = "Registro exitoso. Tu cuenta está pendiente de aprobación.";
        return RedirectToAction("Login");
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Logout()
    {
        await _signInManager.SignOutAsync();
        return RedirectToAction("Login");
    }

    // API Endpoints para Angular
    [HttpPost("api/account/login")]
    public async Task<IActionResult> ApiLogin([FromBody] LoginViewModel model)
    {
        _logger.LogInformation("ApiLogin iniciado para email: {Email}", model?.Email);
        
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("ModelState inválido");
            return BadRequest(new { message = "Datos inválidos", errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)) });
        }

        var user = await _authService.AuthenticateUserAsync(model.Email, model.Password);
        if (user == null)
        {
            _logger.LogWarning("Usuario no encontrado: {Email}", model.Email);
            return Unauthorized(new { message = "Usuario no encontrado." });
        }

        _logger.LogInformation("Usuario encontrado: {UserId}, IsApproved: {IsApproved}", user.Id, user.IsApproved);

        if (!await _authService.IsUserApprovedAsync(user))
        {
            _logger.LogWarning("Usuario no aprobado: {Email}", model.Email);
            return Unauthorized(new { message = "Tu cuenta está pendiente de aprobación por HR." });
        }

        // Iniciar sesión con cookies
        await _signInManager.SignInAsync(user, isPersistent: true);

        var roles = await _userManager.GetRolesAsync(user);
        var role = roles.FirstOrDefault() ?? "Employee";

        _logger.LogInformation("Login exitoso para: {Email}, Rol: {Role}", model.Email, role);

        return Ok(new
        {
            user = new
            {
                id = user.Id,
                email = user.Email,
                fullName = $"{user.FirstName} {user.LastName}",
                roles = roles.ToArray(),
                isApproved = user.IsApproved
            },
            role = role
        });
    }

    [HttpPost("api/account/register")]
    public async Task<IActionResult> ApiRegister([FromBody] RegisterViewModel model)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { message = "Datos inválidos", errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)) });

        var user = new ApplicationUser
        {
            UserName = model.Email,
            Email = model.Email,
            FirstName = model.FirstName,
            LastName = model.LastName,
            Department = model.Department,
            Position = model.Position,
            HireDate = model.HireDate,
            IsApproved = false
        };

        var result = await _userManager.CreateAsync(user, model.Password);
        if (!result.Succeeded)
            return BadRequest(new { message = "Error al registrar usuario", errors = result.Errors.Select(e => e.Description) });

        await _userManager.AddToRoleAsync(user, "Employee");
        
        return Ok(new { message = "Registro exitoso. Tu cuenta está pendiente de aprobación por HR." });
    }

    [HttpPost("api/account/logout")]
    public async Task<IActionResult> ApiLogout()
    {
        await _signInManager.SignOutAsync();
        return Ok(new { message = "Sesión cerrada exitosamente." });
    }

    private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;
}
