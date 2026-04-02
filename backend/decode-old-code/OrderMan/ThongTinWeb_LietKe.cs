using System;
using System.Collections.Generic;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace OrderMan;

public class ThongTinWeb_LietKe : Page
{
	protected GridView gvThongTinWeb;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			LoadDanhSachThongTinWeb();
		}
	}

	private void LoadDanhSachThongTinWeb()
	{
		BLL bLL = new BLL();
		List<ThongTinWeb> dataSource = bLL.LayDanhSachThongTinWeb();
		gvThongTinWeb.DataSource = dataSource;
		gvThongTinWeb.DataBind();
	}
}
