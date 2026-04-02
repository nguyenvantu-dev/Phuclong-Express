using System;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;

namespace OrderMan;

public class HoiDap : Page
{
	private int pageNum = 1;

	private int pageSize = 20;

	protected Literal ErrorMessage;

	protected TextBox tbCauHoi;

	protected Button btTaoCauHoi;

	protected GridView gvThacMac;

	protected ucPhanTrang myPager;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			myPager.BuildPaging(pageNum, -1, pageSize);
			LoadDanhSachThacMac();
		}
	}

	private void LoadDanhSachThacMac()
	{
		BLL bLL = new BLL();
		ThacMacPhanTrang thacMacPhanTrang = bLL.LayDanhSachThacMac(base.User.Identity.GetUserName(), -1, pageSize, pageNum);
		gvThacMac.DataSource = thacMacPhanTrang.DanhSachThacMac;
		gvThacMac.DataBind();
		myPager.BuildPaging(pageNum, thacMacPhanTrang.TotalItem, pageSize);
	}

	protected void myPager_PageChanged(object sender, EventArgs e)
	{
		pageNum = myPager.intPageIndex;
		LoadDanhSachThacMac();
	}

	protected void btTaoCauHoi_Click(object sender, EventArgs e)
	{
		if (string.IsNullOrEmpty(tbCauHoi.Text.Trim()))
		{
			ErrorMessage.Text = "Vui lòng nhập câu hỏi";
			return;
		}
		DBConnect dBConnect = new DBConnect();
		if (dBConnect.ThemThacMac(base.User.Identity.GetUserName(), tbCauHoi.Text.Trim()))
		{
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "HoiDap:ThemThacMac", StringEnum.GetStringValue(HanhDong.ThemMoi), "", "CauHoi: " + tbCauHoi.Text.Trim());
			tbCauHoi.Text = "";
			LoadDanhSachThacMac();
		}
	}
}
