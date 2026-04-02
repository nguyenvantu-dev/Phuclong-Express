using System;
using System.Linq;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;
using OrderMan.Models;

namespace OrderMan;

public class HoiDapAdmin : Page
{
	private int pageNum = 1;

	private int pageSize = 20;

	protected DropDownList ddDaTraLoi;

	protected DropDownList ddUserName;

	protected Button btTimKiem;

	protected GridView gvThacMac;

	protected ucPhanTrang myPager;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			myPager.BuildPaging(pageNum, -1, pageSize);
			LoadDataUser();
		}
	}

	private void LoadDataUser()
	{
		try
		{
			UserManager userManager = new UserManager();
			ddUserName.DataSource = userManager.Users.ToList();
			ddUserName.DataBind();
			ddUserName.Items.Insert(0, new ListItem("--All--", ""));
		}
		catch
		{
		}
	}

	private void LoadDanhSachThacMac()
	{
		BLL bLL = new BLL();
		ThacMacPhanTrang thacMacPhanTrang = bLL.LayDanhSachThacMac(ddUserName.SelectedValue, Convert.ToInt32(ddDaTraLoi.SelectedValue), pageSize, pageNum);
		gvThacMac.DataSource = thacMacPhanTrang.DanhSachThacMac;
		gvThacMac.DataBind();
		myPager.BuildPaging(pageNum, thacMacPhanTrang.TotalItem, pageSize);
	}

	protected void myPager_PageChanged(object sender, EventArgs e)
	{
		pageNum = myPager.intPageIndex;
		LoadDanhSachThacMac();
	}

	protected void gvThacMac_RowEditing(object sender, GridViewEditEventArgs e)
	{
		try
		{
			gvThacMac.EditIndex = e.NewEditIndex;
			LoadDanhSachThacMac();
		}
		catch (Exception)
		{
		}
	}

	protected void gvThacMac_RowUpdating(object sender, GridViewUpdateEventArgs e)
	{
		try
		{
			int iD = Convert.ToInt32(gvThacMac.DataKeys[e.RowIndex]["ID"]);
			TextBox textBox = gvThacMac.Rows[e.RowIndex].FindControl("tbgvTraLoi") as TextBox;
			DBConnect dBConnect = new DBConnect();
			dBConnect.CapNhatTraLoiThacMac(iD, textBox.Text.Trim());
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "HoiDapAdmin:CapNhatTraLoiThacMac", StringEnum.GetStringValue(HanhDong.ChinhSua), iD.ToString(), "ID: " + iD + "; TraLoi: " + textBox.Text.Trim());
			gvThacMac.EditIndex = -1;
			LoadDanhSachThacMac();
		}
		catch (Exception)
		{
		}
	}

	protected void gvThacMac_RowCancelingEdit(object sender, GridViewCancelEditEventArgs e)
	{
		gvThacMac.EditIndex = -1;
		LoadDanhSachThacMac();
	}

	protected void btTimKiem_Click(object sender, EventArgs e)
	{
		pageNum = 1;
		LoadDanhSachThacMac();
	}

	protected void gvThacMac_RowDeleting(object sender, GridViewDeleteEventArgs e)
	{
		try
		{
			int iD = Convert.ToInt32(gvThacMac.DataKeys[e.RowIndex]["ID"]);
			DBConnect dBConnect = new DBConnect();
			if (dBConnect.XoaThacMac(iD))
			{
				dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "HoiDapAdmin:XoaThacMac", StringEnum.GetStringValue(HanhDong.Xoa), iD.ToString(), "ID: " + iD);
				LoadDanhSachThacMac();
			}
		}
		catch
		{
		}
	}
}
