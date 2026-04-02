using System.CodeDom.Compiler;
using System.Data.Entity.Migrations;
using System.Data.Entity.Migrations.Builders;
using System.Data.Entity.Migrations.Infrastructure;
using System.Resources;

namespace OrderMan.Migrations;

[GeneratedCode("EntityFramework.Migrations", "6.1.3-40302")]
public sealed class LinkTaiKhoanMang : DbMigration, IMigrationMetadata
{
	private readonly ResourceManager Resources = new ResourceManager(typeof(LinkTaiKhoanMang));

	string IMigrationMetadata.Id => "202103020922147_LinkTaiKhoanMang";

	string IMigrationMetadata.Source => null;

	string IMigrationMetadata.Target => Resources.GetString("Target");

	public override void Up()
	{
		AddColumn("dbo.AspNetUsers", "LinkTaiKhoanMang", (ColumnBuilder c) => c.String());
	}

	public override void Down()
	{
		DropColumn("dbo.AspNetUsers", "LinkTaiKhoanMang");
	}
}
