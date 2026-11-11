using Microsoft.EntityFrameworkCore;

// Alias para evitar conflito com o namespace Budget
using BudgetEntity = Budget.Domain.Budget;

namespace Budget.Infrastructure;

public class BudgetsDbContext : DbContext
{
    public BudgetsDbContext(DbContextOptions<BudgetsDbContext> options) : base(options) { }

    public DbSet<BudgetEntity> Budgets => Set<BudgetEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<BudgetEntity>(builder =>
        {
            builder.HasKey(p => p.Id);
            builder.Property(p => p.Title);
            builder.Property(p => p.Amount);
        });
    }
}