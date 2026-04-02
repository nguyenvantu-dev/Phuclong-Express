using System;
using System.Collections.Generic;
using System.Web.UI;

namespace OrderMan;

public class CacTrangWebHay : Page
{
	public List<WebLogo> lstWL;

	public int totalrow = 1;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			LoadDataWebLogo();
		}
	}

	private void LoadDataWebLogo()
	{
		BLL bLL = new BLL();
		lstWL = bLL.LayDanhSachWebLogo();
		if (lstWL != null)
		{
			totalrow = lstWL.Count / 3 + 1;
		}
	}
}
