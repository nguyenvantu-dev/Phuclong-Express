using Microsoft.AspNet.Identity.EntityFramework;

namespace OrderMan.Models;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
	public ApplicationDbContext()
		: base("DefaultConnection")
	{
	}
}
