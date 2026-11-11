using FluentValidation;
using static Budget.Application.BudgetDTO;


namespace Budget.Application;

public class CreateBudgetRequestValidator : AbstractValidator<CreateBudgetRequest>
{
    public CreateBudgetRequestValidator()
    {
        RuleFor(u => u.Title)
            .NotEmpty().WithMessage("O título deve ser preenchido.");

        RuleFor(u => u.Amount)
            .GreaterThanOrEqualTo(0).WithMessage("O valor não pode ser negativo.");
    }
}

public class UpdateBudgetRequestValidator : AbstractValidator<UpdateBudgetRequest>
{
    public UpdateBudgetRequestValidator()
    {
        RuleFor(u => u.Title)
            .NotEmpty().WithMessage("O título é obrigatório.");

        RuleFor(u => u.Amount)
            .GreaterThanOrEqualTo(0).WithMessage("O valor não pode ser negativo.");
    }
}