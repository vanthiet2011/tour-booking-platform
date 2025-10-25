# Tầng 1: Build (Production)
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["ApiGateway.csproj", "."]
RUN dotnet restore "./ApiGateway.csproj"
COPY . .
RUN dotnet build "./ApiGateway.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "./ApiGateway.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ApiGateway.dll"]

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS dev
WORKDIR /src
COPY ["ApiGateway.csproj", "."]
RUN dotnet restore "./ApiGateway.csproj"
COPY . .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080 
ENTRYPOINT ["dotnet", "watch", "run", "--project", "./ApiGateway.csproj", "--no-launch-profile"]