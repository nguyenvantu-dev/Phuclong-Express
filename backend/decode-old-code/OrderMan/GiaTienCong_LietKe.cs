using System;
using System.Collections.Generic;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;

namespace OrderMan;

public class GiaTienCong_LietKe : Page
{
	protected GridView gvGiaTienCong;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			LoadDanhSachGiaTienCong();
		}
	}

	private void LoadDanhSachGiaTienCong()
	{
		BLL bLL = new BLL();
		List<GiaTienCong> dataSource = bLL.LayDanhSachGiaTienCong();
		gvGiaTienCong.DataSource = dataSource;
		gvGiaTienCong.DataBind();
	}

	protected void gvGiaTienCong_RowDeleting(object sender, GridViewDeleteEventArgs e)
	{
		try
		{
			int iD = Convert.ToInt32(gvGiaTienCong.DataKeys[e.RowIndex]["ID"]);
			DBConnect dBConnect = new DBConnect();
			if (dBConnect.XoaGiaTienCong(iD))
			{
				dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "GiaTienCong_LietKe:XoaGiaTienCong", StringEnum.GetStringValue(HanhDong.Xoa), gvGiaTienCong.DataKeys[e.RowIndex]["ID"].ToString(), "ID: " + gvGiaTienCong.DataKeys[e.RowIndex]["ID"].ToString());
				LoadDanhSachGiaTienCong();
			}
		}
		catch
		{
		}
	}
}
