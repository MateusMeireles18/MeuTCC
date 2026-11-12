using Budget.Application;
using Budget.Domain;
using Budget.Infrastructure;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

// Porta configurável via variável de ambiente para deploy, com fallback local em 5042
var port = Environment.GetEnvironmentVariable("PORT") ?? "5042";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

builder.Services.AddControllers();

// Libera CORS para consumo pelo front-end (navegador e aplicativo móvel)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Documentação da API com Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Usa PostgreSQL quando houver connection string na nuvem e SQLite localmente
var rawConnection = Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? builder.Configuration.GetConnectionString("DefaultConnection");

var usePostgres = !string.IsNullOrWhiteSpace(rawConnection) &&
    (rawConnection.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
     rawConnection.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase) ||
     rawConnection.Contains("Host=", StringComparison.OrdinalIgnoreCase));

builder.Services.AddDbContext<BudgetsDbContext>(options =>
{
    if (usePostgres)
    {
        options.UseNpgsql(NormalizePostgresConnectionString(rawConnection!));
    }
    else
    {
        options.UseSqlite(rawConnection ?? "Data Source=budget.db");
    }
});

// Injeção de dependências
builder.Services.AddScoped<IBudgetRepository, BudgetRepository>();
builder.Services.AddScoped<IBudgetService, BudgetService>();

// Validação automática com FluentValidation
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<CreateBudgetRequestValidator>();

var app = builder.Build();

// Garante a criação das tabelas ou aplicação de migrations pendentes ao iniciar
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<BudgetsDbContext>();
    if (usePostgres)
    {
        db.Database.EnsureCreated();
    }
    else
    {
        db.Database.Migrate();
    }
}

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

app.Run();

static string NormalizePostgresConnectionString(string connectionString)
{
    if (!connectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) &&
        !connectionString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
    {
        return connectionString;
    }

    var uri = new Uri(connectionString);
    var userInfo = uri.UserInfo.Split(':', 2);

    var npgsqlBuilder = new NpgsqlConnectionStringBuilder
    {
        Host = uri.Host,
        Port = uri.Port > 0 ? uri.Port : 5432,
        Database = uri.AbsolutePath.TrimStart('/'),
        Username = Uri.UnescapeDataString(userInfo[0]),
        Password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : string.Empty,
        SslMode = uri.Query.Contains("sslmode=disable", StringComparison.OrdinalIgnoreCase)
            ? SslMode.Disable
            : SslMode.Require
    };

    return npgsqlBuilder.ConnectionString;
}
