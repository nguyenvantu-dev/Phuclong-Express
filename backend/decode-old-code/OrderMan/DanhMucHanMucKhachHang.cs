using System;
using System.Linq;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;
using OrderMan.Models;

namespace OrderMan;

public class DanhMucHanMucKhachHang : Page
{
	private int pageNum = 1;

	private int pageSize = 20;

	protected Label lbLoi;

	protected DropDownList drUserName;

	protected CheckBox cbDaQuaHanMuc;

	protected CheckBox cbLaKhachVip;

	protected Button btDongY;

	protected TextBox tbUsername;

	protected Button tbTim;

	protected GridView gvHanMucKhachHang;

	protected ucPhanTrang myPager;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			myPager.BuildPaging(pageNum, -1, pageSize);
			LoadDataUser();
			LoadDanhSachHanMucKhachHang();
		}
	}

	private void LoadDataUser()
	{
		try
		{
			UserManager userManager = new UserManager();
			drUserName.DataSource = userManager.Users.OrderBy((ApplicationUser u) => u.UserName).ToList();
			drUserName.DataBind();
		}
		catch
		{
		}
	}

	protected void btDongY_Click(object sender, EventArgs e)
	{
		DBConnect dBConnect = new DBConnect();
		if (dBConnect.ThemHanMucKhachHang(drUserName.SelectedItem.Text.Trim(), cbDaQuaHanMuc.Checked, cbLaKhachVip.Checked))
		{
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "DanhMucHanMucKhachHang:ThemHanMucKhachHang", StringEnum.GetStringValue(HanhDong.ThemMoi), "", "UserName: " + drUserName.SelectedItem.Text.Trim() + "; DaQuaHanMuc: " + cbDaQuaHanMuc.Checked + "; LaKhachVip: " + cbLaKhachVip.Checked);
			lbLoi.Text = "Đã thêm thành công";
		}
		else
		{
			lbLoi.Text = "Có lỗi trong quá trình thao tác !!!";
		}
		LoadDanhSachHanMucKhachHang();
	}

	private void LoadDanhSachHanMucKhachHang()
	{
		try
		{
			BLL bLL = new BLL();
			HanMucKhachHangPhanTrang hanMucKhachHangPhanTrang = bLL.LayDanhSachHanMucKhachHang(tbUsername.Text.Trim(), pageSize, pageNum);
			gvHanMucKhachHang.DataSource = hanMucKhachHangPhanTrang.DanhSachHanMucKhachHang;
			gvHanMucKhachHang.DataBind();
			myPager.BuildPaging(pageNum, hanMucKhachHangPhanTrang.TotalItem, pageSize);
		}
		catch
		{
		}
	}

	protected void tbTim_Click(object sender, EventArgs e)
	{
		LoadDanhSachHanMucKhachHang();
	}

	protected void myPager_PageChanged(object sender, EventArgs e)
	{
		pageNum = myPager.intPageIndex;
		LoadDanhSachHanMucKhachHang();
	}

	protected void gvHanMucKhachHang_RowEditing(object sender, GridViewEditEventArgs e)
	{
		try
		{
			gvHanMucKhachHang.EditIndex = e.NewEditIndex;
			LoadDanhSachHanMucKhachHang();
		}
		catch (Exception)
		{
		}
	}

	protected void gvHanMucKhachHang_RowUpdating(object sender, GridViewUpdateEventArgs e)
	{
		try
		{
			int iD = Convert.ToInt32(gvHanMucKhachHang.DataKeys[e.RowIndex]["ID"]);
			CheckBox checkBox = gvHanMucKhachHang.Rows[e.RowIndex].FindControl("cbgvDaQuaHanMuc") as CheckBox;
			CheckBox checkBox2 = gvHanMucKhachHang.Rows[e.RowIndex].FindControl("cbgvLaKhachVip") as CheckBox;
			DBConnect dBConnect = new DBConnect();
			if (dBConnect.CapNhatHanMucKhachHang(iD, checkBox.Checked, checkBox2.Checked))
			{
				dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "DanhMucHanMucKhachHang:CapNhatHanMucKhachHang", StringEnum.GetStringValue(HanhDong.ChinhSua), iD.ToString(), "DaQuaHanMuc: " + cbDaQuaHanMuc.Checked + "; LaKhachVip: " + cbLaKhachVip.Checked);
				gvHanMucKhachHang.EditIndex = -1;
				LoadDanhSachHanMucKhachHang();
			}
		}
		catch (Exception)
		{
		}
	}

	protected void gvHanMucKhachHang_RowCancelingEdit(object sender, GridViewCancelEditEventArgs e)
	{
		gvHanMucKhachHang.EditIndex = -1;
		LoadDanhSachHanMucKhachHang();
	}

	protected void gvHanMucKhachHang_RowDeleting(object sender, GridViewDeleteEventArgs e)
	{
		try
		{
			int iD = Convert.ToInt32(gvHanMucKhachHang.DataKeys[e.RowIndex]["ID"]);
			DBConnect dBConnect = new DBConnect();
			if (dBConnect.XoaHanMucKhachHang(iD))
			{
				dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "DanhMucHanMucKhachHang:XoaHanMucKhachHang", StringEnum.GetStringValue(HanhDong.Xoa), iD.ToString(), "ID: " + iD);
				LoadDanhSachHanMucKhachHang();
			}
		}
		catch
		{
		}
	}
}
