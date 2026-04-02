using System;
using System.Collections.Generic;
using System.Globalization;
using System.Web.UI;

namespace OrderMan;

public class _Default : Page
{
	public ThongTinWeb ttw1;

	public ThongTinWeb ttw2;

	public ThongTinWeb ttw3;

	public List<WebLogo> lstWL;

	public string sDotHang = "";

	public string sNoConThieu = "";

	public int totalrow = 1;

	public NumberFormatInfo nfi = new CultureInfo("vi-VN", useUserOverride: false).NumberFormat;

	protected ucTraCuuTracking ucTraCuuTracking1;

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
			totalrow = lstWL.Count / 5 + 1;
		}
	}
}
