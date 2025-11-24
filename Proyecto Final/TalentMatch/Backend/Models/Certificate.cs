namespace InternalTalentManagement.Models;

public class Certificate
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string IssuingOrganization { get; set; } = string.Empty;
    public DateTime IssueDate { get; set; }
    public DateTime? ExpirationDate { get; set; }
    public string? CredentialId { get; set; }
    public string? FileUrl { get; set; } // Para guardar ruta del archivo adjunto
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Property
    public ApplicationUser User { get; set; } = null!;
}
