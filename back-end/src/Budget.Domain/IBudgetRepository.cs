using System;
using System.Threading.Tasks;
using System.Threading;
using System.Collections.Generic;

namespace Budget.Domain; 

public interface IBudgetRepository
{
	Task<Budget?> GetByIdAsync(Guid id, CancellationToken ct);
	Task<IEnumerable<Budget>> GetAllAsync(CancellationToken ct);
	Task AddAsync(Budget budget, CancellationToken ct);
	Task UpdateAsync(Budget budget, CancellationToken ct);
	Task DeleteAsync(Guid id, CancellationToken ct);
}