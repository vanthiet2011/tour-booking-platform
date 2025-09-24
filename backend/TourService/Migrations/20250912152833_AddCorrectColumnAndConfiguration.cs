using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TourService.Migrations
{
    /// <inheritdoc />
    public partial class AddCorrectColumnAndConfiguration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AvailableSeats",
                table: "Tours");

            migrationBuilder.DropColumn(
                name: "Capacity",
                table: "Tours");

            migrationBuilder.RenameColumn(
                name: "SeatsAvailable",
                table: "TourSchedules",
                newName: "Capacity");

            migrationBuilder.AddColumn<int>(
                name: "AvailableSeats",
                table: "TourSchedules",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AvailableSeats",
                table: "TourSchedules");

            migrationBuilder.RenameColumn(
                name: "Capacity",
                table: "TourSchedules",
                newName: "SeatsAvailable");

            migrationBuilder.AddColumn<int>(
                name: "AvailableSeats",
                table: "Tours",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Capacity",
                table: "Tours",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
