using System;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;

namespace OrderMan;

public class DotHangUser : Page
{
	private int pageNum = 1;

	private int pageSize = 20;

	protected GridView gvDotHangGui;

	protected ucPhanTrang myPager;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			myPager.BuildPaging(pageNum, -1, pageSize);
			LoadDanhSachDotHangGui();
		}
	}

	private void LoadDanhSachDotHangGui()
	{
		try
		{
			BLL bLL = new BLL();
			DotHangPhanTrang dotHangPhanTrang = bLL.LayDotHangGui(base.User.Identity.GetUserName(), pageSize, pageNum);
			gvDotHangGui.DataSource = dotHangPhanTrang.DanhSachDotHang;
			gvDotHangGui.DataBind();
			myPager.BuildPaging(pageNum, dotHangPhanTrang.TotalItem, pageSize);
		}
		catch
		{
		}
	}

	protected void myPager_PageChanged(object sender, EventArgs e)
	{
		pageNum = myPager.intPageIndex;
		LoadDanhSachDotHangGui();
	}
}
