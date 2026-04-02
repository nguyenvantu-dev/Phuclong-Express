using System;
using System.Collections.Generic;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;

namespace OrderMan;

public class GiaTienCong_Them : Page
{
	protected Label lbLoi;

	protected DropDownList ddLoaiTien;

	protected TextBox tbTuGia;

	protected TextBox tbDenGia;

	protected TextBox tbTienCong1Mon;

	protected CheckBox cbTinhTheoPhanTram;

	protected CheckBox cbKhachBuon;

	protected Button btCapNhat;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			LoadDataTyGia();
			if (int.TryParse(Page.Request.QueryString["id"], out var _))
			{
				LoadDataGiaTienCong();
			}
		}
	}

	private void LoadDataTyGia()
	{
		try
		{
			BLL bLL = new BLL();
			List<TyGia> dataSource = bLL.LayDanhSachTyGia();
			ddLoaiTien.DataSource = dataSource;
			ddLoaiTien.DataBind();
		}
		catch
		{
		}
	}

	private void LoadDataGiaTienCong()
	{
		BLL bLL = new BLL();
		GiaTienCong giaTienCong = bLL.LayGiaTienCongByID(Convert.ToInt32(Page.Request.QueryString["id"]));
		try
		{
			ddLoaiTien.ClearSelection();
			ddLoaiTien.Items.FindByText(giaTienCong.LoaiTien).Selected = true;
		}
		catch
		{
		}
		tbTuGia.Text = giaTienCong.TuGia.ToString();
		tbDenGia.Text = giaTienCong.DenGia.ToString();
		tbTienCong1Mon.Text = giaTienCong.TienCong1Mon.ToString();
		cbTinhTheoPhanTram.Checked = giaTienCong.TinhTheoPhanTram;
		cbKhachBuon.Checked = giaTienCong.KhachBuon;
	}

	protected void btCapNhat_Click(object sender, EventArgs e)
	{
		try
		{
			if (string.IsNullOrEmpty(tbTuGia.Text.Trim()) || string.IsNullOrEmpty(tbDenGia.Text.Trim()) || string.IsNullOrEmpty(tbTienCong1Mon.Text.Trim()))
			{
				lbLoi.Text = "Vui lòng nhập đủ thông tin";
				return;
			}
			if (!double.TryParse(tbTuGia.Text.Trim(), out var result))
			{
				lbLoi.Text = "Từ giá phải là kiểu số";
				return;
			}
			if (!double.TryParse(tbDenGia.Text.Trim(), out var result2))
			{
				lbLoi.Text = "Đến giá phải là kiểu số";
				return;
			}
			if (!double.TryParse(tbTienCong1Mon.Text.Trim(), out var result3))
			{
				lbLoi.Text = "Tiền công 1 móns phải là kiểu số";
				return;
			}
			DBConnect dBConnect = new DBConnect();
			if (string.IsNullOrEmpty(Page.Request.QueryString["id"]))
			{
				dBConnect.ThemGiaTienCong(ddLoaiTien.SelectedItem.Text, result, result2, result3, cbTinhTheoPhanTram.Checked, cbKhachBuon.Checked);
				dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "GiaTienCong_Them:ThemGiaTienCong", StringEnum.GetStringValue(HanhDong.ThemMoi), "", "LoaiTien: " + ddLoaiTien.SelectedItem.Text + "; TuGia: " + result + "; dDenGia: " + ID.ToString() + "; TienCong1Mon: " + result3 + "; TinhTheoPhanTram: " + cbTinhTheoPhanTram.Checked + "; KhachBuon: " + cbKhachBuon.Checked);
			}
			else
			{
				dBConnect.CapNhatGiaTienCong(Convert.ToInt32(Page.Request.QueryString["id"]), ddLoaiTien.SelectedItem.Text, result, result2, result3, cbTinhTheoPhanTram.Checked, cbKhachBuon.Checked);
				dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "GiaTienCong_Them:CapNhatGiaTienCong", StringEnum.GetStringValue(HanhDong.ChinhSua), Page.Request.QueryString["id"], "ID: " + Page.Request.QueryString["id"] + "; LoaiTien: " + ddLoaiTien.SelectedItem.Text + "; TuGia: " + result + "; dDenGia: " + ID.ToString() + "; TienCong1Mon: " + result3 + "; TinhTheoPhanTram: " + cbTinhTheoPhanTram.Checked + "; KhachBuon: " + cbKhachBuon.Checked);
			}
			Page.Response.Redirect("/admin/GiaTienCong_LietKe.aspx");
		}
		catch (Exception)
		{
		}
	}
}
