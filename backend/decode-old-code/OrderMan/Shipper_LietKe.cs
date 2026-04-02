using System;
using System.Collections.Generic;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;

namespace OrderMan;

public class Shipper_LietKe : Page
{
	protected GridView gvShipper;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			LoadDanhSachShipper();
		}
	}

	private void LoadDanhSachShipper()
	{
		BLL bLL = new BLL();
		List<Shipper> dataSource = bLL.LayDanhSachShipper();
		gvShipper.DataSource = dataSource;
		gvShipper.DataBind();
	}

	protected void gvShipper_RowDeleting(object sender, GridViewDeleteEventArgs e)
	{
		try
		{
			int iD = Convert.ToInt32(gvShipper.DataKeys[e.RowIndex]["ID"]);
			DBConnect dBConnect = new DBConnect();
			if (dBConnect.XoaShipper(iD))
			{
				dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "Shipper_LietKe:XoaShipper", StringEnum.GetStringValue(HanhDong.Xoa), "", "ID: " + iD);
				LoadDanhSachShipper();
			}
		}
		catch
		{
		}
	}
}
