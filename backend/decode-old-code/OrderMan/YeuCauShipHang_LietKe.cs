using System;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;

namespace OrderMan;

public class YeuCauShipHang_LietKe : Page
{
	private int pageNum = 1;

	private int pageSize = 20;

	protected GridView gvDonHang;

	protected TextBox tbGhiChuKhiYeuCau;

	protected Button btShip;

	protected GridView gvDangYeuCauGui;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			ReloadData();
		}
	}

	private void ReloadData()
	{
		LoadDanhSachDonHang();
		LoadDanhSachHangDangYeuCau();
	}

	private void LoadDanhSachDonHang()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			gvDonHang.DataSource = dBConnect.LayDotHangYeuCauShip(base.User.Identity.GetUserName(), 0);
			gvDonHang.DataBind();
		}
		catch
		{
		}
	}

	protected void btShip_Click(object sender, EventArgs e)
	{
		bool flag = false;
		DBConnect dBConnect = new DBConnect();
		for (int i = 0; i < gvDonHang.Rows.Count; i++)
		{
			if (((CheckBox)gvDonHang.Rows[i].FindControl("SelectCheckBox")).Checked)
			{
				dBConnect.CapNhatYeuCauShipHang(gvDonHang.DataKeys[i]["TenDotHang"].ToString(), gvDonHang.DataKeys[i]["UserName"].ToString(), tbGhiChuKhiYeuCau.Text.Trim());
				flag = true;
			}
		}
		if (flag)
		{
			ReloadData();
		}
	}

	private void LoadDanhSachHangDangYeuCau()
	{
		DBConnect dBConnect = new DBConnect();
		gvDangYeuCauGui.DataSource = dBConnect.LayDotHangYeuCauShip(base.User.Identity.GetUserName(), 1);
		gvDangYeuCauGui.DataBind();
	}
}
