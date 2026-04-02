using System;
using System.Web.UI;
using Microsoft.AspNet.Identity;

namespace OrderMan;

public class DatHangKhoan : Page
{
	public bool bDaDangNhap = false;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack && !string.IsNullOrEmpty(base.User.Identity.GetUserName()))
		{
			bDaDangNhap = true;
		}
	}
}
