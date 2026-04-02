using System;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;

namespace OrderMan;

public class DanhMucTaiKhoanNganHang : Page
{
	protected Label lbLoi;

	protected TextBox tbTenTaiKhoanNganHang;

	protected TextBox tbGhiChu;

	protected Button btLuu;

	protected GridView gvTaiKhoanNganHang;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			LoadDanhSachTaiKhoanNganHang();
		}
	}

	private void LoadDanhSachTaiKhoanNganHang()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			gvTaiKhoanNganHang.DataSource = dBConnect.LayDanhSachTaiKhoanNganHang();
			gvTaiKhoanNganHang.DataBind();
		}
		catch
		{
		}
	}

	protected void gvTaiKhoanNganHang_RowEditing(object sender, GridViewEditEventArgs e)
	{
		try
		{
			gvTaiKhoanNganHang.EditIndex = e.NewEditIndex;
			LoadDanhSachTaiKhoanNganHang();
		}
		catch (Exception)
		{
		}
	}

	protected void gvTaiKhoanNganHang_RowUpdating(object sender, GridViewUpdateEventArgs e)
	{
		try
		{
			TextBox textBox = gvTaiKhoanNganHang.Rows[e.RowIndex].FindControl("tbgvTaiKhoanNganHangName") as TextBox;
			TextBox textBox2 = gvTaiKhoanNganHang.Rows[e.RowIndex].FindControl("tbgvGhiChu") as TextBox;
			if (string.IsNullOrEmpty(textBox.Text.Trim()))
			{
				lbLoi.Text = "Vui lòng điền đầy đủ thông tin bắt buộc!!!";
				return;
			}
			DBConnect dBConnect = new DBConnect();
			dBConnect.CapNhatTaiKhoanNganHang(Convert.ToInt32(gvTaiKhoanNganHang.DataKeys[e.RowIndex]["ID"]), textBox.Text.Trim(), textBox2.Text.Trim());
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "DanhMucTaiKhoanNganHang:CapNhatTaiKhoanNganHang", StringEnum.GetStringValue(HanhDong.ChinhSua), gvTaiKhoanNganHang.DataKeys[e.RowIndex]["ID"].ToString(), "TaiKhoanNganHangName: " + textBox.Text.ToString() + "; GhiChu: " + textBox2.Text.ToString());
			gvTaiKhoanNganHang.EditIndex = -1;
			LoadDanhSachTaiKhoanNganHang();
		}
		catch (Exception)
		{
		}
	}

	protected void gvTaiKhoanNganHang_RowCancelingEdit(object sender, GridViewCancelEditEventArgs e)
	{
		gvTaiKhoanNganHang.EditIndex = -1;
		LoadDanhSachTaiKhoanNganHang();
	}

	protected void btLuu_Click(object sender, EventArgs e)
	{
		if (string.IsNullOrEmpty(tbTenTaiKhoanNganHang.Text.Trim()))
		{
			lbLoi.Text = "Vui lòng nhập Tên thông tin";
			return;
		}
		DBConnect dBConnect = new DBConnect();
		dBConnect.ThemTaiKhoanNganHang(tbTenTaiKhoanNganHang.Text.Trim(), tbGhiChu.Text.Trim());
		dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "DanhMucTaiKhoanNganHang:ThemTaiKhoanNganHang", StringEnum.GetStringValue(HanhDong.ChinhSua), "", "TaiKhoanNganHangName: " + tbTenTaiKhoanNganHang.Text.ToString() + "; GhiChu: " + tbGhiChu.Text.ToString());
		LoadDanhSachTaiKhoanNganHang();
	}
}
