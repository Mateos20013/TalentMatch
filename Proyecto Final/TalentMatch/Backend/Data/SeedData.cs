using Microsoft.AspNetCore.Identity;
using InternalTalentManagement.Models;

namespace InternalTalentManagement.Data;

public static class SeedData
{
    public static async Task Initialize(IServiceProvider serviceProvider,
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager)
    {
        // Create roles
        string[] roleNames = { "HR", "Supervisor", "Employee" };
        foreach (var roleName in roleNames)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new IdentityRole(roleName));
            }
        }

        // Create default HR user
        var hrEmail = "mateo@ntt.com";
        var hrUser = await userManager.FindByEmailAsync(hrEmail);

        if (hrUser == null)
        {
            hrUser = new ApplicationUser
            {
                UserName = hrEmail,
                Email = hrEmail,
                FirstName = "Mateo",
                LastName = "Admin",
                Department = "Human Resources",
                Position = "HR Manager",
                HireDate = DateTime.UtcNow,
                IsApproved = true,
                EmailConfirmed = true
            };

            var result = await userManager.CreateAsync(hrUser, "Mateo@123");
            
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(hrUser, "HR");
                await userManager.AddToRoleAsync(hrUser, "Supervisor"); // También agregar rol Supervisor
            }
        }

        // Create default Supervisor user
        var supEmail = "mateos20015@ntt.com";
        var supUser = await userManager.FindByEmailAsync(supEmail);

        if (supUser == null)
        {
            supUser = new ApplicationUser
            {
                UserName = supEmail,
                Email = supEmail,
                FirstName = "Mateo",
                LastName = "Supervisor",
                Department = "Management",
                Position = "Team Lead",
                HireDate = DateTime.UtcNow.AddYears(-3),
                IsApproved = true,
                EmailConfirmed = true
            };

            var supResult = await userManager.CreateAsync(supUser, "Mateo@123");
            
            if (supResult.Succeeded)
            {
                await userManager.AddToRoleAsync(supUser, "Supervisor");
            }
        }

        // Create default Employee user
        var empEmail = "mateos20013@ntt.com";
        var empUser = await userManager.FindByEmailAsync(empEmail);

        if (empUser == null)
        {
            empUser = new ApplicationUser
            {
                UserName = empEmail,
                Email = empEmail,
                FirstName = "Mateo",
                LastName = "Empleado",
                Department = "Engineering",
                Position = "Software Developer",
                HireDate = DateTime.UtcNow.AddYears(-2),
                IsApproved = true,
                EmailConfirmed = true
            };

            var empResult = await userManager.CreateAsync(empUser, "Mateo@123");
            
            if (empResult.Succeeded)
            {
                await userManager.AddToRoleAsync(empUser, "Employee");
            }
        }
    }
}
