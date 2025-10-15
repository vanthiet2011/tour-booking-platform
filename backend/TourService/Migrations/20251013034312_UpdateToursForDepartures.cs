using System;
using Microsoft.EntityFrameworkCore.Migrations;
using TourService.Models;

#nullable disable

namespace TourService.Migrations
{
    /// <inheritdoc />
    public partial class UpdateToursForDepartures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "PricePerAdult",
                table: "Tours",
                type: "numeric(18,2)",
                nullable: true);

            migrationBuilder.RenameColumn(
                name: "Price",
                table: "Tours",
                newName: "PricePerChild");

            migrationBuilder.Sql(
                @"UPDATE ""Tours"" SET ""PricePerAdult"" = ""PricePerChild"", ""PricePerChild"" = ""PricePerChild"" * 0.5;");

            migrationBuilder.AlterColumn<decimal>(
                name: "PricePerAdult",
                table: "Tours",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AlterColumn<Inclusions>(
                name: "Inclusions",
                table: "Tours",
                type: "jsonb",
                nullable: true,
                oldClrType: typeof(Inclusions),
                oldType: "jsonb");

            migrationBuilder.CreateTable(
                name: "TourDepartures",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TourId = table.Column<Guid>(type: "uuid", nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AvailableSlots = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TourDepartures", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TourDepartures_Tours_TourId",
                        column: x => x.TourId,
                        principalTable: "Tours",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.Sql(
                @"INSERT INTO ""TourDepartures"" (""Id"", ""TourId"", ""StartDate"", ""EndDate"", ""AvailableSlots"", ""CreatedAt"")
                SELECT gen_random_uuid(), ""Id"", '2025-12-01', '2025-12-08', ""Capacity"", NOW()
                FROM ""Tours"";");

            migrationBuilder.DropColumn(
                name: "Capacity",
                table: "Tours");

            migrationBuilder.CreateIndex(
                name: "IX_TourDepartures_TourId",
                table: "TourDepartures",
                column: "TourId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TourDepartures");

            migrationBuilder.DropColumn(
                name: "PricePerAdult",
                table: "Tours");

            migrationBuilder.RenameColumn(
                name: "PricePerChild",
                table: "Tours",
                newName: "Price");

            migrationBuilder.AlterColumn<Inclusions>(
                name: "Inclusions",
                table: "Tours",
                type: "jsonb",
                nullable: false,
                oldClrType: typeof(Inclusions),
                oldType: "jsonb",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Capacity",
                table: "Tours",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
