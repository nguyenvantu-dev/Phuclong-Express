using System;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;

namespace OrderMan;

public class DanhMucTyGia : Page
{
	protected Label lbLoi;

	protected GridView gvTyGia;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			LoadDanhSachTyGia();
		}
	}

	private void LoadDanhSachTyGia()
	{
		DBConnect dBConnect = new DBConnect();
		gvTyGia.DataSource = dBConnect.LayDanhSachTyGia();
		gvTyGia.DataBind();
	}

	protected void gvTyGia_RowEditing(object sender, GridViewEditEventArgs e)
	{
		try
		{
			gvTyGia.EditIndex = e.NewEditIndex;
			LoadDanhSachTyGia();
		}
		catch (Exception)
		{
		}
	}

	protected void gvTyGia_RowUpdating(object sender, GridViewUpdateEventArgs e)
	{
		try
		{
			TextBox textBox = gvTyGia.Rows[e.RowIndex].FindControl("tbgvTyGiaVND") as TextBox;
			TextBox textBox2 = gvTyGia.Rows[e.RowIndex].FindControl("tbgvCongShipVeVN") as TextBox;
			if (string.IsNullOrEmpty(textBox.Text.Trim()) || string.IsNullOrEmpty(textBox2.Text.Trim()))
			{
				lbLoi.Text = "Vui lòng điền đầy đủ thông tin bắt buộc!!!";
				return;
			}
			if (!double.TryParse(textBox.Text.Trim(), out var result))
			{
				lbLoi.Text = "Tỷ giá phải là kiểu số";
				return;
			}
			if (!double.TryParse(textBox2.Text.Trim(), out var result2))
			{
				lbLoi.Text = "Công ship về VN phải là kiểu số";
				return;
			}
			DBConnect dBConnect = new DBConnect();
			dBConnect.CapNhatTyGia(gvTyGia.DataKeys[e.RowIndex]["Name"].ToString(), result, result2);
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "DanhMucTyGia:CapNhatTyGia", StringEnum.GetStringValue(HanhDong.ChinhSua), gvTyGia.DataKeys[e.RowIndex]["Name"].ToString(), "Name: " + gvTyGia.DataKeys[e.RowIndex]["Name"].ToString() + "; TyGia: " + result + "; CongShipVeVN: " + result2);
			gvTyGia.EditIndex = -1;
			LoadDanhSachTyGia();
		}
		catch (Exception)
		{
		}
	}

	protected void gvTyGia_RowCancelingEdit(object sender, GridViewCancelEditEventArgs e)
	{
		gvTyGia.EditIndex = -1;
		LoadDanhSachTyGia();
	}
}
