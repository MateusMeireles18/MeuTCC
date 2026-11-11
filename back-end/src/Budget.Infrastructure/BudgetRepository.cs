using Budget.Domain;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using System.Xml.Linq;
// Alias para evitar conflito com o namespace Budget
using BudgetEntity = Budget.Domain.Budget;

namespace Budget.Infrastructure
{
    public class BudgetRepository : IBudgetRepository
    {
        private readonly BudgetsDbContext _context;

        public BudgetRepository(BudgetsDbContext context)
        {
            _context = context;
        }

        public async Task<BudgetEntity?> GetByIdAsync(Guid id, CancellationToken ct = default)
            => await _context.Budgets.FindAsync(new object[] { id }, ct);

        public async Task<IEnumerable<BudgetEntity>> GetAllAsync(CancellationToken ct = default)
            => await _context.Budgets.AsNoTracking().ToListAsync(ct);

        public async Task AddAsync(BudgetEntity budget, CancellationToken ct = default)
        {
            await _context.Budgets.AddAsync(budget, ct);
            await _context.SaveChangesAsync(ct);
        }

        public async Task UpdateAsync(BudgetEntity budget, CancellationToken ct = default)
        {
            _context.Budgets.Update(budget);
            await _context.SaveChangesAsync(ct);
        }

        public async Task DeleteAsync(Guid Id, CancellationToken ct = default)
        {
            var budget = await GetByIdAsync(Id, ct);
            if (budget != null)
            {
                _context.Budgets.Remove(budget);
                await _context.SaveChangesAsync(ct);
            }
        }
    }
}