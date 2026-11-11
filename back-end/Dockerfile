# Etapa de build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY src/Budget.Domain/Budget.Domain.csproj src/Budget.Domain/
COPY src/Budget.Application/Budget.Application.csproj src/Budget.Application/
COPY src/Budget.Infrastructure/Budget.Infrastructure.csproj src/Budget.Infrastructure/
COPY src/Budget.Api/Budget.Api.csproj src/Budget.Api/

RUN dotnet restore src/Budget.Api/Budget.Api.csproj

COPY src/ src/
RUN dotnet publish src/Budget.Api/Budget.Api.csproj -c Release -o /app/publish --no-restore

# Etapa de execução
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

RUN mkdir -p /data

ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080

ENTRYPOINT ["dotnet", "Budget.Api.dll"]
