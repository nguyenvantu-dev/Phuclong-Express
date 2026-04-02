using System;
using System.Linq;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;
using OrderMan.Models;

namespace OrderMan;

public class DanhMucKy_ChiTiet : Page
{
	private int pageNum = 1;

	private int pageSize = 200;

	protected Label lbLoi;

	protected DropDownList druser;

	protected DropDownList drTrangThai;

	protected DropDownList ddKy;

	protected Button tbTim;

	protected GridView gvChotKy;

	protected ucPhanTrang myPager;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			myPager.BuildPaging(pageNum, -1, pageSize);
			LoadDataUser();
			LoadDanhSachKy();
			if (int.TryParse(Page.Request.QueryString["id"], out var _))
			{
				LoadDanhSachChotKy();
			}
		}
	}

	private void LoadDataUser()
	{
		try
		{
			UserManager userManager = new UserManager();
			druser.DataSource = userManager.Users.OrderBy((ApplicationUser u) => u.UserName).ToList();
			druser.DataBind();
			druser.Items.Insert(0, new ListItem("--All--", ""));
		}
		catch
		{
		}
	}

	private void LoadDanhSachKy()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			ddKy.DataSource = dBConnect.LayDanhSachKy();
			ddKy.DataBind();
			ddKy.Items.Insert(0, new ListItem("--All--", "-1"));
			if (int.TryParse(Page.Request.QueryString["id"], out var result))
			{
				ddKy.ClearSelection();
				ListItem listItem = ddKy.Items.FindByValue(result.ToString());
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

	private void LoadDanhSachChotKy()
	{
		try
		{
			BLL bLL = new BLL();
			ChotKyPhanTrang chotKyPhanTrang = bLL.LayDanhSachChotKy(Convert.ToInt32(ddKy.SelectedItem.Value), druser.SelectedItem.Value, Convert.ToInt32(drTrangThai.SelectedItem.Value), pageSize, pageNum);
			gvChotKy.DataSource = chotKyPhanTrang.DanhSachChotKy;
			gvChotKy.DataBind();
			myPager.BuildPaging(pageNum, chotKyPhanTrang.TotalItem, pageSize);
		}
		catch
		{
		}
	}

	protected void tbTim_Click(object sender, EventArgs e)
	{
		LoadDanhSachChotKy();
	}

	protected void myPager_PageChanged(object sender, EventArgs e)
	{
		pageNum = myPager.intPageIndex;
		LoadDanhSachChotKy();
	}

	protected void gvChotKy_RowDataBound(object sender, GridViewRowEventArgs e)
	{
	}

	protected void gvChotKy_RowCommand(object sender, GridViewCommandEventArgs e)
	{
		try
		{
			if (e.CommandName == "TamMoKy")
			{
				DBConnect dBConnect = new DBConnect();
				int chotKyID = Convert.ToInt32(e.CommandArgument);
				switch (dBConnect.TamMoKy(chotKyID))
				{
				case 0:
					dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "DanhMucKy_ChiTiet:TamMoKy", StringEnum.GetStringValue(HanhDong.ChinhSua), chotKyID.ToString(), "Tạm mở kỳ ID: " + chotKyID);
					LoadDanhSachChotKy();
					break;
				case 1:
					base.Response.Write("<script>alert('Không được mở kỳ quá xa hiện tại');</script>");
					break;
				case -1:
					base.Response.Write("<script>alert('Có lỗi trong quá trình thực hiện. Vui lòng thực hiện lại');</script>");
					break;
				}
			}
			else if (e.CommandName == "DongKyMoTam")
			{
				DBConnect dBConnect2 = new DBConnect();
				int chotKyID2 = Convert.ToInt32(e.CommandArgument);
				switch (dBConnect2.DongKyMoTam(chotKyID2, base.User.Identity.GetUserName()))
				{
				case 0:
					dBConnect2.ThemSystemLogs(base.User.Identity.GetUserName(), "DanhMucKy_ChiTiet:DongKyMoTam", StringEnum.GetStringValue(HanhDong.ChinhSua), chotKyID2.ToString(), "Đóng kỳ mở tạm: " + chotKyID2);
					LoadDanhSachChotKy();
					break;
				case -1:
					base.Response.Write("<script>alert('Có lỗi trong quá trình thực hiện. Vui lòng thực hiện lại');</script>");
					break;
				}
			}
		}
		catch
		{
		}
	}
}
