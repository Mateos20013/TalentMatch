using InternalTalentManagement.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace InternalTalentManagement.Services
{
    public interface IEmployeeRepository
    {
        Task<IEnumerable<ApplicationUser>> GetAllEmployeesAsync();
        Task<ApplicationUser?> GetEmployeeByIdAsync(string id);
        Task AddEmployeeAsync(ApplicationUser employee);
        Task UpdateEmployeeAsync(ApplicationUser employee);
        Task DeleteEmployeeAsync(string id);
    }
}
