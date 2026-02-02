using System.ComponentModel.DataAnnotations;

namespace InternalTalentManagement.ViewModels;

public class LoginViewModel
{
    [Required(ErrorMessage = "El correo es requerido")]
    [EmailAddress(ErrorMessage = "Correo inválido")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es requerida")]
    [DataType(DataType.Password)]
    public string Password { get; set; } = string.Empty;

    [Display(Name = "Recordarme")]
    public bool RememberMe { get; set; }
}

public class RegisterViewModel
{
    [Required(ErrorMessage = "El nombre es requerido")]
    [Display(Name = "Nombre")]
    public string FirstName { get; set; } = string.Empty;

    [Required(ErrorMessage = "El apellido es requerido")]
    [Display(Name = "Apellido")]
    public string LastName { get; set; } = string.Empty;

    [Required(ErrorMessage = "El correo es requerido")]
    [EmailAddress(ErrorMessage = "Correo inválido")]
    [Display(Name = "Correo Electrónico")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es requerida")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "La contraseña debe tener al menos 6 caracteres")]
    [DataType(DataType.Password)]
    [Display(Name = "Contraseña")]
    public string Password { get; set; } = string.Empty;

    [Required]
    [DataType(DataType.Password)]
    [Compare("Password", ErrorMessage = "Las contraseñas no coinciden")]
    [Display(Name = "Confirmar Contraseña")]
    public string ConfirmPassword { get; set; } = string.Empty;

    [Display(Name = "Departamento")]
    public string? Department { get; set; }

    [Display(Name = "Posición")]
    public string? Position { get; set; }

    [Required]
    [Display(Name = "Fecha de Contratación")]
    [DataType(DataType.Date)]
    public DateTime HireDate { get; set; } = DateTime.UtcNow;
}
