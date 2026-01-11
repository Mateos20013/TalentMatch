using InternalTalentManagement.Models;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;

namespace InternalTalentManagement.Services
{
    public class AuthenticationService : IAuthenticationService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        public AuthenticationService(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task<ApplicationUser?> AuthenticateUserAsync(string email, string password)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null) return null;
            var valid = await _userManager.CheckPasswordAsync(user, password);
            return valid ? user : null;
        }

        public async Task<bool> IsUserApprovedAsync(ApplicationUser user)
        {
            return user.IsApproved;
        }
    }
}
