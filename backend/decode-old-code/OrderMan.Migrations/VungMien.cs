using System.CodeDom.Compiler;
using System.Data.Entity.Migrations;
using System.Data.Entity.Migrations.Builders;
using System.Data.Entity.Migrations.Infrastructure;
using System.Resources;

namespace OrderMan.Migrations;

[GeneratedCode("EntityFramework.Migrations", "6.1.3-40302")]
public sealed class VungMien : DbMigration, IMigrationMetadata
{
	private readonly ResourceManager Resources = new ResourceManager(typeof(VungMien));

	string IMigrationMetadata.Id => "202301120157205_VungMien";

	string IMigrationMetadata.Source => null;

	string IMigrationMetadata.Target => Resources.GetString("Target");

	public override void Up()
	{
		AddColumn("dbo.AspNetUsers", "VungMien", (ColumnBuilder c) => c.String());
	}

	public override void Down()
	{
		DropColumn("dbo.AspNetUsers", "VungMien");
	}
}
