using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TourService.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTourEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ScheduleId",
                table: "TourSchedules",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "TourId",
                table: "Tours",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "ReviewId",
                table: "Reviews",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "DestinationId",
                table: "Destinations",
                newName: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Id",
                table: "TourSchedules",
                newName: "ScheduleId");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "Tours",
                newName: "TourId");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "Reviews",
                newName: "ReviewId");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "Destinations",
                newName: "DestinationId");
        }
    }
}
