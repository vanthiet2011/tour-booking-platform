using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using TourService.Models;

#nullable disable

namespace TourService.Migrations
{
    /// <inheritdoc />
    public partial class AddHighlightsToTours : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<List<string>>(
                name: "GalleryImages",
                table: "Tours",
                type: "jsonb",
                nullable: false,
                defaultValueSql: "'[]'");

            migrationBuilder.AddColumn<List<string>>(
                name: "Highlights",
                table: "Tours",
                type: "jsonb",
                nullable: false,
                defaultValueSql: "'[]'");

            migrationBuilder.AddColumn<Inclusions>(
                name: "Inclusions",
                table: "Tours",
                type: "jsonb",
                nullable: false,
                defaultValueSql: "'{\"Included\": [], \"NotIncluded\": []}'");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GalleryImages",
                table: "Tours");

            migrationBuilder.DropColumn(
                name: "Highlights",
                table: "Tours");

            migrationBuilder.DropColumn(
                name: "Inclusions",
                table: "Tours");
        }
    }
}
