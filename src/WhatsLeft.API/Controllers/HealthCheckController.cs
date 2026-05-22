using Microsoft.AspNetCore.Mvc;

namespace WhatsLeft.API.Controllers;

[ApiController]
[Route("health")]
public class HealthCheckController : ControllerBase
{
    private readonly ILogger<HealthCheckController> _logger;

    public HealthCheckController(ILogger<HealthCheckController> logger)
    {
        _logger = logger;
    }

    [HttpGet]
    public ActionResult<HealthCheckResponse> Get()
    {
        _logger.LogInformation("Health check requested");

        return Ok(new HealthCheckResponse
        {
            Status = "Healthy",
            Timestamp = DateTimeOffset.UtcNow
        });
    }
}

public class HealthCheckResponse
{
    public required string Status { get; set; }
    public required DateTimeOffset Timestamp { get; set; }
}