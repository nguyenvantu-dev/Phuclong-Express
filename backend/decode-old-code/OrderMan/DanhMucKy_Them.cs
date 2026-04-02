using System;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;

namespace OrderMan;

public class DanhMucKy_Them : Page
{
	protected Label lbLoi;

	protected TextBox tbNam;

	protected DropDownList ddThang;

	protected Button btCapNhat;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack && int.TryParse(Page.Request.QueryString["id"], out var _))
		{
			LoadDataKy();
		}
	}

	private void LoadDataKy()
	{
		BLL bLL = new BLL();
		Ky ky = bLL.LayKyByID(Convert.ToInt32(Page.Request.QueryString["id"]));
		try
		{
			ddThang.ClearSelection();
			ddThang.Items.FindByText(ky.Thang.ToString()).Selected = true;
		}
		catch
		{
		}
		tbNam.Text = ky.Nam.ToString();
	}

	protected void btCapNhat_Click(object sender, EventArgs e)
	{
		try
		{
			if (string.IsNullOrEmpty(tbNam.Text.Trim()))
			{
				lbLoi.Text = "Vui lòng nhập đủ thông tin";
				return;
			}
			if (!int.TryParse(tbNam.Text.Trim(), out var result))
			{
				lbLoi.Text = "Năm phải là kiểu số";
				return;
			}
			DBConnect dBConnect = new DBConnect();
			if (string.IsNullOrEmpty(Page.Request.QueryString["id"]))
			{
				switch (dBConnect.ThemKy(Convert.ToInt32(ddThang.SelectedValue), result))
				{
				case 0:
					dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "DanhMucKy_Them:ThemKy", StringEnum.GetStringValue(HanhDong.ThemMoi), "", "Năm: " + result + "Tháng: " + ddThang.SelectedValue);
					Page.Response.Redirect("/admin/DanhMucKy_LietKe.aspx");
					break;
				case 1:
					base.Response.Write("<script>alert('Đã có kỳ này rồi');</script>");
					break;
				case -1:
					base.Response.Write("<script>alert('Có lỗi trong quá trình thực hiện. Vui lòng thực hiện lại');</script>");
					break;
				}
				return;
			}
			switch (dBConnect.SuaKy(Convert.ToInt32(Page.Request.QueryString["id"]), Convert.ToInt32(ddThang.SelectedValue), result))
			{
			case 0:
				dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "DanhMucKy_Them:CapNhatKy", StringEnum.GetStringValue(HanhDong.ChinhSua), Page.Request.QueryString["id"], "KyID: " + Page.Request.QueryString["id"] + "Năm: " + result + "Tháng: " + ddThang.SelectedValue);
				Page.Response.Redirect("/admin/DanhMucKy_LietKe.aspx");
				break;
			case 1:
				base.Response.Write("<script>alert('Đã có kỳ này rồi');</script>");
				break;
			case 2:
				base.Response.Write("<script>alert('Kỳ đã phát sinh dữ liệu. Không thể chỉnh sửa');</script>");
				break;
			case -1:
				base.Response.Write("<script>alert('Có lỗi trong quá trình thực hiện. Vui lòng thực hiện lại');</script>");
				break;
			}
		}
		catch (Exception)
		{
		}
	}
}
