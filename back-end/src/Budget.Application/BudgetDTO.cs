using System;
using System.Collections.Generic;
using System.Text;

namespace Budget.Application
{
    public class BudgetDTO
    {
        public record CreateBudgetRequest(string Title, string? Description, decimal Amount);

        public record UpdateBudgetRequest(Guid Id, string Title, string? Description, decimal Amount);

        public record BudgetResponse(Guid Id, string Title, string? Description, decimal Amount, DateTime CreatedAt, DateTime? UpdatedAt);
    }
}