using Budget.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using static Budget.Application.BudgetDTO;
// Alias para evitar conflito entre a entidade e o namespace Budget
using BudgetEntity = Budget.Domain.Budget;

namespace Budget.Application;

public class BudgetService : IBudgetService
{
    private readonly IBudgetRepository _repository;

    public BudgetService(IBudgetRepository repository)
    {
        _repository = repository;
    }

    public async Task<BudgetResponse> CreateAsync(CreateBudgetRequest request, CancellationToken ct = default)
    {
        var budget = BudgetEntity.Create(request.Title, request.Description, request.Amount);

        await _repository.AddAsync(budget, ct);
        return MapToResponse(budget);
    }

    public async Task<IEnumerable<BudgetResponse>> GetAllAsync(CancellationToken ct = default)
    {
        var budgets = await _repository.GetAllAsync(ct);
        return budgets.Select(MapToResponse);
    }

    public async Task<BudgetResponse?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var budget = await _repository.GetByIdAsync(id, ct);
        return budget is null ? null : MapToResponse(budget);
    }

    public async Task UpdateAsync(Guid id, UpdateBudgetRequest request, CancellationToken ct = default)
    {
        var budget = await _repository.GetByIdAsync(id, ct);
        if (budget is null)
            throw new KeyNotFoundException("Orçamento não encontrado.");

        budget.Update(request.Title, request.Description, request.Amount);

        await _repository.UpdateAsync(budget, ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        await _repository.DeleteAsync(id, ct);
    }

    private static BudgetResponse MapToResponse(BudgetEntity b) =>
        new(b.Id, b.Title, b.Description, b.Amount, b.CreatedAt, b.UpdateAt);
}