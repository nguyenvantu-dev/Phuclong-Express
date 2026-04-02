using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using OrderMan.Models;

namespace OrderMan.Account;

public class UserDetail : Page
{
	protected Literal ErrorMessage;

	protected Label lbUserName;

	protected DropDownList ddRole;

	protected Button btAddRole;

	protected GridView gvRoleForUser;

	protected TextBox Password;

	protected TextBox ConfirmPassword;

	protected Button btResetMatKhau;

	protected void Page_Load()
	{
		if (!base.IsPostBack)
		{
			string value = Page.Request.QueryString["userid"];
			if (string.IsNullOrEmpty(value))
			{
				Page.Response.Redirect("/Admin/ListUser.aspx");
				return;
			}
			UserManager manager = new UserManager();
			lbUserName.Text = manager.FindById(Page.Request.QueryString["userid"]).UserName;
			LoadRoleForUser();
		}
	}

	private void LoadRoleForUser()
	{
		DataTable dataTable = new DataTable();
		dataTable.Columns.Add(new DataColumn("Name", Type.GetType("System.String")));
		UserManager manager = new UserManager();
		IList<string> roles = manager.GetRoles(Page.Request.QueryString["userid"]);
		foreach (string item in roles)
		{
			DataRow dataRow = dataTable.NewRow();
			dataRow["Name"] = item;
			dataTable.Rows.Add(dataRow);
		}
		gvRoleForUser.DataSource = dataTable;
		gvRoleForUser.DataBind();
	}

	public IQueryable<IdentityRole> ddRole_GetData()
	{
		UserManager manager = new UserManager();
		IList<string> userRoles = manager.GetRoles(Page.Request.QueryString["userid"]);
		ApplicationDbContext context = new ApplicationDbContext();
		RoleStore<IdentityRole> store = new RoleStore<IdentityRole>(context);
		RoleManager<IdentityRole> roleManager = new RoleManager<IdentityRole>(store);
		return roleManager.Roles.Where((IdentityRole c) => !userRoles.Any((string d) => d == c.Name));
	}

	protected void gvRoleForUser_RowDeleting(object sender, GridViewDeleteEventArgs e)
	{
		UserManager manager = new UserManager();
		manager.RemoveFromRole(Page.Request.QueryString["userid"], gvRoleForUser.DataKeys[e.RowIndex]["Name"].ToString());
		DBConnect dBConnect = new DBConnect();
		dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "UserDetail:DeleteRole", StringEnum.GetStringValue(HanhDong.Xoa), "", "UserID: " + Page.Request.QueryString["userid"] + "; Role: " + gvRoleForUser.DataKeys[e.RowIndex]["Name"].ToString());
		LoadRoleForUser();
		ddRole.DataBind();
	}

	protected void btAddRole_Click(object sender, EventArgs e)
	{
		UserManager manager = new UserManager();
		manager.AddToRole(Page.Request.QueryString["userid"], ddRole.SelectedItem.Text);
		DBConnect dBConnect = new DBConnect();
		dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "UserDetail:AddToRole", StringEnum.GetStringValue(HanhDong.ThemMoi), "", "UserID: " + Page.Request.QueryString["userid"] + "; Role: " + ddRole.SelectedItem.Text);
		LoadRoleForUser();
		ddRole.DataBind();
	}

	protected void btResetMatKhau_Click(object sender, EventArgs e)
	{
		UserManager manager = new UserManager();
		string userId = Page.Request.QueryString["userid"];
		manager.RemovePassword(userId);
		manager.AddPassword(userId, Password.Text.Trim());
		ErrorMessage.Text = "Đã Reset thành công!!";
		Password.Text = "";
		ConfirmPassword.Text = "";
	}
}
