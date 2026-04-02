using System;
using System.Collections.Generic;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;

namespace OrderMan;

public class CongShipVeVN_LietKe : Page
{
	protected GridView gvCongShipVeVN;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			LoadDanhSachCongShipVeVN();
		}
	}

	private void LoadDanhSachCongShipVeVN()
	{
		BLL bLL = new BLL();
		List<CongShipVeVN> dataSource = bLL.LayDanhSachCongShipVeVN();
		gvCongShipVeVN.DataSource = dataSource;
		gvCongShipVeVN.DataBind();
	}

	protected void gvCongShipVeVN_RowDeleting(object sender, GridViewDeleteEventArgs e)
	{
		try
		{
			int iD = Convert.ToInt32(gvCongShipVeVN.DataKeys[e.RowIndex]["ID"]);
			DBConnect dBConnect = new DBConnect();
			if (dBConnect.XoaCongShipVeVN(iD))
			{
				dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "CongShipVeVN_LietKe:XoaCongShipVeVN", StringEnum.GetStringValue(HanhDong.Xoa), "", "ID: " + iD);
				LoadDanhSachCongShipVeVN();
			}
		}
		catch
		{
		}
	}
}
