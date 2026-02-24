# Stage 1: Build the application
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app
COPY . .
RUN dotnet restore "SearchService.csproj"
RUN dotnet publish -c Release -o out

# Stage 2: Development (debug)
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS dev
WORKDIR /app
COPY . .
RUN apt-get update \
    && apt-get install -y procps unzip curl \
    && rm -rf /var/lib/apt/lists/*
# Install vsdbg (optional but good for debugging)
RUN curl -sSL https://aka.ms/getvsdbgsh | bash /dev/stdin -v latest -l /root/vsdbg
ENV DOTNET_USE_POLLING_FILE_WATCHER=true
CMD ["dotnet", "watch", "run", "--no-hot-reload", "--project", "SearchService.csproj", "--urls", "http://0.0.0.0:8080"]

# Stage 3: Serve the application
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/out .
EXPOSE 80
ENTRYPOINT ["dotnet", "SearchService.dll"]