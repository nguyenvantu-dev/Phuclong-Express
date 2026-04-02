using System;
using System.Collections.Generic;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;

namespace OrderMan;

public class CongShipVeVN_Them : Page
{
	protected Label lbLoi;

	protected DropDownList ddLoaiHang;

	protected DropDownList ddLoaiTien;

	protected TextBox tbTienCongShipVeVN;

	protected CheckBox cbKhachBuon;

	protected Button btCapNhat;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			LoadDataLoaiHang();
			LoadDataTyGia();
			if (int.TryParse(Page.Request.QueryString["id"], out var _))
			{
				LoadDataCongShipVeVN();
			}
		}
	}

	private void LoadDataLoaiHang()
	{
		try
		{
			BLL bLL = new BLL();
			ddLoaiHang.DataSource = bLL.LayDanhSachLoaiHang();
			ddLoaiHang.DataBind();
		}
		catch
		{
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

	private void LoadDataCongShipVeVN()
	{
		BLL bLL = new BLL();
		CongShipVeVN congShipVeVN = bLL.LayCongShipVeVNByID(Convert.ToInt32(Page.Request.QueryString["id"]));
		try
		{
			ddLoaiHang.ClearSelection();
			ddLoaiHang.Items.FindByText(congShipVeVN.LoaiHangID.ToString()).Selected = true;
		}
		catch
		{
		}
		try
		{
			ddLoaiTien.ClearSelection();
			ddLoaiTien.Items.FindByText(congShipVeVN.LoaiTien).Selected = true;
		}
		catch
		{
		}
		tbTienCongShipVeVN.Text = congShipVeVN.TienCongShipVeVN.ToString();
		cbKhachBuon.Checked = congShipVeVN.KhachBuon;
	}

	protected void btCapNhat_Click(object sender, EventArgs e)
	{
		try
		{
			if (string.IsNullOrEmpty(tbTienCongShipVeVN.Text.Trim()))
			{
				lbLoi.Text = "Vui lòng nhập đủ thông tin";
				return;
			}
			if (!double.TryParse(tbTienCongShipVeVN.Text.Trim(), out var result))
			{
				lbLoi.Text = "Tiền công ship về VN phải là kiểu số";
				return;
			}
			DBConnect dBConnect = new DBConnect();
			if (string.IsNullOrEmpty(Page.Request.QueryString["id"]))
			{
				dBConnect.ThemCongShipVeVN(Convert.ToInt32(ddLoaiHang.SelectedValue), ddLoaiTien.SelectedItem.Text, result, cbKhachBuon.Checked);
				dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "CongShipVeVN_Them:ThemCongShipVeVN", StringEnum.GetStringValue(HanhDong.ThemMoi), "", "LoaiHang: " + ddLoaiHang.SelectedValue + "; LoaiTien: " + ddLoaiTien.SelectedItem.Text + "; TienCongShipVeVN: " + result + "; KhachBuon: " + cbKhachBuon.Checked);
			}
			else
			{
				dBConnect.CapNhatCongShipVeVN(Convert.ToInt32(Page.Request.QueryString["id"]), Convert.ToInt32(ddLoaiHang.SelectedValue), ddLoaiTien.SelectedItem.Text, result, cbKhachBuon.Checked);
				dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "CongShipVeVN_Them:CapNhatCongShipVeVN", StringEnum.GetStringValue(HanhDong.ChinhSua), Page.Request.QueryString["id"], "LoaiHang: " + ddLoaiHang.SelectedValue + "; LoaiTien: " + ddLoaiTien.SelectedItem.Text + "; TienCongShipVeVN: " + result + "; KhachBuon: " + cbKhachBuon.Checked);
			}
			Page.Response.Redirect("/admin/CongShipVeVN_LietKe.aspx");
		}
		catch (Exception)
		{
		}
	}
}
