using System;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;

namespace OrderMan;

public class Tracking_NgayLoHang : Page
{
	protected Label lbLoi;

	protected TextBox tbNgayLoHang;

	protected TextBox tbBoSungGhiChu;

	protected Button btCapNhat;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			string text = Page.Request.QueryString["id"];
			if (string.IsNullOrEmpty(text))
			{
				Page.Response.Redirect("/admin/Tracking_LietKe.aspx");
			}
			else
			{
				lbLoi.Text = "Đang xử lý những ID " + text;
			}
		}
	}

	protected void btCapNhat_Click(object sender, EventArgs e)
	{
		if (string.IsNullOrEmpty(tbNgayLoHang.Text.Trim()))
		{
			lbLoi.Text = "Phải nhập ngày lô hàng";
			return;
		}
		DBConnect dBConnect = new DBConnect();
		if (dBConnect.CapNhatNgayLoHang(Page.Request.QueryString["id"], DateTimeUtil.getDatetimeFromStr(tbNgayLoHang.Text.Trim()), tbBoSungGhiChu.Text.Trim()))
		{
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "Tracking_NgayLoHang:CapNhatNgayLoHang", StringEnum.GetStringValue(HanhDong.ChinhSua), "", "ID: " + Page.Request.QueryString["id"] + "; NgayLoHang: " + tbNgayLoHang.Text.Trim());
			Page.Response.Redirect("/admin/Tracking_LietKe.aspx");
		}
		else
		{
			lbLoi.Text = "Có lỗi trong quá trình thao tác";
		}
	}
}
