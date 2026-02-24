
using Serilog;
using Serilog.Exceptions;
using SearchService.Middleware;
using Elastic.Clients.Elasticsearch;
using SearchService.Services;
using SearchService.Kafka.Consumers;

var builder = WebApplication.CreateBuilder(args);

// Cấu hình Serilog
Log.Logger = new LoggerConfiguration()
    .Enrich.FromLogContext()
    .Enrich.WithExceptionDetails()
    .Enrich.WithMachineName()
    .Enrich.WithProperty("Application", "SearchService")
    .WriteTo.Console()
    .WriteTo.Http("http://logstash:5044", queueLimitBytes: null)
    .CreateLogger();

builder.Host.UseSerilog();

// Elasticsearch Configuration
var esUri = builder.Configuration["Elasticsearch:Uri"] ?? "http://localhost:9200";
var esSettings = new ElasticsearchClientSettings(new Uri(esUri))
    .DefaultIndex("tours");
var esClient = new ElasticsearchClient(esSettings);
builder.Services.AddSingleton(esClient);

builder.Services.AddScoped<ITourSearchService, TourSearchService>();

// Kafka Consumers (Hosted Services)
builder.Services.AddHostedService<TourEventsConsumer>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<CorrelationIdMiddleware>();

app.MapControllers();

app.Run();

