using System;
using System.Collections.Generic;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace OrderMan;

public class WebLogo_LietKe : Page
{
	protected GridView gvWebLogo;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			LoadDanhSachWebLogo();
		}
	}

	private void LoadDanhSachWebLogo()
	{
		BLL bLL = new BLL();
		List<WebLogo> dataSource = bLL.LayDanhSachWebLogo();
		gvWebLogo.DataSource = dataSource;
		gvWebLogo.DataBind();
	}

	protected void gvWebLogo_RowDeleting(object sender, GridViewDeleteEventArgs e)
	{
		try
		{
			int iD = Convert.ToInt32(gvWebLogo.DataKeys[e.RowIndex]["ID"]);
			DBConnect dBConnect = new DBConnect();
			if (dBConnect.XoaWebLogo(iD))
			{
				LoadDanhSachWebLogo();
			}
		}
		catch
		{
		}
	}
}
