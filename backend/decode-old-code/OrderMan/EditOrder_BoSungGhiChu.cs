using System;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;

namespace OrderMan;

public class EditOrder_BoSungGhiChu : Page
{
	protected Label lbLoi;

	protected TextBox tbBoSungGhiChu;

	protected Button btCapNhat;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			string text = Page.Request.QueryString["id"];
			if (string.IsNullOrEmpty(text))
			{
				Page.Response.Redirect("/admin/EditOrder.aspx");
			}
			else
			{
				lbLoi.Text = "Đang xử lý những ID " + text;
			}
		}
	}

	protected void btCapNhat_Click(object sender, EventArgs e)
	{
		DBConnect dBConnect = new DBConnect();
		if (dBConnect.BoSungGhiChu(Page.Request.QueryString["id"], tbBoSungGhiChu.Text.Trim()))
		{
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "EditOrder_BoSungGhiChu:btCapNhat_Click", StringEnum.GetStringValue(HanhDong.ChinhSua), Page.Request.QueryString["id"], "ID: " + Page.Request.QueryString["id"] + "; BoSungGhiChu: " + tbBoSungGhiChu.Text.Trim());
			Page.Response.Redirect("/admin/EditOrder.aspx");
		}
		else
		{
			lbLoi.Text = "Có lỗi trong quá trình thao tác";
		}
	}
}
