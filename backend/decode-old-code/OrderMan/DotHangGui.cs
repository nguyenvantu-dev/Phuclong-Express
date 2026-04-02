using System;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;

namespace OrderMan;

public class DotHangGui : Page
{
	private int pageNum = 1;

	private int pageSize = 100;

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
			DotHangPhanTrang dotHangPhanTrang = bLL.LayDotHangGui("", pageSize, pageNum);
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

	protected void gvDotHangGui_RowCommand(object sender, GridViewCommandEventArgs e)
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			string[] array = e.CommandArgument.ToString().Split(';');
			if (dBConnect.CapNhatCompleteDotHang(array[0], array[1]))
			{
				dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "DotHangGui:CapNhatCompleteDotHang", StringEnum.GetStringValue(HanhDong.ChinhSua), "", "UserName: " + array[0] + "; TenDotHang: " + array[1]);
				LoadDanhSachDotHangGui();
			}
		}
		catch
		{
		}
	}
}
