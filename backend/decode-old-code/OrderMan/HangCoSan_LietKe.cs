using System;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;

namespace OrderMan;

public class HangCoSan_LietKe : Page
{
	private int pageNum = 1;

	private int pageSize = 20;

	protected TextBox tbNoiDungTim;

	protected Button btTimKiem;

	protected GridView gvHangCoSan;

	protected ucPhanTrang myPager;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			myPager.BuildPaging(pageNum, -1, pageSize);
			LoadDanhSachHangCoSan();
		}
	}

	private void LoadDanhSachHangCoSan()
	{
		BLL bLL = new BLL();
		HangCoSanPhanTrang hangCoSanPhanTrang = bLL.LayDanhSachHangCoSanPhanTrang(tbNoiDungTim.Text.Trim(), pageSize, pageNum);
		gvHangCoSan.DataSource = hangCoSanPhanTrang.DanhSachHangCoSan;
		gvHangCoSan.DataBind();
		myPager.BuildPaging(pageNum, hangCoSanPhanTrang.TotalItem, pageSize);
	}

	protected void gvHangCoSan_RowDeleting(object sender, GridViewDeleteEventArgs e)
	{
		try
		{
			int iD = Convert.ToInt32(gvHangCoSan.DataKeys[e.RowIndex]["ID"]);
			DBConnect dBConnect = new DBConnect();
			if (dBConnect.XoaHangCoSan(iD))
			{
				dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "HangCoSan_LietKe:XoaHangCoSan", StringEnum.GetStringValue(HanhDong.Xoa), iD.ToString(), "ID: " + iD);
				LoadDanhSachHangCoSan();
			}
		}
		catch
		{
		}
	}

	protected void myPager_PageChanged(object sender, EventArgs e)
	{
		pageNum = myPager.intPageIndex;
		LoadDanhSachHangCoSan();
	}

	protected void btTimKiem_Click(object sender, EventArgs e)
	{
		pageNum = 1;
		LoadDanhSachHangCoSan();
	}
}
