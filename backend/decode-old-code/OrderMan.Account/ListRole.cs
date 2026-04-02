using System.Linq;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using OrderMan.Models;

namespace OrderMan.Account;

public class ListRole : Page
{
	protected Literal ErrorMessage;

	protected GridView grvRole;

	protected void Page_Load()
	{
	}

	public IQueryable<IdentityRole> grvRole_GetData()
	{
		ApplicationDbContext context = new ApplicationDbContext();
		RoleStore<IdentityRole> store = new RoleStore<IdentityRole>(context);
		RoleManager<IdentityRole> roleManager = new RoleManager<IdentityRole>(store);
		return roleManager.Roles;
	}

	public void grvRole_UpdateItem(string Id)
	{
		ApplicationDbContext context = new ApplicationDbContext();
		RoleStore<IdentityRole> store = new RoleStore<IdentityRole>(context);
		RoleManager<IdentityRole> roleManager = new RoleManager<IdentityRole>(store);
		IdentityRole identityRole = null;
		identityRole = roleManager.FindById(Id);
		if (identityRole == null)
		{
			base.ModelState.AddModelError("", $"Item with id {Id} was not found");
			return;
		}
		TryUpdateModel(identityRole);
		if (base.ModelState.IsValid)
		{
			roleManager.UpdateAsync(identityRole);
			DBConnect dBConnect = new DBConnect();
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "ListRole:UpdateAsync", StringEnum.GetStringValue(HanhDong.ChinhSua), Id, "ID: " + Id + "; Name:" + identityRole.Name);
			grvRole.DataBind();
		}
	}

	public void grvRole_DeleteItem(string Id)
	{
		ApplicationDbContext context = new ApplicationDbContext();
		RoleStore<IdentityRole> store = new RoleStore<IdentityRole>(context);
		RoleManager<IdentityRole> manager = new RoleManager<IdentityRole>(store);
		manager.Delete(manager.FindById(Id));
		DBConnect dBConnect = new DBConnect();
		dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "ListRole:Delete", StringEnum.GetStringValue(HanhDong.Xoa), Id, "ID: " + Id);
	}
}
