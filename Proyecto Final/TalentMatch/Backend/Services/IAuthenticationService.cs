using InternalTalentManagement.Models;
using System.Threading.Tasks;

namespace InternalTalentManagement.Services
{
    public interface IAuthenticationService
    {
        Task<ApplicationUser?> AuthenticateUserAsync(string email, string password);
        Task<bool> IsUserApprovedAsync(ApplicationUser user);
    }
}
