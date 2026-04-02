using System;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;

namespace OrderMan;

public class EditOrder_NgayVeVN : Page
{
	protected Label lbLoi;

	protected TextBox tbNgayVeVN;

	protected CheckBox cbChuyenVeCompleted;

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
		if (string.IsNullOrEmpty(tbNgayVeVN.Text.Trim()))
		{
			lbLoi.Text = "Phải nhập ngày về VN";
			return;
		}
		DBConnect dBConnect = new DBConnect();
		if (dBConnect.CapNhatNgayVeVN(Page.Request.QueryString["id"], DateTimeUtil.getDatetimeFromStr(tbNgayVeVN.Text.Trim()), tbBoSungGhiChu.Text.Trim(), cbChuyenVeCompleted.Checked))
		{
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "EditOrder_NgayVeVN:CapNhatNgayVeVN", StringEnum.GetStringValue(HanhDong.ChinhSua), Page.Request.QueryString["id"], "ID: " + Page.Request.QueryString["id"] + "; NgayVeVN: " + tbNgayVeVN.Text.Trim() + "; BoSungGhiChu: " + tbBoSungGhiChu.Text.Trim());
			string text = Page.Request.QueryString["rt"];
			if (!string.IsNullOrEmpty(text) && text == "ch")
			{
				Page.Response.Redirect("/admin/CanHang.aspx");
			}
			else
			{
				Page.Response.Redirect("/admin/EditOrder.aspx");
			}
		}
		else
		{
			lbLoi.Text = "Có lỗi trong quá trình thao tác";
		}
	}
}
