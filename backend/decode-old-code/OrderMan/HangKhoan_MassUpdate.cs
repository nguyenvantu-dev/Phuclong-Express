using System;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;

namespace OrderMan;

public class HangKhoan_MassUpdate : Page
{
	protected Label lbLoi;

	protected TextBox tbOrderNumber;

	protected TextBox tbTotalCharged;

	protected TextBox tbTotalItem;

	protected Button btShare;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			string text = Page.Request.QueryString["id"];
			string text2 = Page.Request.QueryString["ws"];
			if (string.IsNullOrEmpty(text))
			{
				Page.Response.Redirect("/admin/HangKhoan_LietKe.aspx");
			}
			else
			{
				lbLoi.Text = "Đang xử lý những ID của Website " + text2 + " " + text;
			}
		}
	}

	protected void btShare_Click(object sender, EventArgs e)
	{
		if (string.IsNullOrEmpty(tbTotalCharged.Text.Trim()))
		{
			lbLoi.Text = "Phải nhập Total charged";
			return;
		}
		if (!double.TryParse(tbTotalCharged.Text.Trim(), out var result))
		{
			lbLoi.Text = "Total charged phải là kiểu số";
			return;
		}
		if (string.IsNullOrEmpty(tbTotalItem.Text.Trim()))
		{
			lbLoi.Text = "Phải nhập Total item";
			return;
		}
		if (!int.TryParse(tbTotalItem.Text.Trim(), out var result2))
		{
			lbLoi.Text = "Total item phải là kiểu số";
			return;
		}
		DBConnect dBConnect = new DBConnect();
		if (dBConnect.ShareOrdersHangKhoan(Page.Request.QueryString["id"], tbOrderNumber.Text.Trim(), result, result2, base.User.Identity.GetUserName()))
		{
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "HangKhoan_MassUpdate:ShareOrdersHangKhoan", StringEnum.GetStringValue(HanhDong.ChinhSua), Page.Request.QueryString["id"], "ID: " + Page.Request.QueryString["id"] + "; OrderNumber: " + tbOrderNumber.Text.Trim() + "; TotalCharged: " + result + "; TotalItem: " + result2);
			Page.Response.Redirect("/admin/HangKhoan_LietKe.aspx");
		}
		else
		{
			lbLoi.Text = "Có lỗi trong quá trình thao tác";
		}
	}
}
