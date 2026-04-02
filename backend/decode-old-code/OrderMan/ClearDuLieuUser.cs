using System;
using System.Linq;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;
using OrderMan.Models;

namespace OrderMan;

public class ClearDuLieuUser : Page
{
	protected DropDownList ddUserName;

	protected Button btClear;

	protected Label lbLoi;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			LoadDataUser();
		}
	}

	private void LoadDataUser()
	{
		try
		{
			UserManager userManager = new UserManager();
			ddUserName.DataSource = userManager.Users.OrderBy((ApplicationUser u) => u.UserName).ToList();
			ddUserName.DataBind();
		}
		catch
		{
		}
	}

	protected void btClear_Click(object sender, EventArgs e)
	{
		DBConnect dBConnect = new DBConnect();
		if (dBConnect.ClearDuLieuTheoUser(ddUserName.SelectedValue))
		{
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "ClearDuLieuUser:ClearDuLieuTheoUser", StringEnum.GetStringValue(HanhDong.Xoa), "", "UserName: " + ddUserName.SelectedValue);
			lbLoi.Text = "Đã clear dữ liệu thành công";
		}
		else
		{
			lbLoi.Text = "Có lỗi trong quá trình thao tác";
		}
	}
}
