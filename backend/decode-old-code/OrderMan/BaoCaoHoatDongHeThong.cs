using System;
using System.Linq;
using System.Web.UI;
using System.Web.UI.WebControls;
using OrderMan.Models;

namespace OrderMan;

public class BaoCaoHoatDongHeThong : Page
{
	private int pageNum = 1;

	private int pageSize = 50;

	protected TextBox tbTuNgay;

	protected TextBox tbDenNgay;

	protected DropDownList druser;

	protected DropDownList ddHanhDong;

	protected TextBox tbNguon;

	protected TextBox tbDoiTuong;

	protected TextBox tbNoiDung;

	protected Button tbTim;

	protected GridView gvSystemLogs;

	protected ucPhanTrang myPager;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			myPager.BuildPaging(pageNum, -1, pageSize);
			KhoiTaoNgay();
			LoadDataUser();
		}
	}

	private void KhoiTaoNgay()
	{
		try
		{
			DateTime dateTime = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
			DateTime dateTime2 = dateTime.AddMonths(1).AddDays(-1.0);
			tbTuNgay.Text = dateTime.ToString("dd/MM/yyyy");
			tbDenNgay.Text = dateTime2.ToString("dd/MM/yyyy");
		}
		catch
		{
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

	private void LoadDanhSachSystemLogs()
	{
		try
		{
			DateTime? datetimeFromStr = DateTimeUtil.getDatetimeFromStr(tbTuNgay.Text.Trim());
			DateTime? datetimeFromStr2 = DateTimeUtil.getDatetimeFromStr(tbDenNgay.Text.Trim());
			BLL bLL = new BLL();
			KetQuaTimKiemSystemLogs ketQuaTimKiemSystemLogs = bLL.TimKiemSystemLogs(druser.SelectedItem.Value, tbNguon.Text.Trim(), ddHanhDong.SelectedValue, tbDoiTuong.Text.Trim(), tbNoiDung.Text.Trim(), datetimeFromStr, datetimeFromStr2, pageSize, pageNum);
			gvSystemLogs.DataSource = ketQuaTimKiemSystemLogs.DanhSachSystemLogs;
			gvSystemLogs.DataBind();
			myPager.BuildPaging(pageNum, ketQuaTimKiemSystemLogs.TotalItem, pageSize);
		}
		catch
		{
		}
	}

	protected void tbTim_Click(object sender, EventArgs e)
	{
		LoadDanhSachSystemLogs();
	}

	protected void myPager_PageChanged(object sender, EventArgs e)
	{
		pageNum = myPager.intPageIndex;
		LoadDanhSachSystemLogs();
	}
}
