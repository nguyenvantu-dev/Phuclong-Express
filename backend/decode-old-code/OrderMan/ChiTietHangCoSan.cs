using System;
using System.Web.Script.Serialization;
using System.Web.UI;
using Microsoft.AspNet.Identity;

namespace OrderMan;

public class ChiTietHangCoSan : Page
{
	public HangCoSan itemHCS;

	public string jsonHCS;

	public int iDaDangNhap = 0;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			if (!string.IsNullOrEmpty(base.User.Identity.GetUserName()))
			{
				iDaDangNhap = 1;
			}
			if (int.TryParse(Page.Request.QueryString["id"], out var result))
			{
				LayHangCoSan(result);
			}
		}
	}

	private void LayHangCoSan(int ID)
	{
		BLL bLL = new BLL();
		itemHCS = bLL.LayHangCoSanByID(ID);
		jsonHCS = new JavaScriptSerializer().Serialize(itemHCS);
	}
}
