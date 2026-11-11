using Budget.Domain;
using static Budget.Application.BudgetDTO;


namespace Budget.Application
{
    public interface IBudgetService
    {
        Task<BudgetResponse> CreateAsync(CreateBudgetRequest request, CancellationToken ct = default);
        Task<BudgetResponse?> GetByIdAsync(Guid id, CancellationToken ct = default);
        Task<IEnumerable<BudgetResponse>> GetAllAsync(CancellationToken ct = default);
        Task UpdateAsync(Guid id, UpdateBudgetRequest request, CancellationToken ct = default);
        Task DeleteAsync(Guid id, CancellationToken ct = default);
    }
}