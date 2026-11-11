using Budget.Application;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using static Budget.Application.BudgetDTO;

namespace Budget.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BudgetController : ControllerBase
{
    private readonly IBudgetService _budgetService;

    public BudgetController(IBudgetService budgetService)
    {
        _budgetService = budgetService;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBudgetRequest request, CancellationToken ct)
    {
        // A validação do payload é executada automaticamente pelo FluentValidation
        var response = await _budgetService.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BudgetResponse>>> GetAll(CancellationToken ct)
    {
        var budgets = await _budgetService.GetAllAsync(ct);
        return Ok(budgets);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<BudgetResponse>> GetById(Guid id, CancellationToken ct)
    {
        var budget = await _budgetService.GetByIdAsync(id, ct);

        if (budget is null)
            return NotFound(new { message = "Orçamento não encontrado." });

        return Ok(budget);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateBudgetRequest request, CancellationToken ct)
    {
        if (id != request.Id)
            return BadRequest(new { message = "O ID da rota não corresponde ao ID do corpo da requisição." });

        try
        {
            await _budgetService.UpdateAsync(id, request, ct);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _budgetService.DeleteAsync(id, ct);
        return NoContent();
    }
}