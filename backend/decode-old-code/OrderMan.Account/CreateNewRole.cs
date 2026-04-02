using System;
using System.Linq;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using OrderMan.Models;

namespace OrderMan.Account;

public class CreateNewRole : Page
{
	protected Literal ErrorMessage;

	protected TextBox RoleName;

	protected void CreateRole_Click(object sender, EventArgs e)
	{
		try
		{
			ApplicationDbContext context = new ApplicationDbContext();
			RoleStore<IdentityRole> store = new RoleStore<IdentityRole>(context);
			RoleManager<IdentityRole> manager = new RoleManager<IdentityRole>(store);
			IdentityResult identityResult = manager.Create(new IdentityRole
			{
				Name = RoleName.Text.Trim()
			});
			if (identityResult.Succeeded)
			{
				DBConnect dBConnect = new DBConnect();
				dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "CreateNewRole", StringEnum.GetStringValue(HanhDong.ThemMoi), "", "RoleName: " + RoleName.Text.Trim());
				base.Response.Redirect("~/Admin/ListRole.aspx");
			}
			else
			{
				ErrorMessage.Text = identityResult.Errors.FirstOrDefault();
			}
		}
		catch
		{
		}
	}

	protected void Cancel_Click(object sender, EventArgs e)
	{
		base.Response.Redirect("~/Admin/ListRole.aspx");
	}
}
