using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;

namespace OrderMan.Models;

public class UserManager : UserManager<ApplicationUser>
{
	public UserManager()
		: base((IUserStore<ApplicationUser>)new UserStore<ApplicationUser>(new ApplicationDbContext()))
	{
	}
}
