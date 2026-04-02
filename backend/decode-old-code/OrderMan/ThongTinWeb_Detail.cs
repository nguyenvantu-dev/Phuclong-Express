using System;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;

namespace OrderMan;

public class ThongTinWeb_Detail : Page
{
	protected Label lbLoi;

	protected TextBox tbTenThongTin;

	protected TextBox tbNoiDungThongTin;

	protected Button btCapNhat;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack && int.TryParse(Page.Request.QueryString["id"], out var _))
		{
			LoadDataThongTinWeb();
		}
	}

	private void LoadDataThongTinWeb()
	{
		BLL bLL = new BLL();
		ThongTinWeb thongTinWeb = bLL.LayThongTinWebByID(Convert.ToInt32(Page.Request.QueryString["id"]));
		tbTenThongTin.Text = thongTinWeb.TenThongTin;
		tbNoiDungThongTin.Text = thongTinWeb.NoiDungThongTin;
	}

	protected void btCapNhat_Click(object sender, EventArgs e)
	{
		if (string.IsNullOrEmpty(tbTenThongTin.Text.Trim()))
		{
			lbLoi.Text = "Vui lòng nhập Tên thông tin";
			return;
		}
		DBConnect dBConnect = new DBConnect();
		if (string.IsNullOrEmpty(Page.Request.QueryString["id"]))
		{
			dBConnect.ThemThongTinWeb(tbTenThongTin.Text.Trim(), tbNoiDungThongTin.Text.Trim());
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "ThongTinWeb_Detail:ThemThongTinWeb", StringEnum.GetStringValue(HanhDong.ThemMoi), "", "TenThongTin: " + tbTenThongTin.Text.Trim() + "; NoiDungThongTin: " + tbNoiDungThongTin.Text.Trim());
		}
		else
		{
			dBConnect.CapNhatThongTinWeb(Convert.ToInt32(Page.Request.QueryString["id"]), tbTenThongTin.Text.Trim(), tbNoiDungThongTin.Text.Trim());
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "ThongTinWeb_Detail:CapNhatThongTinWeb", StringEnum.GetStringValue(HanhDong.ChinhSua), Page.Request.QueryString["id"], "ID: " + Page.Request.QueryString["id"] + "; TenThongTin: " + tbTenThongTin.Text.Trim() + "; NoiDungThongTin: " + tbNoiDungThongTin.Text.Trim());
		}
		Page.Response.Redirect("/admin/ThongTinWeb_LietKe.aspx");
	}
}
