# Stage 1: Restore & Build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["UserService.csproj", "./"]
RUN dotnet restore "UserService.csproj"

COPY . .
RUN dotnet build "UserService.csproj" -c Debug -o /app/publish --no-restore \
    /p:DebugType=portable /p:DebugSymbols=true

# Stage 2: Development (debug)
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS dev
WORKDIR /src

# COPY --from=build /app/publish .
COPY ["UserService.csproj", "./"]
RUN dotnet restore "UserService.csproj"

RUN apt-get update \
    && apt-get install -y procps unzip curl \
    && rm -rf /var/lib/apt/lists/*

RUN curl -sSL https://aka.ms/getvsdbgsh \
    | bash /dev/stdin -v latest -l /root/vsdbg

EXPOSE 8080
CMD ["dotnet", "watch", "run", "--no-hot-reload", "--project", "UserService.csproj", "--urls", "http://0.0.0.0:8080"]

# Stage 3: Production
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "UserService.dll"]
