using InternalTalentManagement.Data;
using InternalTalentManagement.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace InternalTalentManagement.Services
{
    public class EmployeeRepository : IEmployeeRepository
    {
        private readonly ApplicationDbContext _context;
        public EmployeeRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ApplicationUser>> GetAllEmployeesAsync()
        {
            return await _context.Users.Where(u => u.IsApproved).ToListAsync();
        }

        public async Task<ApplicationUser?> GetEmployeeByIdAsync(string id)
        {
            return await _context.Users.FindAsync(id);
        }

        public async Task AddEmployeeAsync(ApplicationUser employee)
        {
            _context.Users.Add(employee);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateEmployeeAsync(ApplicationUser employee)
        {
            _context.Users.Update(employee);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteEmployeeAsync(string id)
        {
            var employee = await _context.Users.FindAsync(id);
            if (employee != null)
            {
                _context.Users.Remove(employee);
                await _context.SaveChangesAsync();
            }
        }
    }
}
