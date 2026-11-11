namespace Budget.Domain;

using System.Runtime.CompilerServices;

public class Budget
{
    public Guid Id { get; private set; }
    public string Description { get; private set; }
    public string Title { get; private set; }
    public decimal Amount { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdateAt { get; private set; }

    private Budget() { }

    public static Budget Create(string title, string? description, decimal amount)
    {
        // Validação dos campos obrigatórios da entidade
        if (string.IsNullOrWhiteSpace(title))
            throw new DomainException("O título é obrigatório");
        if (amount < 0)
            throw new DomainException("O valor precisa ser maior que 0");

        return new Budget
        {
            Id = Guid.NewGuid(),
            Title = title,
            Description = description,
            Amount = amount,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void Update(string title, string? description, decimal amount)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new DomainException("O título é obrigatório");
        if (amount < 0)
            throw new DomainException("O valor precisa ser maior que 0");

        // Atualiza os dados e registra o timestamp de alteração
        Title = title;
        Description = description;
        Amount = amount;
        UpdateAt = DateTime.UtcNow;
    }
}