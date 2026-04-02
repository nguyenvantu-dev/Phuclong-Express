using System;
using System.Linq;
using System.Web.UI;
using System.Web.UI.WebControls;
using OrderMan.Models;

namespace OrderMan;

public class ShipHang_LietKe : Page
{
	private int pageNum = 1;

	private int pageSize = 20;

	protected TextBox tbNoiDungTim;

	protected DropDownList ddUserName;

	protected DropDownList ddYeuCauGuiHang;

	protected Button btTimKiem;

	protected LinkButton lbtShip;

	protected GridView gvDonHang;

	protected ucPhanTrang myPager;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			myPager.BuildPaging(pageNum, -1, pageSize);
			LoadDataUser();
		}
	}

	private void LoadDanhSachDonHang()
	{
		BLL bLL = new BLL();
		DonHangPhanTrang donHangPhanTrang = bLL.LayDanhSachHangShip(ddUserName.SelectedValue, Convert.ToInt32(ddYeuCauGuiHang.SelectedValue), tbNoiDungTim.Text.Trim(), -1, pageSize, pageNum);
		gvDonHang.DataSource = donHangPhanTrang.DanhSachDonHang;
		gvDonHang.DataBind();
		myPager.BuildPaging(pageNum, donHangPhanTrang.TotalItem, pageSize);
	}

	private void LoadDataUser()
	{
		try
		{
			UserManager userManager = new UserManager();
			ddUserName.DataSource = userManager.Users.OrderBy((ApplicationUser u) => u.UserName).ToList();
			ddUserName.DataBind();
			ddUserName.Items.Insert(0, new ListItem("--All--", ""));
		}
		catch
		{
		}
	}

	protected void btTimKiem_Click(object sender, EventArgs e)
	{
		pageNum = 1;
		LoadDanhSachDonHang();
	}

	protected void myPager_PageChanged(object sender, EventArgs e)
	{
		pageNum = myPager.intPageIndex;
		LoadDanhSachDonHang();
	}

	protected void lbtShip_Click(object sender, EventArgs e)
	{
		string text = "";
		for (int i = 0; i < gvDonHang.Rows.Count; i++)
		{
			if (((CheckBox)gvDonHang.Rows[i].FindControl("SelectCheckBox")).Checked)
			{
				text = ((!string.IsNullOrEmpty(text)) ? (text + "," + gvDonHang.DataKeys[i]["ID"].ToString()) : gvDonHang.DataKeys[i]["ID"].ToString());
			}
		}
		if (!string.IsNullOrEmpty(text))
		{
			Page.Response.Redirect("/admin/ShipHang_TaoMoi.aspx?id=" + text + "&us=" + ddUserName.SelectedValue);
		}
	}
}
