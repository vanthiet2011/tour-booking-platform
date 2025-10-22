using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UserService.Migrations
{
    /// <inheritdoc />
    public partial class AddCreatedAtToUserProfiles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "UpdateAt",
                table: "UserProfiles",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "CreateAt",
                table: "UserProfiles",
                newName: "CreatedAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "UserProfiles",
                newName: "UpdateAt");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "UserProfiles",
                newName: "CreateAt");
        }
    }
}
