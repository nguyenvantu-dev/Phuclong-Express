using System;
using System.Linq;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;
using OrderMan.Models;

namespace OrderMan;

public class DanhMucDiaChiNhanHang : Page
{
	private int pageNum = 1;

	private int pageSize = 20;

	protected Label lbLoi;

	protected DropDownList drUserName;

	protected TextBox tbDiaChi;

	protected Button btDongY;

	protected DropDownList druser;

	protected TextBox tbNoiDungTim;

	protected Button tbTim;

	protected GridView gvDiaChiNhanHang;

	protected ucPhanTrang myPager;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			myPager.BuildPaging(pageNum, -1, pageSize);
			LoadDataUser();
			LoadDanhSachDiaChiNhanHang();
		}
	}

	private void LoadDataUser()
	{
		try
		{
			UserManager userManager = new UserManager();
			drUserName.DataSource = userManager.Users.OrderBy((ApplicationUser u) => u.UserName).ToList();
			drUserName.DataBind();
			druser.DataSource = userManager.Users.OrderBy((ApplicationUser u) => u.UserName).ToList();
			druser.DataBind();
			druser.Items.Insert(0, new ListItem("--All--", ""));
		}
		catch
		{
		}
	}

	private void LoadDataUser(DropDownList ddgvUserName, string Selecteditemvalue)
	{
		try
		{
			UserManager userManager = new UserManager();
			ddgvUserName.DataSource = userManager.Users.OrderBy((ApplicationUser u) => u.UserName).ToList();
			ddgvUserName.DataBind();
			if (!string.IsNullOrEmpty(Selecteditemvalue))
			{
				ddgvUserName.ClearSelection();
				ListItem listItem = ddgvUserName.Items.FindByValue(Selecteditemvalue);
				if (listItem != null)
				{
					listItem.Selected = true;
				}
			}
		}
		catch
		{
		}
	}

	protected void btDongY_Click(object sender, EventArgs e)
	{
		bool flag = true;
		DBConnect dBConnect = new DBConnect();
		if (dBConnect.ThemDiaChiNhanHang(drUserName.SelectedItem.Text.Trim(), tbDiaChi.Text.Trim()))
		{
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "DanhMucDiaChiNhanHang:ThemDiaChiNhanHang", StringEnum.GetStringValue(HanhDong.ThemMoi), "", "UserName: " + drUserName.SelectedItem.Text.Trim() + "; DiaChi: " + tbDiaChi.Text.Trim());
			lbLoi.Text = "Đã thêm thành công";
		}
		else
		{
			lbLoi.Text = "Có lỗi!!!!";
		}
		LoadDanhSachDiaChiNhanHang();
	}

	private void LoadDanhSachDiaChiNhanHang()
	{
		try
		{
			BLL bLL = new BLL();
			DiaChiNhanHangPhanTrang diaChiNhanHangPhanTrang = bLL.LayDanhSachDiaChiNhanHang(druser.SelectedItem.Value, tbNoiDungTim.Text, pageSize, pageNum);
			gvDiaChiNhanHang.DataSource = diaChiNhanHangPhanTrang.DanhSachDiaChiNhanHang;
			gvDiaChiNhanHang.DataBind();
			myPager.BuildPaging(pageNum, diaChiNhanHangPhanTrang.TotalItem, pageSize);
		}
		catch
		{
		}
	}

	protected void tbTim_Click(object sender, EventArgs e)
	{
		LoadDanhSachDiaChiNhanHang();
	}

	protected void myPager_PageChanged(object sender, EventArgs e)
	{
		pageNum = myPager.intPageIndex;
		LoadDanhSachDiaChiNhanHang();
	}

	protected void gvDiaChiNhanHang_RowEditing(object sender, GridViewEditEventArgs e)
	{
		try
		{
			gvDiaChiNhanHang.EditIndex = e.NewEditIndex;
			LoadDanhSachDiaChiNhanHang();
		}
		catch (Exception)
		{
		}
	}

	protected void gvDiaChiNhanHang_RowUpdating(object sender, GridViewUpdateEventArgs e)
	{
		try
		{
			int iD = Convert.ToInt32(gvDiaChiNhanHang.DataKeys[e.RowIndex]["ID"]);
			DropDownList dropDownList = gvDiaChiNhanHang.Rows[e.RowIndex].FindControl("ddgvUserName") as DropDownList;
			TextBox textBox = gvDiaChiNhanHang.Rows[e.RowIndex].FindControl("tbgvDiaChi") as TextBox;
			DBConnect dBConnect = new DBConnect();
			if (dBConnect.CapNhatDiaChiNhanHang(iD, dropDownList.SelectedItem.Text.Trim(), textBox.Text.Trim()))
			{
				dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "DanhMucDiaChiNhanHang:CapNhatDiaChiNhanHang", StringEnum.GetStringValue(HanhDong.ChinhSua), iD.ToString(), "UserName: " + drUserName.SelectedItem.Text.Trim() + "; DiaChi: " + tbDiaChi.Text.Trim());
				gvDiaChiNhanHang.EditIndex = -1;
				LoadDanhSachDiaChiNhanHang();
			}
		}
		catch (Exception)
		{
		}
	}

	protected void gvDiaChiNhanHang_RowCancelingEdit(object sender, GridViewCancelEditEventArgs e)
	{
		gvDiaChiNhanHang.EditIndex = -1;
		LoadDanhSachDiaChiNhanHang();
	}

	protected void gvDiaChiNhanHang_RowDeleting(object sender, GridViewDeleteEventArgs e)
	{
		try
		{
			int iD = Convert.ToInt32(gvDiaChiNhanHang.DataKeys[e.RowIndex]["ID"]);
			DBConnect dBConnect = new DBConnect();
			if (dBConnect.XoaDiaChiNhanHang(iD))
			{
				dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "DanhMucDiaChiNhanHang:XoaDiaChiNhanHang", StringEnum.GetStringValue(HanhDong.Xoa), iD.ToString(), "ID: " + iD);
				LoadDanhSachDiaChiNhanHang();
			}
		}
		catch
		{
		}
	}

	protected void gvDiaChiNhanHang_RowDataBound(object sender, GridViewRowEventArgs e)
	{
		if (e.Row.RowType == DataControlRowType.DataRow && (e.Row.RowState & DataControlRowState.Edit) == DataControlRowState.Edit)
		{
			DropDownList ddgvUserName = (DropDownList)e.Row.FindControl("ddgvUserName");
			LoadDataUser(ddgvUserName, ((DiaChiNhanHang)e.Row.DataItem).UserName);
		}
	}
}
