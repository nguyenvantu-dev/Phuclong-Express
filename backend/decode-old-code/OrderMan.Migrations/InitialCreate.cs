using System.CodeDom.Compiler;
using System.Data.Entity.Migrations;
using System.Data.Entity.Migrations.Builders;
using System.Data.Entity.Migrations.Infrastructure;
using System.Data.Entity.Migrations.Model;
using System.Resources;

namespace OrderMan.Migrations;

[GeneratedCode("EntityFramework.Migrations", "6.1.3-40302")]
public sealed class InitialCreate : DbMigration, IMigrationMetadata
{
	private readonly ResourceManager Resources = new ResourceManager(typeof(InitialCreate));

	string IMigrationMetadata.Id => "201505141418191_InitialCreate";

	string IMigrationMetadata.Source => null;

	string IMigrationMetadata.Target => Resources.GetString("Target");

	public override void Up()
	{
		CreateTable("dbo.AspNetRoles", (ColumnBuilder c) => new
		{
			Id = c.String(false, 128),
			Name = c.String(false, 256)
		}).PrimaryKey(t => t.Id).Index(t => t.Name, "RoleNameIndex", unique: true);
		CreateTable("dbo.AspNetUserRoles", (ColumnBuilder c) => new
		{
			UserId = c.String(false, 128),
			RoleId = c.String(false, 128)
		}).PrimaryKey(t => new { t.UserId, t.RoleId }).ForeignKey("dbo.AspNetRoles", t => t.RoleId, cascadeDelete: true).ForeignKey("dbo.AspNetUsers", t => t.UserId, cascadeDelete: true)
			.Index(t => t.UserId)
			.Index(t => t.RoleId);
		CreateTable("dbo.AspNetUsers", delegate(ColumnBuilder c)
		{
			ColumnModel id = c.String(false, 128);
			ColumnModel hoTen = c.String();
			ColumnModel diaChi = c.String();
			ColumnModel tinhThanh = c.String();
			ColumnModel soTaiKhoan = c.String();
			int? maxLength = 256;
			return new
			{
				Id = id,
				HoTen = hoTen,
				DiaChi = diaChi,
				TinhThanh = tinhThanh,
				SoTaiKhoan = soTaiKhoan,
				Email = c.String(null, maxLength),
				EmailConfirmed = c.Boolean(false),
				PasswordHash = c.String(),
				SecurityStamp = c.String(),
				PhoneNumber = c.String(),
				PhoneNumberConfirmed = c.Boolean(false),
				TwoFactorEnabled = c.Boolean(false),
				LockoutEndDateUtc = c.DateTime(),
				LockoutEnabled = c.Boolean(false),
				AccessFailedCount = c.Int(false),
				UserName = c.String(false, 256)
			};
		}).PrimaryKey(t => t.Id).Index(t => t.UserName, "UserNameIndex", unique: true);
		CreateTable("dbo.AspNetUserClaims", (ColumnBuilder c) => new
		{
			Id = c.Int(false, identity: true),
			UserId = c.String(false, 128),
			ClaimType = c.String(),
			ClaimValue = c.String()
		}).PrimaryKey(t => t.Id).ForeignKey("dbo.AspNetUsers", t => t.UserId, cascadeDelete: true).Index(t => t.UserId);
		CreateTable("dbo.AspNetUserLogins", (ColumnBuilder c) => new
		{
			LoginProvider = c.String(false, 128),
			ProviderKey = c.String(false, 128),
			UserId = c.String(false, 128)
		}).PrimaryKey(t => new { t.LoginProvider, t.ProviderKey, t.UserId }).ForeignKey("dbo.AspNetUsers", t => t.UserId, cascadeDelete: true).Index(t => t.UserId);
	}

	public override void Down()
	{
		DropForeignKey("dbo.AspNetUserRoles", "UserId", "dbo.AspNetUsers");
		DropForeignKey("dbo.AspNetUserLogins", "UserId", "dbo.AspNetUsers");
		DropForeignKey("dbo.AspNetUserClaims", "UserId", "dbo.AspNetUsers");
		DropForeignKey("dbo.AspNetUserRoles", "RoleId", "dbo.AspNetRoles");
		DropIndex("dbo.AspNetUserLogins", new string[1] { "UserId" });
		DropIndex("dbo.AspNetUserClaims", new string[1] { "UserId" });
		DropIndex("dbo.AspNetUsers", "UserNameIndex");
		DropIndex("dbo.AspNetUserRoles", new string[1] { "RoleId" });
		DropIndex("dbo.AspNetUserRoles", new string[1] { "UserId" });
		DropIndex("dbo.AspNetRoles", "RoleNameIndex");
		DropTable("dbo.AspNetUserLogins");
		DropTable("dbo.AspNetUserClaims");
		DropTable("dbo.AspNetUsers");
		DropTable("dbo.AspNetUserRoles");
		DropTable("dbo.AspNetRoles");
	}
}
