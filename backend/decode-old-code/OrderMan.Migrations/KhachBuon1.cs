using System.CodeDom.Compiler;
using System.Data.Entity.Migrations;
using System.Data.Entity.Migrations.Builders;
using System.Data.Entity.Migrations.Infrastructure;
using System.Resources;

namespace OrderMan.Migrations;

[GeneratedCode("EntityFramework.Migrations", "6.1.3-40302")]
public sealed class KhachBuon1 : DbMigration, IMigrationMetadata
{
	private readonly ResourceManager Resources = new ResourceManager(typeof(KhachBuon1));

	string IMigrationMetadata.Id => "201701180503315_KhachBuon1";

	string IMigrationMetadata.Source => null;

	string IMigrationMetadata.Target => Resources.GetString("Target");

	public override void Up()
	{
		AddColumn("dbo.AspNetUsers", "KhachBuon", (ColumnBuilder c) => c.Boolean(false));
	}

	public override void Down()
	{
		DropColumn("dbo.AspNetUsers", "KhachBuon");
	}
}
