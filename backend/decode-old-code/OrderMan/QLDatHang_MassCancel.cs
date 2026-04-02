using System;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;

namespace OrderMan;

public class QLDatHang_MassCancel : Page
{
	protected Label lbLoi;

	protected TextBox tbGhiChu;

	protected Button btMassCancel;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			string text = Page.Request.QueryString["id"];
			if (string.IsNullOrEmpty(text))
			{
				Page.Response.Redirect("/admin/QLDatHang_LietKe.aspx");
			}
			else
			{
				lbLoi.Text = "Đang xử lý những ID " + text;
			}
		}
	}

	protected void btMassCancel_Click(object sender, EventArgs e)
	{
		DBConnect dBConnect = new DBConnect();
		if (dBConnect.MassCancel(Page.Request.QueryString["id"], tbGhiChu.Text.Trim(), base.User.Identity.GetUserName()))
		{
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "QLDatHang_MassCancel:MassCancel", StringEnum.GetStringValue(HanhDong.Xoa), Page.Request.QueryString["id"], "ID: " + Page.Request.QueryString["id"]);
			Page.Response.Redirect("/admin/QLDatHang_LietKe.aspx");
		}
		else
		{
			lbLoi.Text = "Có lỗi trong quá trình thao tác";
		}
	}
}
