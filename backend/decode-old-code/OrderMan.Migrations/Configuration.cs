using System.Data.Entity.Migrations;
using OrderMan.Models;

namespace OrderMan.Migrations;

internal sealed class Configuration : DbMigrationsConfiguration<ApplicationDbContext>
{
	public Configuration()
	{
		base.AutomaticMigrationsEnabled = false;
		base.ContextKey = "OrderMan.Models.ApplicationDbContext";
	}

	protected override void Seed(ApplicationDbContext context)
	{
	}
}
