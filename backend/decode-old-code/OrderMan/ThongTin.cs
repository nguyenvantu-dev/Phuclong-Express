using System;
using System.Web.UI;

namespace OrderMan;

public class ThongTin : Page
{
	public ThongTinWeb ttw;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack && int.TryParse(Page.Request.QueryString["id"], out var _))
		{
			LoadDataThongTinWeb();
		}
	}

	private void LoadDataThongTinWeb()
	{
		BLL bLL = new BLL();
		ttw = bLL.LayThongTinWebByID(Convert.ToInt32(Page.Request.QueryString["id"]));
	}
}
